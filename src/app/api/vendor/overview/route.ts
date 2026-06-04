import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthFromRequest(req);

    const org = await prisma.organization.findFirst({
      where: {
        OR: [
          { ownerId: session.userId },
          { Membership: { some: { userId: session.userId } } },
        ],

      },
      include: {
        _count: { select: { Product: true, Order: true } },
      },
    });

    if (!org) {
      return NextResponse.json({ success: false, error: "Aucune boutique associée" }, { status: 404 });
    }

    const [revenue, pendingOrders] = await Promise.all([
      prisma.order.aggregate({
        where: { organizationId: org.id, paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { organizationId: org.id, status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      organization: org,
      stats: {
        products: org._count.Product,
        orders: org._count.Order,
        revenue: revenue._sum.total || 0,
        pendingOrders,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}
