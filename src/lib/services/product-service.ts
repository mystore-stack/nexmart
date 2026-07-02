import { prisma } from "@/lib/prisma";

export interface GetProductsOptions {
  organizationId: string;
  search?: string;
  categoryId?: string;
  published?: "true" | "false" | "all";
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  skip?: number;
}

export interface GetProductsResult {
  products: any[];
  total: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Shared service for fetching products with consistent filtering and pagination
 * Used by both /api/admin/products and /api/admin/products/search
 */
export async function getProducts(options: GetProductsOptions): Promise<GetProductsResult> {
  const {
    organizationId,
    search,
    categoryId,
    published,
    minPrice,
    maxPrice,
    inStock,
    page = 1,
    limit = 50,
    skip = 0,
  } = options;

  // Build where clause with proper tenant isolation
  const where: any = {
    organizationId,
  };

  // Search filter
  if (search) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);
    where.OR = [
      ...(isUuid ? [{ id: search }] : []),
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  // Category filter
  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }

  if (inStock) {
    where.stock = { gt: 0 };
  }

  // Published filter
  if (published === "true") {
    where.published = true;
  } else if (published === "false") {
    where.published = false;
  }
  // If published is "all" or undefined, don't filter by published status

  console.log("[ProductService] Where clause:", JSON.stringify(where, null, 2));
  console.log("[ProductService] Executing Prisma query...");

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { 
        category: true, 
        variants: true, 
        _count: { select: { reviews: true, orderItems: true } } 
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  console.log("[ProductService] Products found:", products.length, "Total count:", total);

  // Calculate pagination
  const totalPages = Math.ceil(total / limit);
  const pagination = {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return {
    products,
    total,
    pagination,
  };
}

/**
 * Lightweight version for search API (minimal fields, no variants, no counts)
 */
export async function searchProducts(options: GetProductsOptions): Promise<any[]> {
  const {
    organizationId,
    search,
    categoryId,
    published,
    limit = 50,
  } = options;

  // Build where clause with proper tenant isolation
  const where: any = {
    organizationId,
  };

  // Search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  // Category filter
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Published filter
  if (published === "true") {
    where.published = true;
  } else if (published === "false") {
    where.published = false;
  }
  // If published is "all" or undefined, don't filter by published status

  console.log("[ProductService] Search where clause:", JSON.stringify(where, null, 2));

  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      price: true,
      comparePrice: true,
      published: true,
      stock: true,
      organizationId: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  console.log("[ProductService] Search results:", products.length);
  return products;
}
