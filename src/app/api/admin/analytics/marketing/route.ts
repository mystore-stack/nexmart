import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { subDays, startOfDay } from "date-fns";

// GET marketing analytics (ROAS, CPA, attribution)
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();

    const range = parseInt(req.nextUrl.searchParams.get("range") || "30");
    const now = new Date();
    const startDate = startOfDay(subDays(now, range));

    // Get orders with payment data
    const orders = await prisma.order.findMany({
      where: {
        organizationId,
        paymentStatus: "PAID",
        createdAt: { gte: startDate },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Get analytics events for attribution
    const events = await prisma.analyticsEvent.findMany({
      where: {
        organizationId,
        occurredAt: { gte: startDate },
        eventType: { in: ["PAGE_VIEW", "PRODUCT_VIEW", "ADD_TO_CART", "CHECKOUT_STARTED"] },
      },
    });

    // Calculate total revenue and spend
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;

    // Calculate ROAS (Return on Ad Spend)
    // This is a simplified calculation - in production you'd track actual ad spend per campaign
    const estimatedAdSpend = totalRevenue * 0.3; // Assuming 30% of revenue is ad spend (placeholder)
    const roas = estimatedAdSpend > 0 ? totalRevenue / estimatedAdSpend : 0;

    // Calculate CPA (Cost Per Acquisition)
    // Using estimated CAC based on marketing spend
    const newCustomers = await prisma.user.count({
      where: {
        organizationId,
        createdAt: { gte: startDate },
        role: "USER",
      },
    });
    const cpa = newCustomers > 0 ? estimatedAdSpend / newCustomers : 0;

    // Calculate attribution by channel
    const attributionByChannel = events.reduce((acc: any, event) => {
      const utmSource = event.properties?.utmSource || "direct";
      const utmMedium = event.properties?.utmMedium || "none";
      const channel = `${utmSource}/${utmMedium}`;

      if (!acc[channel]) {
        acc[channel] = {
          channel,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
        };
      }

      if (event.eventType === "PAGE_VIEW") {
        acc[channel].impressions++;
      } else if (event.eventType === "PRODUCT_VIEW") {
        acc[channel].clicks++;
      } else if (event.eventType === "ADD_TO_CART" || event.eventType === "CHECKOUT_STARTED") {
        acc[channel].conversions++;
      }

      return acc;
    }, {});

    // Map conversions to revenue (simplified attribution)
    const attributionData = Object.values(attributionByChannel).map((item: any) => ({
      ...item,
      revenue: item.conversions * (totalRevenue / (totalOrders || 1)) * 0.1, // Simplified revenue attribution
      roas: item.conversions > 0 ? (item.revenue / (item.impressions * 0.01)) : 0, // Simplified ROAS per channel
    }));

    // Calculate funnel metrics
    const pageViews = events.filter((e) => e.eventType === "PAGE_VIEW").length;
    const productViews = events.filter((e) => e.eventType === "PRODUCT_VIEW").length;
    const addToCart = events.filter((e) => e.eventType === "ADD_TO_CART").length;
    const checkoutStarted = events.filter((e) => e.eventType === "CHECKOUT_STARTED").length;
    const purchases = totalOrders;

    const funnelMetrics = {
      pageViews,
      productViews,
      addToCart,
      checkoutStarted,
      purchases,
      viewToProductRate: pageViews > 0 ? (productViews / pageViews) * 100 : 0,
      productToCartRate: productViews > 0 ? (addToCart / productViews) * 100 : 0,
      cartToCheckoutRate: addToCart > 0 ? (checkoutStarted / addToCart) * 100 : 0,
      checkoutToPurchaseRate: checkoutStarted > 0 ? (purchases / checkoutStarted) * 100 : 0,
      overallConversionRate: pageViews > 0 ? (purchases / pageViews) * 100 : 0,
    };

    // Campaign performance (UTM-based)
    const campaignPerformance = events.reduce((acc: any, event) => {
      const campaign = event.properties?.utmCampaign || "none";
      if (!acc[campaign]) {
        acc[campaign] = {
          campaign,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0, // Would come from campaign data in production
        };
      }
      acc[campaign].impressions++;
      if (event.eventType !== "PAGE_VIEW") {
        acc[campaign].clicks++;
      }
      if (event.eventType === "ADD_TO_CART" || event.eventType === "CHECKOUT_STARTED") {
        acc[campaign].conversions++;
      }
      return acc;
    }, {});

    const campaignData = Object.values(campaignPerformance).map((item: any) => ({
      ...item,
      ctr: item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0,
      conversionRate: item.clicks > 0 ? (item.conversions / item.clicks) * 100 : 0,
      roas: item.spend > 0 ? (item.conversions * 100) / item.spend : 0, // Simplified
    }));

    // Time series data for marketing metrics
    const dailyMetrics = await prisma.$queryRaw`
      SELECT 
        DATE(occurred_at) as date,
        COUNT(*) FILTER (WHERE event_type = 'PAGE_VIEW') as page_views,
        COUNT(*) FILTER (WHERE event_type = 'ADD_TO_CART') as add_to_cart,
        COUNT(*) FILTER (WHERE event_type = 'CHECKOUT_STARTED') as checkout_started
      FROM "AnalyticsEvent"
      WHERE organization_id = ${organizationId}
        AND occurred_at >= ${startDate}
      GROUP BY DATE(occurred_at)
      ORDER BY date
    `;

    const chartData = (dailyMetrics as any[]).map((item) => ({
      date: new Date(item.date).toISOString().split("T")[0],
      pageViews: Number(item.page_views) || 0,
      addToCart: Number(item.add_to_cart) || 0,
      checkoutStarted: Number(item.checkout_started) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalOrders,
          estimatedAdSpend: parseFloat(estimatedAdSpend.toFixed(2)),
          roas: parseFloat(roas.toFixed(2)),
          cpa: parseFloat(cpa.toFixed(2)),
          newCustomers,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
        attribution: attributionData,
        funnelMetrics: {
          ...funnelMetrics,
          viewToProductRate: parseFloat(funnelMetrics.viewToProductRate.toFixed(2)),
          productToCartRate: parseFloat(funnelMetrics.productToCartRate.toFixed(2)),
          cartToCheckoutRate: parseFloat(funnelMetrics.cartToCheckoutRate.toFixed(2)),
          checkoutToPurchaseRate: parseFloat(funnelMetrics.checkoutToPurchaseRate.toFixed(2)),
          overallConversionRate: parseFloat(funnelMetrics.overallConversionRate.toFixed(2)),
        },
        campaignPerformance: campaignData,
        chartData,
      },
    });
  } catch (error: any) {
    console.error("[MARKETING ANALYTICS ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch marketing analytics" },
      { status: 500 }
    );
  }
}
