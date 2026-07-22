// src/lib/mobile-data.ts — Real data fetchers from Prisma (replaces mock data)
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import type { Deal, Bundle, MysteryBox } from "@/types";

/**
 * Get featured products for mobile home
 */
export async function getMobileFeaturedProducts() {
  const organizationId = await getDefaultOrganizationId();
  return prisma.product.findMany({
    where: { organizationId, published: true, featured: true },
    include: { category: true, variants: true },
    orderBy: { soldCount: "desc" },
    take: 6,
  });
}

/**
 * Get deals (products with comparePrice) for deals page
 */
export async function getMobileDeals(): Promise<Deal[]> {
  const organizationId = await getDefaultOrganizationId();
  const products = await prisma.product.findMany({
    where: {
      organizationId,
      published: true,
      comparePrice: { not: null },
      stock: { gt: 0 },
    },
    include: { category: true, variants: true },
    orderBy: { soldCount: "desc" },
    take: 10,
  });

  // Transform to Deal format (mock timestamps for now)
  return products.map((p) => ({
    id: `deal-${p.id}`,
    productId: p.id,
    product: p as any,
    discountPercentage: Math.round(
      ((p.comparePrice! - p.price) / p.comparePrice!) * 100
    ),
    startTime: new Date(Date.now() - 24 * 3600_000).toISOString(),
    endTime: new Date(Date.now() + 3 * 3600_000).toISOString(), // 3 hours
    stockLimit: p.stock,
    stockRemaining: Math.max(1, Math.floor(p.stock * 0.6)),
    active: true,
    createdAt: p.createdAt.toISOString(),
  }));
}

/**
 * Get all categories for home + category pages
 */
export async function getMobileCategories() {
  const organizationId = await getDefaultOrganizationId();
  return prisma.category.findMany({
    where: { organizationId, parentId: null },
    include: { _count: { select: { products: { where: { organizationId, published: true } } } } },
    orderBy: { name: "asc" },
  });
}

/**
 * Get products by category slug with filters
 */
export async function getMobileProductsByCategory(
  slug: string,
  {
    sort = "popular",
    inStock = false,
    minPrice,
    maxPrice,
  }: { sort?: string; inStock?: boolean; minPrice?: number; maxPrice?: number } = {}
) {
  const organizationId = await getDefaultOrganizationId();
  const category = await prisma.category.findFirst({
    where: { organizationId, slug },
  });
  if (!category) return [];

  let query = {
    where: {
      organizationId,
      categoryId: category.id,
      published: true,
      ...(inStock && { stock: { gt: 0 } }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
    },
    include: { category: true, variants: true },
    take: 50,
  };

  const products = await prisma.product.findMany(query);

  // Sort
  switch (sort) {
    case "price_asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      products.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case "discount":
      products.sort(
        (a, b) =>
          (b.comparePrice ? b.comparePrice - b.price : 0) -
          (a.comparePrice ? a.comparePrice - a.price : 0)
      );
      break;
    default:
      products.sort((a, b) => b.soldCount - a.soldCount); // popular
  }

  return products;
}

/**
 * Get single product by slug with all details
 */
export async function getMobileProduct(slug: string) {
  const organizationId = await getDefaultOrganizationId();
  return prisma.product.findFirst({
    where: { organizationId, slug },
    include: {
      category: true,
      variants: true,
      _count: { select: { reviews: true } },
    },
  });
}

/**
 * Get related products (same category, excluding current)
 */
export async function getMobileRelatedProducts(productId: string, categoryId: string) {
  const organizationId = await getDefaultOrganizationId();
  return prisma.product.findMany({
    where: {
      organizationId,
      categoryId,
      id: { not: productId },
      published: true,
    },
    include: { category: true },
    orderBy: { soldCount: "desc" },
    take: 4,
  });
}

/**
 * Get all products (for /m/products page)
 */
export async function getMobileAllProducts(sort = "popular") {
  const organizationId = await getDefaultOrganizationId();
  let products = await prisma.product.findMany({
    where: { organizationId, published: true },
    include: { category: true, variants: true },
    take: 100,
  });

  // Sort
  switch (sort) {
    case "price_asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      products.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    default:
      products.sort((a, b) => b.soldCount - a.soldCount);
  }

  return products;
}

/**
 * Get bundles (would need a Bundle model in schema)
 * For now, create pseudo-bundles from products
 */
export async function getMobileBundles(): Promise<Bundle[]> {
  const organizationId = await getDefaultOrganizationId();
  const products = await prisma.product.findMany({
    where: { organizationId, published: true, stock: { gt: 0 } },
    include: { category: true, variants: true },
    take: 6,
  });

  if (products.length < 2) return [];

  // Create 2 bundles from products
  const bundles: Bundle[] = [
    {
      id: "bundle-tech-1",
      name: "Premium Tech Bundle",
      slug: "premium-tech-bundle",
      description: "Get the best tech products together at a special price",
      products: products.slice(0, 2) as any,
      productIds: products.slice(0, 2).map(p => p.id),
      totalPrice: products.slice(0, 2).reduce((sum, p) => sum + p.price, 0),
      bundlePrice: Math.round(products.slice(0, 2).reduce((sum, p) => sum + p.price, 0) * 0.85),
      discount: Math.round(products.slice(0, 2).reduce((sum, p) => sum + p.price, 0) * 0.15),
      discountPercentage: 15,
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "bundle-lifestyle-1",
      name: "Lifestyle Essentials",
      slug: "lifestyle-essentials",
      description: "Curated lifestyle products for everyday use",
      products: products.slice(2, 4) as any,
      productIds: products.slice(2, 4).map(p => p.id),
      totalPrice: products.slice(2, 4).reduce((sum, p) => sum + p.price, 0),
      bundlePrice: Math.round(products.slice(2, 4).reduce((sum, p) => sum + p.price, 0) * 0.8),
      discount: Math.round(products.slice(2, 4).reduce((sum, p) => sum + p.price, 0) * 0.2),
      discountPercentage: 20,
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];

  return bundles;
}

/**
 * Get mystery boxes (would need a MysteryBox model in schema)
 */
export async function getMobileMysteryBoxes(): Promise<MysteryBox[]> {
  const organizationId = await getDefaultOrganizationId();
  const products = await prisma.product.findMany({
    where: { organizationId, published: true, stock: { gt: 0 }, featured: true },
    include: { category: true, variants: true },
    take: 6,
  });

  const mysteryBoxes: MysteryBox[] = [
    {
      id: "mystery-box-1",
      name: "Luxury Mystery Box",
      slug: "luxury-mystery-box",
      description: "Curated premium products, selected by our team. Each box contains 3-5 surprise items worth up to 500 MAD.",
      price: 199,
      valueLabel: "Worth up to 500 MAD",
      image: undefined,
      possibleRewards: products.slice(0, 4) as any,
      stock: 15,
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "mystery-box-2",
      name: "Tech Surprise Box",
      slug: "tech-surprise-box",
      description: "A curated selection of tech gadgets and accessories. Perfect for tech enthusiasts.",
      price: 299,
      valueLabel: "Worth up to 700 MAD",
      image: undefined,
      possibleRewards: products.slice(2, 6) as any,
      stock: 8,
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];

  return mysteryBoxes;
}
