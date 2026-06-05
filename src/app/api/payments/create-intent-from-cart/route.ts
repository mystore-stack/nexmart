// src/app/api/payments/create-intent-from-cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireAuthFromRequest } from "@/lib/auth";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { z } from "zod";

const schema = z.object({
  amount: z.number().positive(),
  currency: z.enum(["mad", "usd"]).default("mad"),
  metadata: z.record(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthFromRequest(req);
    const organizationId = await getOrganizationIdForUser(user);
    const { amount, currency, metadata = {} } = schema.parse(await req.json());

    const amountCents = Math.round(amount * 100);
    if (amountCents < 1) {
      return NextResponse.json({ success: false, error: "Montant invalide" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      metadata: {
        userId: user.userId,
        organizationId,
        ...metadata,
      },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
    });
  } catch (err: unknown) {
    console.error("Payment intent creation error:", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    
    if (message === "Unauthorized") {
      return NextResponse.json({ success: false, error: message }, { status: 401 });
    }
    
    if (message.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json({ success: false, error: "Configuration Stripe manquante" }, { status: 500 });
    }
    
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
