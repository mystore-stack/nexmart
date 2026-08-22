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

  const [orderAgg] = await Promise.all([
    prisma.order.aggregate({
      where: { organizationId: orgId, createdAt: { gte: since }, status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: true,
    }),
  ]);

  // Note: analytics models not implemented yet
  const sessionCount = 0;
  const eventConversions = 0;
  const activeBanners = 0;
  const scheduledBanners = 0;
  const bannerViews = 0;
  const bannerClicks = 0;
  const bannerRevenue = 0;
  const annImpressions = 0;
  const annClicks = 0;

  return {
    revenue: orderAgg._sum.total ?? 0,
    orders: orderAgg._count,
    visitors: sessionCount,
    conversions: eventConversions,
    ctr: 0,
    conversionRate: 0,
    activeBanners,
    scheduledBanners,
    bannerViews,
    bannerRevenue,
    announcementImpressions: annImpressions,
    announcementClicks: annClicks,
    announcementCtr: 0,
  };
}

export async function getTopBanners(limit = 5): Promise<HeroBannerMetrics[]> {
  // Note: analytics models not implemented yet
  return [];
}

export async function getHomepageSectionAnalytics(homepageId: string) {
  // Note: analytics models not implemented yet
  return [];
}

export async function getTrafficChartData(organizationId?: string, days = 30) {
  // Note: analytics models not implemented yet
  return [];
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
