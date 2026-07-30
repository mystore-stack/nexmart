// src/lib/home-data.ts — Dynamic Homepage Data Fetcher
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";

export type HomePageData = {
  featured: Awaited<ReturnType<typeof fetchFeatured>>;
  trending: Awaited<ReturnType<typeof fetchTrending>>;
  categories: Awaited<ReturnType<typeof fetchCategories>>;
  flashSale: Awaited<ReturnType<typeof fetchFlashSale>>;
  cms: {
    banners: any[];
    promos: any[];
    flashDeals: any[];
    serviceBanners: any[];
    sponsored: any[];
    bestsellers: any[];
    newArrivals: any[];
    mysteryBoxes: any[];
    bundleConfig: any;
    brands: any[];
    features: any[];
    newsletter: any;
    footer: any;
    homeSections: any[];
    heroSlides: any[];
    promoBanners: any[];
    whyNexMartValues: any[];
    mobileAppBanner: any;
  };
};

async function fetchFeatured(organizationId: string) {
  return prisma.product.findMany({
    where: { organizationId, published: true, featured: true },
    include: { category: true, variants: true },
    orderBy: { soldCount: "desc" },
    take: 12,
  });
}

async function fetchTrending(organizationId: string) {
  return prisma.product.findMany({
    where: { organizationId, published: true, stock: { gt: 0 } },
    include: { category: true, variants: true },
    orderBy: [{ soldCount: "desc" }, { rating: "desc" }],
    take: 8,
  });
}

async function fetchCategories(organizationId: string) {
  return prisma.category.findMany({
    where: { organizationId, parentId: null },
    include: { _count: { select: { products: { where: { organizationId } } } } },
    orderBy: { name: "asc" },
    take: 8,
  });
}

async function fetchFlashSale(organizationId: string) {
  return prisma.product.findMany({
    where: { organizationId, published: true, comparePrice: { not: null }, stock: { gt: 0 } },
    include: { category: true, variants: true },
    orderBy: { soldCount: "desc" },
    take: 6,
  });
}

async function fetchCmsData() {
  try {
    const now = new Date();
    
    // Helper function to safely fetch data with fallback
    const safeFetch = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
      try {
        return await fn();
      } catch (error) {
        console.warn('CMS data fetch failed, using fallback:', error);
        return fallback;
      }
    };

    const [
      banners,
      promos,
      flashDeals,
      serviceBanners,
      sponsored,
      bestsellers,
      newArrivals,
      mysteryBoxes,
      bundleConfig,
      brands,
      features,
      newsletter,
      footer,
      homeSections,
      heroSlides,
      promoBanners,
      whyNexMartValues,
      mobileAppBanner,
    ] = await Promise.all([
      safeFetch(() => prisma.homeBanner.findMany({
        where: {
          active: true,
          OR: [{ startDate: null }, { startDate: { lte: now } }],
          AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
        },
        orderBy: { order: "asc" },
      }), []),
      safeFetch(() => prisma.homePromoCard.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }), []),
      safeFetch(() => prisma.flashDealItem.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }), []),
      safeFetch(() => prisma.homeServiceBanner.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }), []),
      safeFetch(() => prisma.sponsoredProduct.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }), []),
      safeFetch(() => prisma.bestsellerConfig.findMany({
        where: { active: true },
        orderBy: { rank: "asc" },
      }), []),
      safeFetch(() => prisma.newArrivalConfig.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }), []),
      safeFetch(() => prisma.mysteryBoxConfig.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      }), []),
      safeFetch(() => prisma.bundleConfig.findFirst({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      }), null),
      safeFetch(() => prisma.brandPartner.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }), []),
      safeFetch(() => prisma.homeFeature.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }), []),
      safeFetch(() => prisma.newsletterConfig.findFirst({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      }), null),
      safeFetch(() => prisma.footerConfig.findFirst({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      }), null),
      safeFetch(() => prisma.homePageSection.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }), []),
      safeFetch(() => prisma.heroSlide.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }), []),
      safeFetch(() => prisma.promoBannerItem.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }), []),
      safeFetch(() => prisma.whyNexMartValue.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }), []),
      safeFetch(() => prisma.mobileAppBanner.findFirst({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      }), null),
    ]);

    return {
      banners,
      promos,
      flashDeals,
      serviceBanners,
      sponsored,
      bestsellers,
      newArrivals,
      mysteryBoxes,
      bundleConfig,
      brands,
      features,
      newsletter,
      footer,
      homeSections,
      heroSlides,
      promoBanners,
      whyNexMartValues,
      mobileAppBanner,
    };
  } catch {
    return {
      banners: [],
      promos: [],
      flashDeals: [],
      serviceBanners: [],
      sponsored: [],
      bestsellers: [],
      newArrivals: [],
      mysteryBoxes: [],
      bundleConfig: null,
      brands: [],
      features: [],
      newsletter: null,
      footer: null,
      homeSections: [],
      heroSlides: [],
      promoBanners: [],
      whyNexMartValues: [],
      mobileAppBanner: null,
    };
  }
}

const emptyHome: HomePageData = {
  featured: [],
  trending: [],
  categories: [],
  flashSale: [],
  cms: {
    banners: [],
    promos: [],
    flashDeals: [],
    serviceBanners: [],
    sponsored: [],
    bestsellers: [],
    newArrivals: [],
    mysteryBoxes: [],
    bundleConfig: null,
    brands: [],
    features: [],
    newsletter: null,
    footer: null,
    homeSections: [],
    heroSlides: [],
    promoBanners: [],
    whyNexMartValues: [],
    mobileAppBanner: null,
  },
};

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const organizationId = await getDefaultOrganizationId();

    const [featured, trending, categories, flashSale, cms] = await Promise.all([
      fetchFeatured(organizationId),
      fetchTrending(organizationId),
      fetchCategories(organizationId),
      fetchFlashSale(organizationId),
      fetchCmsData(),
    ]);

    return { featured, trending, categories, flashSale, cms };
  } catch {
    return emptyHome;
  }
}
