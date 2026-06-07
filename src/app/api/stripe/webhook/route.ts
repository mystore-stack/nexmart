import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendPaymentReceivedNotification } from "@/lib/notifications/service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[STRIPE_WEBHOOK] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Check idempotency - if event already processed, ignore
  const existingEvent = await prisma.stripeWebhookEvent.findUnique({
    where: { eventId: event.id },
  });

  if (existingEvent) {
    console.log("[STRIPE_WEBHOOK] Event already processed:", event.id);
    return NextResponse.json({ received: true, idempotent: true }, { status: 200 });
  }

  console.log("[STRIPE_WEBHOOK] Processing event:", event.type, event.id);

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event);
        break;
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event);
        break;
      default:
        console.log("[STRIPE_WEBHOOK] Unhandled event type:", event.type);
    }

    // Store processed event
    await prisma.stripeWebhookEvent.create({
      data: {
        eventId: event.id,
        type: event.type,
        metadata: event.data.object as any,
      },
    });

    console.log("[STRIPE_WEBHOOK] Event processed successfully:", event.id);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[STRIPE_WEBHOOK] Error processing event:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const paymentIntentId = paymentIntent.id;

  console.log("[STRIPE_WEBHOOK] Payment succeeded:", paymentIntentId);

  // Find order by stripePaymentId
  const order = await prisma.order.findFirst({
    where: { stripePaymentId: paymentIntentId },
  });

  if (!order) {
    console.error("[STRIPE_WEBHOOK] Order not found for payment intent:", paymentIntentId);
    return;
  }

  // Update order status
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    });

    // Confirm reservations for this order
    const reservations = await tx.inventoryReservation.findMany({
      where: {
        orderId: order.id,
        status: "RESERVED",
      },
    });

    if (reservations.length > 0) {
      for (const reservation of reservations) {
        await tx.inventoryReservation.update({
          where: { id: reservation.id },
          data: { status: "CONFIRMED" },
        });
      }

      // Deduct stock after confirming reservations
      for (const reservation of reservations) {
        if (reservation.variantId) {
          await tx.productVariant.update({
            where: { id: reservation.variantId },
            data: { stock: { decrement: reservation.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: reservation.productId },
            data: {
              stock: { decrement: reservation.quantity },
              soldCount: { increment: reservation.quantity },
            },
          });
        }
      }

      console.log("[STRIPE_WEBHOOK] Confirmed reservations and deducted stock:", reservations.length);
    }
  });

  // Store event with order reference
  await prisma.stripeWebhookEvent.update({
    where: { eventId: event.id },
    data: { orderId: order.id },
  });

  console.log("[STRIPE_WEBHOOK] Order updated to PAID + CONFIRMED:", order.orderNumber);

  // Send payment received notification
  sendPaymentReceivedNotification(order).catch((err) => {
    console.error("[STRIPE_WEBHOOK] Failed to send notification:", err);
  });
}

async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const paymentIntentId = paymentIntent.id;

  console.log("[STRIPE_WEBHOOK] Payment failed:", paymentIntentId);

  // Find order by stripePaymentId
  const order = await prisma.order.findFirst({
    where: { stripePaymentId: paymentIntentId },
  });

  if (!order) {
    console.error("[STRIPE_WEBHOOK] Order not found for payment intent:", paymentIntentId);
    return;
  }

  // Update order status and release reservations
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "FAILED",
        status: "PENDING",
      },
    });

    // Release reservations for this order
    const reservations = await tx.inventoryReservation.findMany({
      where: {
        orderId: order.id,
        status: "RESERVED",
      },
    });

    if (reservations.length > 0) {
      for (const reservation of reservations) {
        await tx.inventoryReservation.update({
          where: { id: reservation.id },
          data: { status: "RELEASED" },
        });
      }

      console.log("[STRIPE_WEBHOOK] Released reservations:", reservations.length);
    }
  });

  // Store event with order reference
  await prisma.stripeWebhookEvent.update({
    where: { eventId: event.id },
    data: { orderId: order.id },
  });

  console.log("[STRIPE_WEBHOOK] Order updated to FAILED + PENDING:", order.orderNumber);
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const paymentIntentId = session.payment_intent as string;

  console.log("[STRIPE_WEBHOOK] Checkout session completed:", session.id);

  if (!paymentIntentId) {
    console.error("[STRIPE_WEBHOOK] No payment intent in checkout session");
    return;
  }

  // Find order by stripePaymentId
  const order = await prisma.order.findFirst({
    where: { stripePaymentId: paymentIntentId },
  });

  if (!order) {
    console.error("[STRIPE_WEBHOOK] Order not found for checkout session:", session.id);
    return;
  }

  // Update order status
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
    },
  });

  // Store event with order reference
  await prisma.stripeWebhookEvent.update({
    where: { eventId: event.id },
    data: { orderId: order.id },
  });

  console.log("[STRIPE_WEBHOOK] Order updated to PAID + CONFIRMED:", order.orderNumber);
}
