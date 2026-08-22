import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";

// GET analytics data for banners dashboard
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    // Get all banners with their analytics and event tracking
    const banners = await prisma.homeBanner.findMany({
      orderBy: { order: "asc" },
    });

    // Get orders for revenue calculation
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
        createdAt: dateFilter.createdAt || undefined,
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
      },
    });

    // Calculate metrics for each banner
    const bannerMetrics = banners.map((banner: any) => {
      // Simplified metrics without analytics tracking
      const impressions = 0;
      const totalClicks = 0;
      const ctr = 0;
      const conversionRate = 0;
      const estimatedRevenue = 0;

      return {
        id: banner.id,
        title: banner.title,
        badgeText: banner.badgeText || '',
        impressions,
        primaryClicks: 0,
        secondaryClicks: 0,
        totalClicks,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        revenue: parseFloat(estimatedRevenue.toFixed(2)),
        isActive: banner.active,
        publishDate: banner.createdAt,
        createdAt: banner.createdAt,
      };
    });

    // Calculate overview metrics
    const totalImpressions = bannerMetrics.reduce((sum, b) => sum + b.impressions, 0);
    const totalClicks = bannerMetrics.reduce((sum, b) => sum + b.totalClicks, 0);
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const bestPerforming = bannerMetrics.reduce((best, current) => current.ctr > best.ctr ? current : best, bannerMetrics[0]);
    const worstPerforming = bannerMetrics.reduce((worst, current) => current.ctr < worst.ctr ? current : worst, bannerMetrics[0]);

    // Get time series data for charts (simplified - using banners instead)
    const analyticsRecords: any[] = [];

    // Group by date for time series
    const timeSeriesData = analyticsRecords.reduce((acc: any, record: any) => {
      const date = new Date(record.createdAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, impressions: 0, clicks: 0 };
      }
      if (record.eventType === "impression") {
        acc[date].impressions++;
      } else {
        acc[date].clicks++;
      }
      return acc;
    }, {});

    const chartData = Object.values(timeSeriesData).map((item: any) => ({
      ...item,
      ctr: item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(2) : 0,
    }));

    // Top performers
    const topByCTR = [...bannerMetrics].sort((a, b) => b.ctr - a.ctr).slice(0, 5);
    const topByClicks = [...bannerMetrics].sort((a, b) => b.totalClicks - a.totalClicks).slice(0, 5);
    const topByImpressions = [...bannerMetrics].sort((a, b) => b.impressions - a.impressions).slice(0, 5);

    // Device breakdown
    const deviceBreakdown = analyticsRecords.reduce((acc: any, record: any) => {
      const device = record.deviceType || "unknown";
      if (!acc[device]) {
        acc[device] = 0;
      }
      acc[device]++;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalImpressions,
          totalClicks,
          averageCTR: parseFloat(averageCTR.toFixed(2)),
          bestPerforming: bestPerforming || null,
          worstPerforming: worstPerforming || null,
        },
        bannerMetrics,
        chartData,
        topPerformers: {
          byCTR: topByCTR,
          byClicks: topByClicks,
          byImpressions: topByImpressions,
        },
        deviceBreakdown,
      },
    });
  } catch (error: any) {
    console.error("[ANALYTICS DASHBOARD ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
