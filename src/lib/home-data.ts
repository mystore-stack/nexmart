import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import { CACHE_KEYS, CACHE_TTL, getCache, setCache } from "@/lib/redis";
import type { HomeMarketingData } from "@/lib/marketing/types";
import { getCachedHomeMarketingData } from "@/lib/marketing/data";
import type { PageBuilderPage, PageSection } from "@prisma/client";

export type HomePageData = {
  page: PageBuilderPage & { sections: PageSection[] } | null;
  featured: Awaited<ReturnType<typeof fetchFeatured>>;
  trending: Awaited<ReturnType<typeof fetchTrending>>;
  categories: Awaited<ReturnType<typeof fetchCategories>>;
  flashSale: Awaited<ReturnType<typeof fetchFlashSale>>;
  marketing: HomeMarketingData | null;
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

const emptyHome: HomePageData = {
  page: null,
  featured: [],
  trending: [],
  categories: [],
  flashSale: [],
  marketing: null,
};

async function getHomePagePage(organizationId: string) {
  const now = new Date();

  const page = await prisma.pageBuilderPage.findFirst({
    where: {
      organizationId,
      pageType: "HOME",
      enabled: true,
      status: "PUBLISHED",
      publishDate: { lte: now },
      // Handle null unpublishDate - if null, page should always be valid
      OR: [
        { unpublishDate: null },
        { unpublishDate: { gte: now } },
      ],
    },
    include: {
      sections: {
        where: { enabled: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  return page;
}

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const organizationId = await getOptionalDefaultOrganizationId();
    if (!organizationId) return emptyHome;

    const productCacheKey = `${CACHE_KEYS.featured()}:home:${organizationId}`;
    const cachedProducts = await getCache<{ featured: unknown; trending: unknown; categories: unknown; flashSale: unknown }>(productCacheKey);

    const [page, productData, marketing] = await Promise.all([
      getHomePagePage(organizationId),
      cachedProducts
        ? Promise.resolve(cachedProducts)
        : Promise.all([
            fetchFeatured(organizationId),
            fetchTrending(organizationId),
            fetchCategories(organizationId),
            fetchFlashSale(organizationId),
          ]).then(([featured, trending, categories, flashSale]) => ({ featured, trending, categories, flashSale })),
      getCachedHomeMarketingData(organizationId).catch(() => null),
    ]);

    const { featured, trending, categories, flashSale } = productData as {
      featured: HomePageData["featured"];
      trending: HomePageData["trending"];
      categories: HomePageData["categories"];
      flashSale: HomePageData["flashSale"];
    };

    if (!cachedProducts) {
      await setCache(productCacheKey, { featured, trending, categories, flashSale }, CACHE_TTL.MEDIUM);
    }

    return { page, featured, trending, categories, flashSale, marketing };
  } catch {
    return emptyHome;
  }
}
