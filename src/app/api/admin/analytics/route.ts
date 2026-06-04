// src/app/api/admin/analytics/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { ok, forbidden, handleApiError } from "@/lib/api";
import { getCache, setCache, CACHE_TTL } from "@/lib/redis";
import { subDays, startOfDay, format } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const payload = await getAuthFromRequest(req);
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
      return forbidden();
    }
    const organizationId = await getOrganizationIdForUser(payload);

    const range = parseInt(req.nextUrl.searchParams.get("range") || "30");
    const cacheKey = `analytics:dashboard:${organizationId}:${range}`;

    const cached = await getCache(cacheKey);
    if (cached) return ok(cached);

    const now = new Date();
    const startDate = startOfDay(subDays(now, range));
    const prevStart = startOfDay(subDays(now, range * 2));
    const prevEnd = startOfDay(subDays(now, range));

    // Parallel queries for performance
    const [
      currentRevenue,
      prevRevenue,
      currentOrders,
      prevOrders,
      currentUsers,
      prevUsers,
      totalProducts,
      lowStockProducts,
      revenueByDay,
      topProducts,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      // Current period revenue
      prisma.order.aggregate({
        where: { organizationId, createdAt: { gte: startDate }, paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      // Previous period revenue
      prisma.order.aggregate({
        where: { organizationId, createdAt: { gte: prevStart, lt: prevEnd }, paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      // Current orders
      prisma.order.count({ where: { organizationId, createdAt: { gte: startDate } } }),
      // Previous orders
      prisma.order.count({ where: { organizationId, createdAt: { gte: prevStart, lt: prevEnd } } }),
      // New users
      prisma.membership.count({ where: { organizationId, createdAt: { gte: startDate } } }),
      // Previous users
      prisma.membership.count({ where: { organizationId, createdAt: { gte: prevStart, lt: prevEnd } } }),
      // Products
      prisma.product.count({ where: { organizationId, published: true } }),
      // Low stock
      prisma.product.count({ where: { organizationId, published: true, stock: { lte: 5, gt: 0 } } }),
      // Revenue by day
      prisma.order.findMany({
        where: { organizationId, createdAt: { gte: startDate }, paymentStatus: "PAID" },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      // Top products
      prisma.product.findMany({
        where: { organizationId, published: true },
        orderBy: { soldCount: "desc" },
        take: 10,
        select: { id: true, name: true, images: true, soldCount: true, price: true },
      }),
      // Orders by status
      prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
        where: { organizationId, createdAt: { gte: startDate } },
      }),
      // Recent orders
      prisma.order.findMany({
        where: { organizationId },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true, avatar: true } },
          items: { take: 1, include: { product: { select: { name: true } } } },
        },
      }),
    ]);

    const currRev = currentRevenue._sum.total || 0;
    const prevRev = prevRevenue._sum.total || 0;
    const revenueChange = prevRev ? ((currRev - prevRev) / prevRev) * 100 : 100;
    const ordersChange = prevOrders ? ((currentOrders - prevOrders) / prevOrders) * 100 : 100;
    const usersChange = prevUsers ? ((currentUsers - prevUsers) / prevUsers) * 100 : 100;

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

    const result = {
      summary: {
        revenue: { total: currRev, change: Math.round(revenueChange * 10) / 10 },
        orders: { total: currentOrders, change: Math.round(ordersChange * 10) / 10 },
        users: { total: currentUsers, change: Math.round(usersChange * 10) / 10 },
        products: { total: totalProducts, lowStock: lowStockProducts },
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
  } catch (err) {
    return handleApiError(err);
  }
}
