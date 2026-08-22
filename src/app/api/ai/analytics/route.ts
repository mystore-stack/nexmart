import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const organizationId = session.organizationId;
    const days = Math.min(90, Math.max(7, Number(req.nextUrl.searchParams.get("days") || 30)));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [orders, events, lowStock, conversations] = await Promise.all([
      prisma.order.findMany({
        where: { organizationId, createdAt: { gte: since } },
        select: { total: true, status: true, createdAt: true },
      }),
      prisma.aiEvent.groupBy({
        by: ["type"],
        where: { organizationId, createdAt: { gte: since } },
        _count: { _all: true },
      }),
      prisma.product.count({ where: { organizationId, published: true, stock: { lte: 5 } } }),
      prisma.aiConversation.count({ where: { organizationId, createdAt: { gte: since } } }),
    ]);

    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgDailyRevenue = revenue / days;
    const predicted30DayRevenue = avgDailyRevenue * 30;
    const cancelled = orders.filter((order) => order.status === "CANCELLED").length;
    const anomaly =
      orders.length > 10 && cancelled / orders.length > 0.25
        ? "High cancellation ratio detected"
        : null;

    return NextResponse.json({
      success: true,
      analytics: {
        revenue,
        orders: orders.length,
        predicted30DayRevenue,
        lowStock,
        conversations,
        eventBreakdown: events.map((event) => ({ type: event.type, count: event._count._all })),
        insights: [
          lowStock > 0 ? `${lowStock} products are at or below low-stock threshold.` : "Inventory pressure is low.",
          predicted30DayRevenue > revenue ? "Revenue forecast is positive for the next 30 days." : "Revenue forecast needs attention.",
          anomaly,
        ].filter(Boolean),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur analytics IA";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
