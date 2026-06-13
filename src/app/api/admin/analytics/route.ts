// src/app/api/admin/analytics/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/withApi";
import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";
import { getCache, setCache, CACHE_TTL } from "@/lib/redis";
import { subDays, startOfDay, format } from "date-fns";
import { getExecutiveMetrics, getInventoryMetrics } from "@/lib/services/executive-analytics.service";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async ({ req }) => {
  const { organizationId } = await requireAdmin();

  const range = parseInt(req.nextUrl.searchParams.get("range") || "30");
  const cacheKey = `analytics:dashboard:${organizationId}:${range}`;

  const cached = await getCache(cacheKey);
  if (cached) return ok(cached);

    const now = new Date();
    const startDate = startOfDay(subDays(now, range));
    const prevStart = startOfDay(subDays(now, range * 2));
    const prevEnd = startOfDay(subDays(now, range));

    // Get executive metrics
    const executiveMetrics = await getExecutiveMetrics({
      organizationId,
      startDate,
      endDate: now,
      previousStartDate: prevStart,
      previousEndDate: prevEnd,
    });

    // Get inventory metrics
    const inventoryMetrics = await getInventoryMetrics(organizationId);

    // Get chart data
    const revenueByDay = await prisma.order.findMany({
      where: { organizationId, createdAt: { gte: startDate }, paymentStatus: "PAID" },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Build daily revenue chart data
    const dailyData: Record<string, { revenue: number; orders: number }> = {};
    for (let i = range; i >= 0; i--) {
      const date = format(subDays(now, i), "MMM dd");
      dailyData[date] = { revenue: 0, orders: 0 };
    }
    revenueByDay.forEach((order) => {
      const date = format(order.createdAt, "MMM dd");
      if (dailyData[date]) {
        dailyData[date].revenue += order.total;
        dailyData[date].orders += 1;
      }
    });

    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue * 100) / 100,
      orders: data.orders,
    }));

    // Get top products
    const topProducts = await prisma.product.findMany({
      where: { organizationId, published: true },
      orderBy: { soldCount: "desc" },
      take: 10,
      select: { id: true, name: true, images: true, soldCount: true, price: true },
    });

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { organizationId, createdAt: { gte: startDate } },
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { organizationId },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        items: { take: 1, include: { product: { select: { name: true } } } },
      },
    });

    const result = {
      summary: {
        revenue: executiveMetrics.revenue,
        orders: executiveMetrics.orders,
        customers: executiveMetrics.customers,
        profit: executiveMetrics.profit,
        inventory: {
          totalValue: inventoryMetrics.totalValue,
          outOfStock: inventoryMetrics.outOfStock,
          lowStock: inventoryMetrics.lowStock,
          overstocked: inventoryMetrics.overstocked,
        },
        conversion: executiveMetrics.conversion,
      },
      chartData,
      topProducts: topProducts.map((p) => ({
        ...p,
        revenue: p.soldCount * p.price,
      })),
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      recentOrders,
    };

  await setCache(cacheKey, result, CACHE_TTL.SHORT);
  return ok(result);
});
