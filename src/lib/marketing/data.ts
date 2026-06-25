import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import type { AdPlacement } from "@prisma/client";
import type { AdvertisementDTO, FlashDealDTO, HomeMarketingData, SponsoredProductDTO } from "./types";
import { activeDateFilter, isAdActive } from "./utils";

function serializeAd(ad: Record<string, unknown>): AdvertisementDTO {
  return {
    ...(ad as AdvertisementDTO),
    startDate: ad.startDate ? new Date(ad.startDate as string).toISOString() : null,
    endDate: ad.endDate ? new Date(ad.endDate as string).toISOString() : null,
    createdAt: new Date(ad.createdAt as string).toISOString(),
    updatedAt: new Date(ad.updatedAt as string).toISOString(),
  };
}

async function fetchActiveAds(organizationId: string, placement?: AdPlacement) {
  const now = new Date();
  const ads = await prisma.advertisement.findMany({
    where: {
      organizationId,
      status: { in: ["PUBLISHED", "SCHEDULED"] },
      ...(placement ? { placement } : {}),
      ...activeDateFilter(now),
    },
    include: { campaign: { select: { id: true, name: true, type: true } } },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return ads.filter((ad) => isAdActive(ad.status, ad.startDate, ad.endDate, now)).map(serializeAd);
}

async function fetchActiveFlashDeals(organizationId: string): Promise<FlashDealDTO[]> {
  const now = new Date();
  const deals = await prisma.flashDeal.findMany({
    where: {
      organizationId,
      status: "PUBLISHED",
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      products: {
        orderBy: { displayOrder: "asc" },
        include: {
          product: {
            select: { id: true, name: true, slug: true, price: true, comparePrice: true, images: true },
          },
        },
      },
    },
    orderBy: { startDate: "asc" },
  });

  return deals.map((d) => ({
    ...d,
    startDate: d.startDate.toISOString(),
    endDate: d.endDate.toISOString(),
    products: d.products.map((p) => ({
      id: p.id,
      productId: p.productId,
      discountPercent: p.discountPercent,
      discountPrice: p.discountPrice,
      displayOrder: p.displayOrder,
      product: p.product,
    })),
  }));
}

async function fetchActiveSponsoredProducts(organizationId: string): Promise<SponsoredProductDTO[]> {
  const now = new Date();
  const items = await prisma.sponsoredProduct.findMany({
    where: {
      organizationId,
      isActive: true,
      ...activeDateFilter(now),
    },
    include: {
      product: { select: { id: true, name: true, slug: true, price: true, images: true } },
    },
    orderBy: { priority: "desc" },
  });

  return items.map((s) => ({
    ...s,
    startDate: s.startDate?.toISOString() ?? null,
    endDate: s.endDate?.toISOString() ?? null,
  }));
}

export async function getHomeMarketingData(organizationId: string): Promise<HomeMarketingData> {
  const [allAds, flashDeals, sponsoredProducts] = await Promise.all([
    fetchActiveAds(organizationId),
    fetchActiveFlashDeals(organizationId),
    fetchActiveSponsoredProducts(organizationId),
  ]);

  const scheduledAds = allAds.filter((a) => a.status === "SCHEDULED" || (a.startDate && new Date(a.startDate) > new Date()));
  const heroAds = allAds.filter((a) => a.placement === "HOMEPAGE_HERO");
  const topBannerAds = allAds.filter((a) => a.placement === "TOP_BANNER");
  const betweenSectionAds = allAds.filter((a) => a.placement === "BETWEEN_PRODUCT_SECTIONS");
  const popupAds = allAds.filter((a) => a.placement === "POPUP");
  const floatingAds = allAds.filter((a) => a.placement === "FLOATING_BANNER");

  return {
    scheduledAds,
    heroAds,
    topBannerAds,
    betweenSectionAds,
    popupAds,
    floatingAds,
    flashDeals,
    sponsoredProducts,
  };
}

export const getCachedHomeMarketingData = unstable_cache(
  async (organizationId: string) => getHomeMarketingData(organizationId),
  ["home-marketing-data"],
  { revalidate: 120, tags: ["marketing-ads"] }
);

export async function getOptionalHomeMarketingData(): Promise<HomeMarketingData | null> {
  try {
    const organizationId = await getOptionalDefaultOrganizationId();
    if (!organizationId) return null;
    return getCachedHomeMarketingData(organizationId);
  } catch {
    return null;
  }
}

export async function getMarketingAnalytics(organizationId: string) {
  const [ads, sponsored, flashDeals] = await Promise.all([
    prisma.advertisement.findMany({
      where: { organizationId },
      select: {
        id: true,
        title: true,
        placement: true,
        impressions: true,
        clicks: true,
        conversions: true,
        revenue: true,
      },
      orderBy: { clicks: "desc" },
      take: 20,
    }),
    prisma.sponsoredProduct.aggregate({
      where: { organizationId },
      _sum: { impressions: true, clicks: true, conversions: true, revenue: true },
    }),
    prisma.flashDeal.aggregate({
      where: { organizationId },
      _sum: { impressions: true, clicks: true, conversions: true, revenue: true },
    }),
  ]);

  const totalViews =
    ads.reduce((s, a) => s + a.impressions, 0) +
    (sponsored._sum.impressions ?? 0) +
    (flashDeals._sum.impressions ?? 0);
  const totalClicks =
    ads.reduce((s, a) => s + a.clicks, 0) +
    (sponsored._sum.clicks ?? 0) +
    (flashDeals._sum.clicks ?? 0);
  const totalConversions =
    ads.reduce((s, a) => s + a.conversions, 0) +
    (sponsored._sum.conversions ?? 0) +
    (flashDeals._sum.conversions ?? 0);
  const totalRevenue =
    ads.reduce((s, a) => s + a.revenue, 0) +
    (sponsored._sum.revenue ?? 0) +
    (flashDeals._sum.revenue ?? 0);

  const byPlacementMap = new Map<string, { views: number; clicks: number }>();
  for (const ad of ads) {
    const cur = byPlacementMap.get(ad.placement) ?? { views: 0, clicks: 0 };
    cur.views += ad.impressions;
    cur.clicks += ad.clicks;
    byPlacementMap.set(ad.placement, cur);
  }

  return {
    totalViews,
    totalClicks,
    ctr: totalViews > 0 ? Math.round((totalClicks / totalViews) * 10000) / 100 : 0,
    totalConversions,
    totalRevenue,
    topAds: ads.slice(0, 10).map((a) => ({
      ...a,
      ctr: a.impressions > 0 ? Math.round((a.clicks / a.impressions) * 10000) / 100 : 0,
    })),
    byPlacement: Array.from(byPlacementMap.entries()).map(([placement, stats]) => ({
      placement: placement as AdPlacement,
      views: stats.views,
      clicks: stats.clicks,
    })),
  };
}
