// src/lib/home-data.ts — CMS-Only Homepage Data Fetcher
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { sanitizeProducts } from "@/lib/data-validation";
import { normalizeToCanonicalKey } from "@/lib/homepage/canonical-contract";

export type HomePageData = {
  categories: Awaited<ReturnType<typeof fetchCategories>>;
  cms: {
    homeSections: any[];
  };
};

async function fetchCategories(organizationId: string) {
  try {
    const categories = await prisma.category.findMany({
      where: { organizationId, parentId: null },
      orderBy: { name: "asc" },
      take: 8,
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

    // Add product counts to categories
    return categories.map((category: any) => ({
      ...category,
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
    const homeSections = await prisma.homePageSection.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    });

    // Get section products manually since there's no relation defined
    const sectionIds = homeSections.map((s: any) => s.id);
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
    const productMap = new Map(products.map(p => [p.id, p]));
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    
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
    const featuredProductsSection = homeSections.find(s => 
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
        const allProductIds = allPublishedProducts.map(p => p.id);
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

    const processedHomeSections = homeSections.map((section: any) => ({
      ...section,
      sectionKey: normalizeToCanonicalKey(section.sectionKey) || section.sectionKey,
      // Safe parse JSON config if needed
      config: typeof section.config === 'string' ? JSON.parse(section.config) : (section.config || {}),
      // Add products from the grouped map
      products: productsBySection.get(section.id) || []
    }));

    return {
      homeSections: processedHomeSections,
    };
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    return {
      homeSections: [],
    };
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  try {
    const organizationId = await getDefaultOrganizationId();

    const [categories, cms] = await Promise.all([
      fetchCategories(organizationId),
      fetchCmsData(),
    ]);

    return { 
      categories: sanitizeProducts(categories as any), 
      cms 
    };
  } catch (error) {
    console.error('Error getting home page data:', error);
    return {
      categories: [],
      cms: { homeSections: [] }
    };
  }
}
