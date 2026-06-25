import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import { CACHE_KEYS, CACHE_TTL, getCache, setCache } from "@/lib/redis";
import { getCMSCache, setCMSCache } from "@/lib/cms/cache";
import type { HomepageConfigSchema } from "@/lib/cms/types";
import type { HomepageSectionData } from "@/components/home/HomepageSections";

export type HomePageData = {
  featured: Awaited<ReturnType<typeof fetchFeatured>>;
  trending: Awaited<ReturnType<typeof fetchTrending>>;
  categories: Awaited<ReturnType<typeof fetchCategories>>;
  flashSale: Awaited<ReturnType<typeof fetchFlashSale>>;
  homepageConfig: HomepageConfigSchema | null;
  homepageSections: HomepageSectionData[];
  useCmsLayout: boolean;
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
  homepageConfig: null,
  homepageSections: [],
  useCmsLayout: false,
};

async function fetchHomepageSections(organizationId: string): Promise<{
  config: HomepageConfigSchema | null;
  sections: HomepageSectionData[];
  useCmsLayout: boolean;
}> {
  const config = await prisma.homepageConfig.findFirst({
    where: { organizationId, isActive: true },
    include: {
      sections: { where: { isVisible: true }, orderBy: { displayOrder: "asc" } },
    },
  });

  if (!config || config.status !== "PUBLISHED" || config.sections.length === 0) {
    const cached = await getCMSCache<HomepageConfigSchema>("homepage", organizationId);
    return { config: cached, sections: [], useCmsLayout: false };
  }

  const homepageConfig: HomepageConfigSchema = {
    id: config.id,
    featuredCategories: config.featuredCategories,
    featuredProducts: config.featuredProducts,
    featuredBrands: config.featuredBrands,
    testimonials: config.testimonials as unknown[],
    newsletterEnabled: config.newsletterEnabled,
    newsletterTitle: config.newsletterTitle,
    newsletterSubtitle: config.newsletterSubtitle,
    isActive: config.isActive,
    status: config.status,
    version: config.version,
  };

  await setCMSCache("homepage", organizationId, homepageConfig);

  return {
    config: homepageConfig,
    sections: config.sections.map((s) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      subtitle: s.subtitle,
      config: (s.config as Record<string, unknown>) ?? {},
      isVisible: s.isVisible,
      displayOrder: s.displayOrder,
    })),
    useCmsLayout: true,
  };
}

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const organizationId = await getOptionalDefaultOrganizationId();
    if (!organizationId) return emptyHome;

    const productCacheKey = `${CACHE_KEYS.featured()}:home:${organizationId}`;
    const cachedProducts = await getCache<{ featured: unknown; trending: unknown; categories: unknown; flashSale: unknown }>(productCacheKey);

    const [{ config: homepageConfig, sections: homepageSections, useCmsLayout }, productData] = await Promise.all([
      fetchHomepageSections(organizationId),
      cachedProducts
        ? Promise.resolve(cachedProducts)
        : Promise.all([
            fetchFeatured(organizationId),
            fetchTrending(organizationId),
            fetchCategories(organizationId),
            fetchFlashSale(organizationId),
          ]).then(([featured, trending, categories, flashSale]) => ({ featured, trending, categories, flashSale })),
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

    return { featured, trending, categories, flashSale, homepageConfig, homepageSections, useCmsLayout };
  } catch {
    return emptyHome;
  }
}
