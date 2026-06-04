// src/app/api/payments/create-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { amount, currency = "mad", orderId } = await req.json();

    // Stripe uses smallest currency unit (centimes for MAD)
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(amount * 100),
      currency,
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      success:      true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
