import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { subDays, startOfDay, endOfDay } from "date-fns";

export interface CmsDashboardMetrics {
  revenue: number;
  orders: number;
  visitors: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
  activeBanners: number;
  scheduledBanners: number;
  bannerViews: number;
  bannerRevenue: number;
  announcementImpressions: number;
  announcementClicks: number;
  announcementCtr: number;
}

export interface HeroBannerMetrics {
  id: string;
  title: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  status: string;
}

export async function getCmsDashboardMetrics(
  organizationId?: string,
  days = 30
): Promise<CmsDashboardMetrics> {
  const orgId = organizationId ?? (await getDefaultOrganizationId());
  const since = subDays(new Date(), days);
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const [
    orderAgg,
    sessionCount,
    eventConversions,
    activeBanners,
    scheduledBanners,
    bannerAgg,
    announcementAgg,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { organizationId: orgId, createdAt: { gte: since }, status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.analyticsSession.count({
      where: { organizationId: orgId, startedAt: { gte: since } },
    }),
    prisma.eventTracking.count({
      where: {
        eventType: { in: ["order_completed", "payment_success"] },
        createdAt: { gte: since },
      },
    }),
    prisma.heroBanner.count({
      where: { isActive: true, status: "PUBLISHED" },
    }),
    prisma.heroBanner.count({
      where: { status: "SCHEDULED", publishDate: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.heroBanner.aggregate({
      _sum: { impressions: true, primaryButtonClicks: true, secondaryButtonClicks: true, revenueGenerated: true, conversionCount: true },
    }),
    prisma.announcementBar.aggregate({
      where: { organizationId: orgId },
      _sum: { impressions: true, clicks: true },
    }),
  ]);

  const bannerViews = bannerAgg._sum.impressions ?? 0;
  const bannerClicks =
    (bannerAgg._sum.primaryButtonClicks ?? 0) + (bannerAgg._sum.secondaryButtonClicks ?? 0);
  const annImpressions = announcementAgg._sum.impressions ?? 0;
  const annClicks = announcementAgg._sum.clicks ?? 0;

  return {
    revenue: orderAgg._sum.total ?? 0,
    orders: orderAgg._count,
    visitors: sessionCount,
    conversions: eventConversions,
    ctr: bannerViews > 0 ? (bannerClicks / bannerViews) * 100 : 0,
    conversionRate: bannerViews > 0 ? ((bannerAgg._sum.conversionCount ?? 0) / bannerViews) * 100 : 0,
    activeBanners,
    scheduledBanners,
    bannerViews,
    bannerRevenue: bannerAgg._sum.revenueGenerated ?? 0,
    announcementImpressions: annImpressions,
    announcementClicks: annClicks,
    announcementCtr: annImpressions > 0 ? (annClicks / annImpressions) * 100 : 0,
  };
}

export async function getTopBanners(limit = 5): Promise<HeroBannerMetrics[]> {
  const banners = await prisma.heroBanner.findMany({
    orderBy: [{ impressions: "desc" }],
    take: limit,
  });

  return banners.map((b) => {
    const clicks = b.primaryButtonClicks + b.secondaryButtonClicks;
    return {
      id: b.id,
      title: b.title,
      impressions: b.impressions,
      clicks,
      ctr: b.impressions > 0 ? (clicks / b.impressions) * 100 : 0,
      conversions: b.conversionCount,
      conversionRate: b.impressions > 0 ? (b.conversionCount / b.impressions) * 100 : 0,
      revenue: b.revenueGenerated,
      status: b.status,
    };
  });
}

export async function getHomepageSectionAnalytics(homepageId: string) {
  return prisma.homepageSection.findMany({
    where: { homepageId },
    select: {
      id: true,
      type: true,
      title: true,
      impressions: true,
      clicks: true,
      conversions: true,
      isVisible: true,
    },
    orderBy: { displayOrder: "asc" },
  });
}

export async function getTrafficChartData(organizationId?: string, days = 30) {
  const orgId = organizationId ?? (await getDefaultOrganizationId());
  const since = subDays(new Date(), days);

  const sessions = await prisma.analyticsSession.findMany({
    where: { organizationId: orgId, startedAt: { gte: since } },
    select: { startedAt: true },
  });

  const byDay: Record<string, number> = {};
  for (const s of sessions) {
    const key = s.startedAt.toISOString().slice(0, 10);
    byDay[key] = (byDay[key] ?? 0) + 1;
  }

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, visitors]) => ({ date, visitors }));
}

export async function getRevenueChartData(organizationId?: string, days = 30) {
  const orgId = organizationId ?? (await getDefaultOrganizationId());
  const since = subDays(new Date(), days);

  const orders = await prisma.order.findMany({
    where: { organizationId: orgId, createdAt: { gte: since }, status: { not: "CANCELLED" } },
    select: { createdAt: true, total: true },
  });

  const byDay: Record<string, number> = {};
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    byDay[key] = (byDay[key] ?? 0) + o.total;
  }

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));
}
