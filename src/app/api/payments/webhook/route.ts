// src/app/api/payments/webhook/route.ts
import { NextRequest } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { queueNotification } from "@/lib/queues";
import { ok, error } from "@/lib/api";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) return error("Missing signature", 400);

  let event;
  try {
    event = await constructWebhookEvent(body, signature);
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return error(`Webhook error: ${err.message}`, 400);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as any;
        const orderId = intent.metadata?.orderId;
        const organizationId = intent.metadata?.organizationId;

        if (orderId && organizationId) {
          const order = await prisma.order.update({
            where: { id: orderId, organizationId },
            data: { paymentStatus: PaymentStatus.PAID, status: OrderStatus.CONFIRMED },
            include: { user: true },
          });

          await queueNotification({
            userId: order.userId,
            type: "ORDER_UPDATE",
            title: "Payment Received ✅",
            body: `Payment for order #${order.orderNumber} confirmed.`,
            link: `/orders/${order.orderNumber}`,
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as any;
        const orderId = intent.metadata?.orderId;
        const organizationId = intent.metadata?.organizationId;

        if (orderId && organizationId) {
          const order = await prisma.order.update({
            where: { id: orderId, organizationId },
            data: { paymentStatus: PaymentStatus.FAILED, status: OrderStatus.CANCELLED },
          });

          await queueNotification({
            userId: order.userId,
            type: "ORDER_UPDATE",
            title: "Payment Failed ❌",
            body: `Payment for order #${order.orderNumber} failed. Please retry.`,
            link: `/orders/${order.orderNumber}`,
          });
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as any;
        const paymentIntentId = charge.payment_intent;
        const organizationId = charge.metadata?.organizationId;

        if (paymentIntentId && organizationId) {
          await prisma.order.updateMany({
            where: { organizationId, stripePaymentId: paymentIntentId },
            data: { paymentStatus: PaymentStatus.REFUNDED, status: OrderStatus.REFUNDED },
          });
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event: ${event.type}`);
    }

    return ok({ received: true });
  } catch (err) {
    console.error("[Webhook] Handler error:", err);
    return error("Webhook handler failed", 500);
  }
}
