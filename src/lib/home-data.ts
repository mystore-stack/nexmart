import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { CACHE_KEYS, CACHE_TTL, getCache, setCache } from "@/lib/redis";

export type HomePageData = {
  featured: Awaited<ReturnType<typeof fetchFeatured>>;
  trending: Awaited<ReturnType<typeof fetchTrending>>;
  categories: Awaited<ReturnType<typeof fetchCategories>>;
  flashSale: Awaited<ReturnType<typeof fetchFlashSale>>;
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
  featured: [],
  trending: [],
  categories: [],
  flashSale: [],
};

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const organizationId = await getDefaultOrganizationId();
    const cacheKey = `${CACHE_KEYS.featured()}:home:${organizationId}`;
    const cached = await getCache<HomePageData>(cacheKey);
    if (cached) return cached;

    const [featured, trending, categories, flashSale] = await Promise.all([
      fetchFeatured(organizationId),
      fetchTrending(organizationId),
      fetchCategories(organizationId),
      fetchFlashSale(organizationId),
    ]);

    const data = { featured, trending, categories, flashSale };
    await setCache(cacheKey, data, CACHE_TTL.MEDIUM);
    return data;
  } catch {
    return emptyHome;
  }
}
