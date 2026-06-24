// src/app/api/admin/analytics/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/withApi";
import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";
import { getCache, setCache, CACHE_TTL } from "@/lib/redis";
import { subDays, startOfDay, format } from "date-fns";
import { getExecutiveMetrics, getInventoryMetrics } from "@/lib/services/executive-analytics.service";
import { PaymentStatus } from "@prisma/client";

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

    // Get conversion tracking metrics using existing AnalyticsEvent model
    const [
      totalVisitors,
      pageViews,
      addToCartEvents,
      checkoutStartedEvents,
      productViews,
      searchEvents,
    ] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { 
          organizationId,
          occurredAt: { gte: startDate },
          eventType: "PAGE_VIEW",
        },
      }),
      prisma.analyticsEvent.count({
        where: { 
          organizationId,
          occurredAt: { gte: startDate },
          eventType: "PAGE_VIEW",
        },
      }),
      prisma.analyticsEvent.count({
        where: { 
          organizationId,
          occurredAt: { gte: startDate },
          eventType: "ADD_TO_CART",
        },
      }),
      prisma.analyticsEvent.count({
        where: { 
          organizationId,
          occurredAt: { gte: startDate },
          eventType: "CHECKOUT_STARTED",
        },
      }),
      prisma.analyticsEvent.count({
        where: { 
          organizationId,
          occurredAt: { gte: startDate },
          eventType: "PRODUCT_VIEW",
        },
      }),
      prisma.analyticsEvent.count({
        where: { 
          organizationId,
          occurredAt: { gte: startDate },
          eventType: "SEARCH_QUERY",
        },
      }),
    ]);

    // Calculate conversion rates
    const addToCartRate = productViews > 0 ? (addToCartEvents / productViews) * 100 : 0;
    const checkoutRate = addToCartEvents > 0 ? (checkoutStartedEvents / addToCartEvents) * 100 : 0;
    const overallConversionRate = totalVisitors > 0 ? (executiveMetrics.orders / totalVisitors) * 100 : 0;

    // Get average order value
    const avgOrderValue = executiveMetrics.orders > 0 ? executiveMetrics.revenue / executiveMetrics.orders : 0;

    // Get chart data
    const revenueByDay = await prisma.order.findMany({
      where: { organizationId, createdAt: { gte: startDate }, paymentStatus: PaymentStatus.PAID },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Get visitors by day using existing AnalyticsEvent model
    const visitorsByDay = await prisma.analyticsEvent.groupBy({
      by: ["occurredAt"],
      _count: { eventType: true },
      where: { 
        organizationId,
        occurredAt: { gte: startDate },
        eventType: "PAGE_VIEW",
      },
    });

    // Build daily chart data
    const dailyData: Record<string, { revenue: number; orders: number; visitors: number }> = {};
    for (let i = range; i >= 0; i--) {
      const date = format(subDays(now, i), "MMM dd");
      dailyData[date] = { revenue: 0, orders: 0, visitors: 0 };
    }
    revenueByDay.forEach((order) => {
      const date = format(order.createdAt, "MMM dd");
      if (dailyData[date]) {
        dailyData[date].revenue += order.total;
        dailyData[date].orders += 1;
      }
    });
    visitorsByDay.forEach((visitor) => {
      const date = format(visitor.occurredAt, "MMM dd");
      if (dailyData[date]) {
        dailyData[date].visitors += visitor._count.eventType;
      }
    });

    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue * 100) / 100,
      orders: data.orders,
      visitors: data.visitors,
    }));

    // Get top products
    const topProducts = await prisma.product.findMany({
      where: { organizationId, published: true },
      orderBy: { soldCount: "desc" },
      take: 10,
      select: { id: true, name: true, images: true, soldCount: true, price: true },
    });

    // Get top categories
    const topCategories = await prisma.category.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      take: 10,
    });

    // Get conversion funnel data
    const funnelData = [
      { stage: "Visitors", count: totalVisitors },
      { stage: "Product Views", count: productViews },
      { stage: "Add to Cart", count: addToCartEvents },
      { stage: "Checkout Started", count: checkoutStartedEvents },
      { stage: "Orders", count: executiveMetrics.orders },
    ];

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
        visitors: totalVisitors,
        addToCartRate: parseFloat(addToCartRate.toFixed(2)),
        checkoutRate: parseFloat(checkoutRate.toFixed(2)),
        overallConversionRate: parseFloat(overallConversionRate.toFixed(2)),
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      },
      chartData,
      funnelData,
      topProducts: topProducts.map((p) => ({
        ...p,
        revenue: p.soldCount * p.price,
      })),
      topCategories: topCategories.map((c) => ({
        id: c.id,
        name: c.name,
        productCount: c._count.products,
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
