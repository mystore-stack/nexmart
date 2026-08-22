import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const organizationId = session.organizationId;
    const { orderId } = schema.parse(await req.json());

    const order = await prisma.order.findFirst({
      where: { id: orderId, organizationId },
      include: { user: true, address: true, items: true },
    });
    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    const previousOrders = await prisma.order.count({
      where: { organizationId, userId: order.userId, id: { not: order.id } },
    });
    const sameAddressOrders = await prisma.order.count({
      where: { organizationId, addressId: order.addressId, id: { not: order.id } },
    });

    let score = 0;
    const reasons: string[] = [];
    if (previousOrders === 0 && order.total > 2000) {
      score += 30;
      reasons.push("High-value first order");
    }
    if (order.paymentMethod === "CASH_ON_DELIVERY" && order.total > 1500) {
      score += 20;
      reasons.push("High-value cash-on-delivery order");
    }
    if (sameAddressOrders > 5) {
      score += 15;
      reasons.push("Many orders to same address");
    }
    if (order.items.some((item) => item.quantity >= 10)) {
      score += 15;
      reasons.push("Unusually high item quantity");
    }
    if (!order.user.emailVerified) {
      score += 10;
      reasons.push("Customer email not verified");
    }

    const risk = score >= 60 ? "high" : score >= 30 ? "medium" : "low";
    await prisma.aiEvent.create({
      data: {
        organizationId,
        userId: order.userId,
        type: "CHAT" as any,
        score,
        metadata: { kind: "fraud_score", orderId, risk, reasons } as any,
      } as any,
    }).catch(() => {});

    return NextResponse.json({ success: true, risk, score, reasons });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur fraude IA";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
