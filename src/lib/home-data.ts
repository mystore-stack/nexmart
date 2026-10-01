// src/lib/home-data.ts — CMS-Only Homepage Data Fetcher
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { sanitizeProducts } from "@/lib/data-validation";
import { normalizeToCanonicalKey } from "@/lib/homepage/canonical-contract";
import { getPublishedMomentOffers } from "@/lib/moment-offers";

export type HomePageData = {
  categories: Awaited<ReturnType<typeof fetchCategories>>;
  cms: {
    homeSections: any[];
    brandPartners: any[];
    heroContent: any;
    heroCards: any[];
    categoryBubbles: any[];
    showcaseCards: any[];
    newsletterPerks: any[];
    sponsored: any[];
    momentOffers: any[];
  };
};

async function fetchCategories(organizationId: string) {
  try {
    console.log('[HOME-DATA] Fetching categories for organization:', organizationId);
    
    const categories = await prisma.category.findMany({
      where: { organizationId, parentId: null },
      orderBy: { name: "asc" },
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        description: true,
      },
    });

    console.log('[HOMEPAGE CATEGORIES FETCH]', {
      count: categories.length,
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        hasImage: !!c.image,
        image: c.image,
      }))
    });

    // Count products for each category manually
    const categoryIds = categories.map((c: any) => c.id);

    const productCounts = await prisma.product.groupBy({
      by: ['categoryId'],
      where: { 
        organizationId, 
        published: true,
        categoryId: { in: categoryIds }
      },
      _count: { categoryId: true }
    });

    const countMap = new Map(productCounts.map((pc: any) => [pc.categoryId, pc._count.categoryId]));

    // Add product counts to categories and ensure clean serialization
    return categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      description: category.description,
      _count: {
        products: countMap.get(category.id) || 0
      }
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function fetchCmsData() {
  try {
    const organizationId = await getDefaultOrganizationId();
    const now = new Date();
    
    const homeSections = await prisma.homePageSection.findMany({
      orderBy: { displayOrder: "asc" },
      where: {
        // Filter by enabled
        enabled: true,
      }
    });

    // Filter by date range at application level
    const dateFilteredSections = homeSections.filter((section: any) => {
      // Check startDate: must be null or <= now
      if (section.startDate && new Date(section.startDate) > now) {
        return false;
      }
      // Check endDate: must be null or >= now
      if (section.endDate && new Date(section.endDate) < now) {
        return false;
      }
      return true;
    });
    const brandPartners = await prisma.brandPartner.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      take: 12,
    });

    // Fetch new CMS data structures
    const heroContent = await prisma.heroContent.findFirst({
      where: { active: true },
    }) || null;

    const heroCards = await prisma.heroCardConfig.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    const categoryBubbles = await prisma.categoryBubbleConfig.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    const showcaseCards = await prisma.showcaseCardConfig.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    const newsletterPerks = await prisma.newsletterPerk.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    // Fetch sponsored products
    const sponsored = await prisma.sponsoredProduct.findMany({
      where: {
        active: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          { 
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      orderBy: { order: "asc" },
      take: 8
    });

    // Process sections to ensure enabled field is properly set
    const processedHomeSections = dateFilteredSections.map((section: any) => ({
      ...section,
      sectionKey: normalizeToCanonicalKey(section.sectionKey) || section.sectionKey,
      // Safe parse JSON config if needed
      config: typeof section.config === 'string' ? JSON.parse(section.config) : (section.config || {}),
      // Normalize enabled to boolean - single source of truth for section visibility
      active: section.active,
      enabled: section.enabled === true || section.enabled === "true" || section.enabled === 1,
    }));

    // Get section products manually since there's no relation defined
    const sectionIds = processedHomeSections.map((s: any) => s.id);
    const sectionProducts = await prisma.homepageSectionProduct.findMany({
      where: { 
        sectionId: { in: sectionIds },
        active: true 
      },
      orderBy: { order: "asc" },
    });

    // Get all product IDs from section products
    const productIds = sectionProducts.map((sp: any) => sp.productId).filter(Boolean);
    
    // Get all products at once (without relations)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Get all variants for these products
    const variants = await prisma.productVariant.findMany({
      where: { productId: { in: productIds } }
    });

    // Get all categories for these products
    const categoryIds = products.map((p: any) => (p as any).categoryId).filter(Boolean);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    });

    // Create maps for quick lookup
    const productMap = new Map(products.map((p: any) => [p.id, p]));
    const categoryMap = new Map(categories.map((c: any) => [c.id, c]));
    
    // Group variants by productId
    const variantsByProduct = new Map();
    variants.forEach((v: any) => {
      if (!variantsByProduct.has(v.productId)) {
        variantsByProduct.set(v.productId, []);
      }
      variantsByProduct.get(v.productId).push(v);
    });

    // Group products by sectionId with full product data
    const productsBySection = new Map();
    sectionProducts.forEach((sp: any) => {
      if (!productsBySection.has(sp.sectionId)) {
        productsBySection.set(sp.sectionId, []);
      }
      const product = sp.productId ? productMap.get(sp.productId) : null;
      if (product) {
        const category = (product as any).categoryId ? categoryMap.get((product as any).categoryId) : null;
        const productVariants = variantsByProduct.get((product as any).id) || [];
        
        productsBySection.get(sp.sectionId).push({
          ...product,
          category: category,
          variants: productVariants,
          customPrice: sp.customPrice,
          customBadge: sp.customBadge,
          order: sp.order
        });
      }
    });

    // Handle category-based products for featuredProducts section
    const featuredProductsSection = processedHomeSections.find((s: any) => 
      normalizeToCanonicalKey(s.sectionKey) === 'featuredProducts'
    );
    
    if (featuredProductsSection) {
      const config = typeof featuredProductsSection.config === 'string' 
        ? JSON.parse(featuredProductsSection.config) 
        : (featuredProductsSection.config || {});
      
      // If category tabs are enabled, fetch all published products
      if (config.enableTabs !== false) {
        const allPublishedProducts = await prisma.product.findMany({
          where: {
            organizationId,
            published: true,
            isVisible: true
          },
          include: {
            category: true
          },
          orderBy: { displayOrder: "asc" }
        });

        // Get variants for all published products
        const allProductIds = allPublishedProducts.map((p: any) => p.id);
        const allVariants = await prisma.productVariant.findMany({
          where: { productId: { in: allProductIds } }
        });

        // Group variants by productId
        const allVariantsByProduct = new Map();
        allVariants.forEach((v: any) => {
          if (!allVariantsByProduct.has(v.productId)) {
            allVariantsByProduct.set(v.productId, []);
          }
          allVariantsByProduct.get(v.productId).push(v);
        });

        // Add variants to products
        const productsWithVariants = allPublishedProducts.map((product: any) => ({
          ...product,
          variants: allVariantsByProduct.get(product.id) || []
        }));

        productsBySection.set(featuredProductsSection.id, productsWithVariants);
      }
    }

    // Add products to the processed sections
    const finalProcessedSections = processedHomeSections.map((section: any) => ({
      ...section,
      products: productsBySection.get(section.id) || []
    }));

    // AUTO-POPULATE DISABLED FOR CLEAN SLATE - Auto-populate empty sections with real products from database
    const sectionIdsToPopulate = finalProcessedSections
      .filter((s: any) => s.enabled && (!s.products || s.products.length === 0))
      .map((s: any) => s.id);

    console.log("[AUTO-POPULATE DEBUG]", {
      totalSections: finalProcessedSections.length,
      enabledSections: finalProcessedSections.filter((s: any) => s.enabled).length,
      emptySections: sectionIdsToPopulate.length,
      sectionIdsToPopulate
    });

    if (false && sectionIdsToPopulate.length > 0) { // DISABLED AUTO-POPULATE
      console.log("[AUTO-POPULATE] Fetching products for empty sections");

      // Fetch real products from database for empty sections
      const allPublishedProducts = await prisma.product.findMany({
        where: {
          organizationId,
          published: true,
          isVisible: true,
          stock: { gt: 0 }
        },
        include: {
          category: true
        },
        orderBy: { displayOrder: "asc" },
        take: 50
      });

      console.log("[AUTO-POPULATE] Found products in DB:", allPublishedProducts.length);

      if (allPublishedProducts.length > 0) {
        // Get variants for all products
        const allProductIds = allPublishedProducts.map((p: any) => p.id);
        const allVariants = await prisma.productVariant.findMany({
          where: { productId: { in: allProductIds } }
        });

        // Group variants by productId
        const variantsByProduct = new Map();
        allVariants.forEach((v: any) => {
          if (!variantsByProduct.has(v.productId)) {
            variantsByProduct.set(v.productId, []);
          }
          variantsByProduct.get(v.productId).push(v);
        });

        // Add variants to products
        const productsWithVariants = allPublishedProducts.map((product: any) => ({
          ...product,
          variants: variantsByProduct.get(product.id) || []
        }));

        // Populate each empty section
        for (const sectionId of sectionIdsToPopulate) {
          const section = finalProcessedSections.find((s: any) => s.id === sectionId);
          if (!section) continue;

          const sectionKey = normalizeToCanonicalKey(section.sectionKey);
          let productsToAssign: any[] = [];

          console.log("[AUTO-POPULATE] Processing section:", sectionKey, "ID:", sectionId);

          // Select products based on section type
          switch (sectionKey) {
            case 'showcaseGrid':
              // Mix of bestsellers, new arrivals, featured
              productsToAssign = productsWithVariants
                .sort((a: any, b: any) => (b.soldCount || 0) - (a.soldCount || 0))
                .slice(0, 4);
              console.log("[AUTO-POPULATE] showcaseGrid assigned:", productsToAssign.length, "products");
              break;
            case 'flashSale':
              // Products with comparePrice (discounted)
              productsToAssign = productsWithVariants
                .filter((p: any) => p.comparePrice && p.comparePrice > p.price)
                .slice(0, 8);
              if (productsToAssign.length === 0) {
                productsToAssign = productsWithVariants.slice(0, 8);
              }
              break;
            case 'trendingProducts':
            case 'bestSellers':
              // Top selling products
              productsToAssign = productsWithVariants
                .sort((a: any, b: any) => (b.soldCount || 0) - (a.soldCount || 0))
                .slice(0, 8);
              break;
            case 'newArrivals':
              // Newest products by createdAt
              productsToAssign = productsWithVariants
                .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                .slice(0, 8);
              break;
            case 'featuredProducts':
              // Featured products
              productsToAssign = productsWithVariants
                .filter((p: any) => p.featured)
                .slice(0, 18);
              if (productsToAssign.length === 0) {
                productsToAssign = productsWithVariants.slice(0, 18);
              }
              break;
            case 'recommended':
            case 'relatedProducts':
              // Random selection for recommendations
              productsToAssign = productsWithVariants
                .sort(() => Math.random() - 0.5)
                .slice(0, 6);
              break;
            case 'bundleBuilder':
            case 'bundleProducts':
              // Products suitable for bundling
              productsToAssign = productsWithVariants
                .filter((p: any) => p.comparePrice)
                .slice(0, 6);
              if (productsToAssign.length === 0) {
                productsToAssign = productsWithVariants.slice(0, 6);
              }
              break;
            case 'seasonalCollection':
              productsToAssign = productsWithVariants.slice(0, 3);
              break;
            case 'lastChance':
              // Low stock products
              productsToAssign = productsWithVariants
                .filter((p: any) => p.stock && p.stock < 10)
                .slice(0, 4);
              if (productsToAssign.length === 0) {
                productsToAssign = productsWithVariants.slice(0, 4);
              }
              break;
            default:
              // Default: take first 8 products
              productsToAssign = productsWithVariants.slice(0, 8);
          }

          // Create homepageSectionProduct records
          if (productsToAssign.length > 0) {
            await prisma.homepageSectionProduct.createMany({
              data: productsToAssign.map((product: any, index: number) => ({
                sectionId: sectionId,
                productId: product.id,
                order: index,
                customBadge: product.comparePrice ? "-20%" : null,
                active: true
              })),
              skipDuplicates: true
            });

            // Update section in result
            section.products = productsToAssign;
          }
        }
      }
    }

    return {
      homeSections: finalProcessedSections,
      brandPartners,
      heroContent,
      heroCards,
      categoryBubbles,
      showcaseCards,
      newsletterPerks,
      sponsored,
    };
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    return {
      homeSections: [],
      brandPartners: [],
      heroContent: null,
      heroCards: [],
      categoryBubbles: [],
      showcaseCards: [],
      newsletterPerks: [],
      sponsored: [],
    };
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const organizationId = await getDefaultOrganizationId();

    const [categories, cms, momentOffers] = await Promise.all([
      fetchCategories(organizationId),
      fetchCmsData(),
      getPublishedMomentOffers(),
    ]);

    return {
      categories: categories, // Don't sanitize - categories are already clean
      cms: {
        ...cms,
        momentOffers,
      }
    };
  } catch (error) {
    console.error('Error getting home page data:', error);
    return {
      categories: [],
      cms: {
        homeSections: [],
        brandPartners: [],
        heroContent: null,
        heroCards: [],
        categoryBubbles: [],
        showcaseCards: [],
        newsletterPerks: [],
        sponsored: [],
        momentOffers: [],
      }
    };
  }
}
