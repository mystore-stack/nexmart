// src/lib/stripe.ts
import Stripe from "stripe";

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
      typescript: true,
    });
  }
  
  return stripeInstance;
}

export async function createPaymentIntent(
  amount: number,
  currency: string = "usd",
  metadata: Record<string, string> = {}
) {
  return getStripe().paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe uses cents
    currency,
    automatic_payment_methods: { enabled: true },
    metadata,
  });
}

export async function createCheckoutSession(params: {
  orderId: string;
  items: Array<{ name: string; image: string; price: number; quantity: number }>;
  successUrl: string;
  cancelUrl: string;
  customerEmail: string;
  discount?: number;
  shipping?: number;
}) {
  const stripe = getStripe();
  const lineItems = params.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        images: [item.image],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const discounts = [];
  if (params.discount && params.discount > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: Math.round(params.discount * 100),
      currency: "usd",
      duration: "once",
    });
    discounts.push({ coupon: coupon.id });
  }

  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    discounts,
    shipping_options: params.shipping
      ? [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: Math.round(params.shipping * 100), currency: "usd" },
              display_name: "Standard Shipping",
            },
          },
        ]
      : [],
    metadata: { orderId: params.orderId },
  });
}

export async function constructWebhookEvent(body: string, signature: string) {
  return getStripe().webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

export async function refundPayment(paymentIntentId: string, amount?: number) {
  return getStripe().refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  });
}
