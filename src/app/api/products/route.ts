// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { getSession } from "@/lib/auth-api";
import { CACHE_TTL, getCache, setCache } from "@/lib/redis";
import { z } from "zod";

export const dynamic = "force-dynamic";

const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
  category: z.string().trim().optional(),
  sort: z
    .enum(["relevance", "popular", "price_asc", "price_desc", "newest", "rating", "discount"])
    .default("popular"),
  minPrice: z.coerce.number().min(0).default(0),
  maxPrice: z.coerce.number().min(0).default(999999),
  q: z.string().trim().optional(),
  featured: z.coerce.boolean().default(false),
  sale: z.coerce.boolean().default(false),
  brand: z.string().trim().optional(),
  rating: z.coerce.number().min(0).max(5).default(0),
  inStock: z.coerce.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = productQuerySchema.parse(Object.fromEntries(searchParams));
    const {
      page,
      limit,
      category,
      sort,
      minPrice,
      maxPrice,
      q: search,
      featured,
      sale,
      brand,
      rating,
      inStock,
    } = query;

    const cacheKey = `products:list:${searchParams.toString()}`;
    const cached = await getCache<{ products: unknown[]; pagination: object }>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, ...cached, cached: true });
    }

    const session = await getSession();
    let organizationId;
    if (session) {
      organizationId = await getOrganizationIdForUser({ userId: session.userId });
    } else {
      organizationId = await getDefaultOrganizationId();
    }

    console.log("[PRODUCTS API] session:", session?.userId, "organizationId:", organizationId);

    const where: any = {
      organizationId,
      published: true,
      price: { gte: minPrice, lte: maxPrice },
      ...(category && { category: { organizationId, slug: category } }),
      ...(featured && { featured: true }),
      ...(sale && { comparePrice: { not: null } }),
      ...(brand && { tags: { has: brand } }),
      ...(rating > 0 && { rating: { gte: rating } }),
      ...(inStock && { stock: { gt: 0 } }),
      ...(search && {
        OR: [
          { name:        { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { tags:        { has: search } },
        ],
      }),
    };

    console.log("[PRODUCTS API] where clause:", JSON.stringify(where, null, 2));

    const orderBy: any =
      sort === "price_asc"  ? { price: "asc" }      :
      sort === "price_desc" ? { price: "desc" }     :
      sort === "newest"     ? { createdAt: "desc" }  :
      sort === "rating"     ? { rating: "desc" }     :
      sort === "discount"   ? { comparePrice: "desc" } :
      [{ soldCount: "desc" }, { rating: "desc" }];

    if (sort === "discount") {
      where.comparePrice = { not: null };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    console.log("[PRODUCTS API] Products found:", products.length, "Total:", total);

    const payload = {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
    await setCache(cacheKey, payload, CACHE_TTL.SHORT);
    return NextResponse.json({ success: true, ...payload });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
