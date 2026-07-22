import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { CACHE_KEYS, CACHE_TTL, getCache, setCache } from "@/lib/redis";

export type HomePageData = {
  featured: Awaited<ReturnType<typeof fetchFeatured>>;
  trending: Awaited<ReturnType<typeof fetchTrending>>;
  categories: Awaited<ReturnType<typeof fetchCategories>>;
  flashSale: Awaited<ReturnType<typeof fetchFlashSale>>;
  deals: Awaited<ReturnType<typeof fetchDeals>>;
  bundles: Awaited<ReturnType<typeof fetchBundles>>;
  mysteryBoxes: Awaited<ReturnType<typeof fetchMysteryBoxes>>;
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

async function fetchDeals(organizationId: string) {
  const products = await prisma.product.findMany({
    where: { organizationId, published: true, comparePrice: { not: null }, stock: { gt: 0 } },
    include: { category: true, variants: true },
    orderBy: { soldCount: "desc" },
    take: 8,
  });

  return products.map((p) => ({
    id: `deal-${p.id}`,
    productId: p.id,
    product: p,
    discountPercentage: Math.round(((p.comparePrice! - p.price) / p.comparePrice!) * 100),
    startTime: new Date(Date.now() - 24 * 3600_000).toISOString(),
    endTime: new Date(Date.now() + 3 * 3600_000).toISOString(),
    stockLimit: p.stock,
    stockRemaining: Math.max(1, Math.floor(p.stock * 0.6)),
    active: true,
    createdAt: p.createdAt.toISOString(),
  }));
}

async function fetchBundles(organizationId: string) {
  // Mock data until Bundle model is added to Prisma schema
  const products = await prisma.product.findMany({
    where: { organizationId, published: true, stock: { gt: 0 } },
    include: { category: true, variants: true },
    take: 3,
  });

  if (products.length < 2) return [];

  const bundle = {
    id: "bundle-1",
    name: "Premium Tech Bundle",
    slug: "premium-tech-bundle",
    description: "Get the best tech products together at a special price",
    products: products.slice(0, 2),
    productIds: products.slice(0, 2).map(p => p.id),
    totalPrice: products.slice(0, 2).reduce((sum, p) => sum + p.price, 0),
    bundlePrice: Math.round(products.slice(0, 2).reduce((sum, p) => sum + p.price, 0) * 0.85),
    discount: Math.round(products.slice(0, 2).reduce((sum, p) => sum + p.price, 0) * 0.15),
    discountPercentage: 15,
    active: true,
    createdAt: new Date().toISOString(),
  };

  return [bundle];
}

async function fetchMysteryBoxes(organizationId: string) {
  // Mock data until MysteryBox model is added to Prisma schema
  return [{
    id: "mystery-box-1",
    name: "Luxury Mystery Box",
    slug: "luxury-mystery-box",
    description: "Curated premium products, selected by our team. Each box contains 3-5 surprise items worth up to 500 MAD.",
    price: 199,
    valueLabel: "Worth up to 500 MAD",
    image: null,
    possibleRewards: [],
    stock: 15,
    active: true,
    createdAt: new Date().toISOString(),
  }];
}

const emptyHome: HomePageData = {
  featured: [],
  trending: [],
  categories: [],
  flashSale: [],
  deals: [],
  bundles: [],
  mysteryBoxes: [],
};

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const organizationId = await getDefaultOrganizationId();
    const cacheKey = `${CACHE_KEYS.featured()}:home:${organizationId}`;
    const cached = await getCache<HomePageData>(cacheKey);
    if (cached) return cached;

    const [featured, trending, categories, flashSale, deals, bundles, mysteryBoxes] = await Promise.all([
      fetchFeatured(organizationId),
      fetchTrending(organizationId),
      fetchCategories(organizationId),
      fetchFlashSale(organizationId),
      fetchDeals(organizationId),
      fetchBundles(organizationId),
      fetchMysteryBoxes(organizationId),
    ]);

    const data = { featured, trending, categories, flashSale, deals, bundles, mysteryBoxes };
    await setCache(cacheKey, data, CACHE_TTL.MEDIUM);
    return data;
  } catch {
    return emptyHome;
  }
}
