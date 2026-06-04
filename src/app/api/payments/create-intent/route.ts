// src/app/api/payments/create-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireAuthFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().uuid(),
  currency: z.enum(["mad"]).default("mad"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthFromRequest(req);
    const organizationId = await getOrganizationIdForUser(user);
    const { orderId, currency } = schema.parse(await req.json());

    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId, userId: user.userId },
      select: { id: true, total: true, paymentStatus: true },
    });
    if (!order) {
      return NextResponse.json({ success: false, error: "Commande introuvable" }, { status: 404 });
    }
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ success: false, error: "Commande déjà payée" }, { status: 400 });
    }

    const amountCents = Math.round(order.total * 100);
    if (amountCents < 1) {
      return NextResponse.json({ success: false, error: "Montant invalide" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      metadata: { orderId, organizationId },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: order.total,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
