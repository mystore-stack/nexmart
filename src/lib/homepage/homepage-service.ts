import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import { unstable_cache } from "next/cache";

export type HomepageData = {
  hero: any;
  announcementBar: any;
  featuredCategories: any[];
  featuredProducts: any[];
  trendingProducts: any[];
  flashDeals: any;
  superDeals: any[];
  mysteryBoxes: any[];
  bundles: any[];
  buyMoreSaveMore: any[];
  frequentlyBoughtTogether: any[];
  brands: any[];
  sponsoredProducts: any[];
  testimonials: any[];
  homepageConfig: any;
  visibleSections: string[]; // Array of visible section keys
  marketingCms: {
    advertisements: any[];
    campaigns: any[];
    sponsoredProducts: any[];
    flashDeals: any[];
    analytics: any;
  };
};

const emptyHomepage: HomepageData = {
  hero: null,
  announcementBar: null,
  featuredCategories: [],
  featuredProducts: [],
  trendingProducts: [],
  flashDeals: null,
  superDeals: [],
  mysteryBoxes: [],
  bundles: [],
  buyMoreSaveMore: [],
  frequentlyBoughtTogether: [],
  brands: [],
  sponsoredProducts: [],
  testimonials: [],
  homepageConfig: null,
  visibleSections: [],
  marketingCms: {
    advertisements: [],
    campaigns: [],
    sponsoredProducts: [],
    flashDeals: [],
    analytics: null,
  },
};


async function fetchHomepageDataUncached(organizationId: string): Promise<HomepageData> {
  try {
    console.log('[HOMEPAGE] Fetching homepage data for organization:', organizationId);
    const now = new Date();

    // Fetch visible sections from HomepageBuilder and HomepageSection
    const builder = await prisma.homepageBuilder.findFirst({
      where: { organizationId, isActive: true },
      include: {
        sections: {
          where: { isEnabled: true, publishStatus: 'PUBLISHED' },
          orderBy: { displayOrder: 'asc' },
          select: { sectionType: true },
        },
      },
    });

    const visibleSectionKeys = builder?.sections.map(s => s.sectionType) || [];
    console.log('[HOMEPAGE] Visible sections from database:', visibleSectionKeys);
    console.log('[HOMEPAGE] Visible sections count:', visibleSectionKeys.length);

    const [
      heroBanners,
      announcementBars,
      featuredCategories,
      flashDeals,
      superDeals,
      mysteryBoxes,
      bundles,
      buyMoreSaveMore,
      frequentlyBoughtTogether,
      brands,
      sponsoredProducts,
      testimonials,
      advertisements,
      campaigns,
    ] = await Promise.all([
      // Hero Banners
      prisma.heroBanner.findMany({
        where: { 
          isActive: true, 
          isPublished: true,
          status: "PUBLISHED"
        },
        orderBy: { displayOrder: "asc" },
        take: 5,
      }),
      
      // Announcement Bars - use HomepageSection with ANNOUNCEMENT_BAR type
      prisma.homepageSection.findMany({
        where: { 
          sectionType: "ANNOUNCEMENT_BAR",
          isEnabled: true,
          publishStatus: "PUBLISHED",
        },
        orderBy: { displayOrder: "asc" },
        take: 1,
      }),
      
      // Featured Categories
      prisma.category.findMany({
        where: { 
          parentId: null
        },
        include: {
          _count: {
            select: { products: true }
          }
        },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      
      // Flash Deals
      prisma.flashDeal.findMany({
        where: { 
          isVisible: true,
          isPublished: true,
          endDate: { gte: now }
        },
        include: {
          products: {
            include: {
              product: true
            },
            take: 4
          }
        },
        orderBy: { displayOrder: "asc" },
        take: 1,
      }),
      
      // Super Deals
      (prisma as any).superDeal.findMany({
        where: { 
          isVisible: true,
          isPublished: true,
        },
        include: {
          product: true
        },
        orderBy: [
          { featured: "desc" },
          { displayOrder: "asc" }
        ],
        take: 4,
      }),
      
      // Mystery Boxes
      prisma.mysteryBox.findMany({
        where: { 
          isVisible: true,
          isPublished: true,
          status: "PUBLISHED"
        },
        include: {
          products: {
            include: {
              product: true
            }
          }
        },
        orderBy: { displayOrder: "asc" },
        take: 4,
      }),
      
      // Product Bundles
      prisma.productBundle.findMany({
        where: { 
          active: true
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      
      // Buy More Save More
      prisma.buyMoreSaveMore.findMany({
        where: { 
          isVisible: true,
          isPublished: true
        },
        orderBy: { displayOrder: "asc" },
        take: 3,
      }),
      
      // Frequently Bought Together
      prisma.frequentlyBoughtTogether.findMany({
        where: { 
          isVisible: true,
          isPublished: true
        },
        include: {
          products: {
            include: {
              product: true
            }
          }
        },
        orderBy: { displayOrder: "asc" },
        take: 4,
      }),
      
      // Brands (from featured brands in homepage config or all brands)
      prisma.organization.findFirst({
        include: {
          googleBusinessProfiles: {
            where: { verified: true },
            take: 8,
          }
        }
      }),
      
      // Sponsored Products
      prisma.sponsoredProduct.findMany({
        where: { 
          isVisible: true,
          isPublished: true,
          // Only filter by endDate if it's set (null means no expiration)
          ...(now ? { endDate: { gte: now } } : {}),
        },
        include: {
          product: true
        },
        orderBy: { displayOrder: "asc" },
        take: 8,
      }).then(sp => {
        console.log('[HOMEPAGE] Sponsored Products RAW from DB:', sp.map(s => ({
          id: s.id,
          productId: s.productId,
          isVisible: s.isVisible,
          isPublished: s.isPublished,
          startDate: s.startDate,
          endDate: s.endDate,
          displayOrder: s.displayOrder,
          organizationId: s.organizationId,
          hasProduct: !!s.product,
          productName: s.product?.name
        })));
        return sp;
      }),
      
      // Testimonials
      prisma.testimonial.findMany({
        where: { 
          isVisible: true,
          isPublished: true
        },
        orderBy: { displayOrder: "asc" },
        take: 6,
      }),

      // Advertisements for Marketing CMS
      prisma.advertisement.findMany({
        where: {
          status: "PUBLISHED",
          placement: "HOMEPAGE_HERO",
          ...(now ? {
            startDate: { lte: now },
            endDate: { gte: now },
          } : {}),
        },
        orderBy: { priority: "desc" },
        take: 4,
      }),

      // Campaigns for Marketing CMS
      prisma.promoCampaign.findMany({
        where: {
          status: "PUBLISHED",
          ...(now ? {
            startDate: { lte: now },
            endDate: { gte: now },
          } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),

    ]);

    // Get featured products
    let featuredProducts = await prisma.product.findMany({
      where: {
        published: true,
        featured: true,
        isVisible: true
      },
      include: {
        category: true
      },
      take: 8,
      orderBy: { displayOrder: "asc" },
    });

    // Get trending products
    const trendingProducts = await prisma.product.findMany({
      where: {
        published: true,
        isVisible: true
      },
      include: {
        category: true
      },
      take: 8,
      orderBy: { displayOrder: "asc" },
    });

    // Format Super Deals data for component
    const formattedSuperDeals = superDeals
      .filter((deal: any) => deal.product && deal.product.published)
      .filter((deal: any) => {
        // Filter by isVisible and date range
        if (!deal.isVisible) return false;
        if (deal.startDate && new Date(deal.startDate) > now) return false;
        if (deal.endDate && new Date(deal.endDate) < now) return false;
        return true;
      })
      .map((deal: any) => {
        // Calculate deal price based on discount type
        let dealPrice = deal.dealPrice;
        if (!dealPrice && deal.discountType === "PERCENTAGE" && deal.discountValue > 0) {
          dealPrice = deal.product.price * (1 - deal.discountValue / 100);
        } else if (!dealPrice && deal.discountType === "FIXED_AMOUNT" && deal.discountValue > 0) {
          dealPrice = deal.product.price - deal.discountValue;
        }

        return {
          id: deal.id,
          product: {
            id: deal.product.id,
            name: deal.product.name,
            slug: deal.product.slug,
            image: deal.image || deal.product.images[0],
            price: deal.product.price,
            comparePrice: deal.originalPrice || deal.product.comparePrice,
            rating: deal.product.rating,
            soldCount: deal.product.soldCount,
          },
          dealPrice: dealPrice || deal.product.price,
          discountType: deal.discountType,
          discountValue: deal.discountValue,
          endDate: deal.endDate?.toISOString(),
          countdown: deal.countdown,
          featured: deal.featured,
          flashSale: deal.flashSale,
          backgroundColor: deal.backgroundColor,
          gradient: deal.gradient,
          buttonText: deal.buttonText,
          buttonUrl: deal.buttonUrl,
          title: deal.title,
          description: deal.description,
        };
      })
      .sort((a: any, b: any) => {
        // Sort by featured first, then by order
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });

    // Format Mystery Boxes data for component
    const formattedMysteryBoxes = mysteryBoxes
      .filter((box: any) => box.isVisible && box.status === "PUBLISHED")
      .map((box: any) => {
        console.log('[HOMEPAGE] Formatting mystery box:', { id: box.id, name: box.name, hasId: !!box.id });
        return {
          id: box.id,
          name: box.name,
          price: box.price,
          originalValue: box.originalValue,
          heroImage: box.heroImage,
          featured: box.featured,
          stockRemaining: box.stockRemaining,
          stockLimit: box.stockLimit,
        };
      });

    console.log('[HOMEPAGE] Data fetched:', {
      heroBanners: heroBanners.length,
      announcementBars: announcementBars.length,
      featuredCategories: featuredCategories.length,
      featuredProducts: featuredProducts.length,
      trendingProducts: trendingProducts.length,
      flashDeals: flashDeals.length,
      superDeals: formattedSuperDeals.length,
      mysteryBoxes: formattedMysteryBoxes.length,
      bundles: bundles.length,
      brands: brands?.googleBusinessProfiles?.length || 0,
      testimonials: testimonials.length,
    });

    return {
      hero: heroBanners[0] || null,
      announcementBar: announcementBars[0] || null,
      featuredCategories,
      featuredProducts,
      trendingProducts,
      flashDeals: flashDeals[0] || null,
      superDeals: formattedSuperDeals,
      mysteryBoxes: formattedMysteryBoxes,
      bundles,
      buyMoreSaveMore,
      frequentlyBoughtTogether,
      brands: brands?.googleBusinessProfiles || [],
      sponsoredProducts,
      testimonials,
      homepageConfig: null, // Removed old model, set to null
      visibleSections: visibleSectionKeys, // Only use database values, no hardcoded fallback
      marketingCms: {
        advertisements: advertisements?.filter((ad: any) => ad.status === 'PUBLISHED') || [],
        campaigns: campaigns?.filter((c: any) => c.status === 'PUBLISHED') || [],
        sponsoredProducts: sponsoredProducts?.filter((sp: any) => sp.isVisible && sp.isPublished) || [],
        flashDeals: flashDeals?.filter((fd: any) => fd.isVisible && fd.isPublished) || [],
        analytics: {
          totalAds: advertisements?.length || 0,
          totalCampaigns: campaigns?.length || 0,
          totalSponsored: sponsoredProducts?.length || 0,
          totalFlashDeals: flashDeals?.length || 0,
        },
      },
    };

    console.log('[HOMEPAGE] Final sponsoredProducts array:', sponsoredProducts.length, sponsoredProducts.map((sp: any) => ({
      id: sp.id,
      productId: sp.productId,
      hasProduct: !!sp.product,
      productName: sp.product?.name
    })));
  } catch (error) {
    console.error("[HOMEPAGE] Error fetching homepage data:", error);
    return emptyHomepage;
  }
}

// Cached version with ISR support - DISABLED FOR LIVE UPDATES
export const getHomepageData = unstable_cache(
  async (organizationId: string) => {
    console.log('[CACHE] Fetching homepage data (cached function called)');
    return fetchHomepageDataUncached(organizationId);
  },
  ["homepage-data"],
  {
    revalidate: false, // DISABLED: Set to false to disable caching for live updates
    tags: ["homepage"],
  }
);

// Wrapper that gets organization ID and calls cached function
export async function getHomepageDataWithOrg(): Promise<HomepageData> {
  console.log('[HOMEPAGE] Starting homepage data fetch...');
  
  const organizationId = await getOptionalDefaultOrganizationId();
  
  if (!organizationId) {
    console.error('[HOMEPAGE] No organization available');
    return emptyHomepage;
  }

  console.log('[HOMEPAGE] Organization ID resolved:', organizationId);
  
  const data = await getHomepageData(organizationId);
  
  console.log('[HOMEPAGE] Final data summary:', {
    organizationId,
    visibleSections: data.visibleSections.length,
    heroBanners: data.hero ? 1 : 0,
    announcementBars: data.announcementBar ? 1 : 0,
    featuredCategories: data.featuredCategories.length,
    featuredProducts: data.featuredProducts.length,
    trendingProducts: data.trendingProducts.length,
    flashDeals: data.flashDeals ? 1 : 0,
    superDeals: data.superDeals.length,
    mysteryBoxes: data.mysteryBoxes.length,
    bundles: data.bundles.length,
    buyMoreSaveMore: data.buyMoreSaveMore.length,
    frequentlyBoughtTogether: data.frequentlyBoughtTogether.length,
    brands: data.brands.length,
    sponsoredProducts: data.sponsoredProducts.length,
    testimonials: data.testimonials.length,
  });

  // If all data is empty, return empty homepage
  const hasAnyData = 
    data.hero || 
    data.announcementBar || 
    data.featuredCategories.length > 0 || 
    data.featuredProducts.length > 0 || 
    data.trendingProducts.length > 0 || 
    data.flashDeals || 
    data.superDeals.length > 0 || 
    data.mysteryBoxes.length > 0 || 
    data.bundles.length > 0 ||
    data.testimonials.length > 0;

  if (!hasAnyData) {
    console.warn('[HOMEPAGE] All data empty, returning empty homepage');
    return emptyHomepage;
  }

  return data;
}
