// src/app/api/admin/products/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, created, getPaginationParams, buildPaginationMeta, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";
import { invalidateProductCache } from "@/lib/redis";
import slugify from "slugify";

const productSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  categoryId: z.string(),
  images: z
    .array(z.string().trim().min(1))
    .min(1, "At least 1 image is required"),
  tags: z
    .array(z.string().trim())
    .transform((arr) => arr.filter(Boolean))
    .default([]),
  sku: z.string().trim().min(1),
  stock: z.number().int().min(0),
  lowStockAt: z.number().int().min(0).default(5),
  weight: z.number().positive().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  variants: z
    .array(
      z.object({
        name: z.string(),
        value: z.string().trim().min(1),
        label: z.string().trim().min(1),
        price: z.number().optional(),
        stock: z.number().int().min(0),
        sku: z.string().trim().optional(),
      })
    )
    .default([]),
});

export async function GET(req: NextRequest) {
  try {
    console.log("[ADMIN PRODUCTS] GET - Starting request");
    const { organizationId, userId } = await requireAdmin();
    console.log("[ADMIN PRODUCTS] userId:", userId, "organizationId:", organizationId);
    
    if (!organizationId) {
      console.error("[ADMIN PRODUCTS] No organizationId found for user");
      throw new Error("No organization found for user. Please contact support.");
    }
    
    const { page, limit, skip } = getPaginationParams(req.nextUrl.searchParams);
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const categoryId = req.nextUrl.searchParams.get("categoryId") || undefined;
    const published = req.nextUrl.searchParams.get("published");

    console.log("[ADMIN PRODUCTS] Query params:", { page, limit, skip, search, categoryId, published });

    const where: any = {
      organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(published !== null && published !== undefined && { published: published === "true" }),
    };

    console.log("[ADMIN PRODUCTS] Prisma where clause:", JSON.stringify(where, null, 2));

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true, _count: { select: { reviews: true, orderItems: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    console.log("[ADMIN PRODUCTS] Products found:", products.length, "Total count:", total);

    // CRITICAL FIX: Log warning if no products found but organizationId is set
    if (products.length === 0 && total === 0) {
      console.warn("[ADMIN PRODUCTS] WARNING: No products found for organizationId:", organizationId);
      console.warn("[ADMIN PRODUCTS] This may indicate:");
      console.warn("[ADMIN PRODUCTS] 1. The organizationId is incorrect (user may be using default fallback)");
      console.warn("[ADMIN PRODUCTS] 2. No products exist in this organization");
      console.warn("[ADMIN PRODUCTS] 3. The user may need a Membership or Organization ownership record");
    }

    // Ensure products is always an array
    const productsArray = Array.isArray(products) ? products : [];
    
    const responseData = { 
      data: productsArray, 
      pagination: buildPaginationMeta(total, page, limit) 
    };
    
    console.log("[ADMIN PRODUCTS] RESPONSE PAYLOAD:", JSON.stringify(responseData, null, 2));
    
    return ok(responseData);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId, userId } = await requireAdmin();
    console.log("[ADMIN PRODUCTS] POST - userId:", userId, "organizationId:", organizationId);
    
    const body = await req.json();
    const data = productSchema.parse(body);

    const slug = slugify(data.name, { lower: true, strict: true });
    const { variants, ...productData } = data;

    const product = await prisma.product.create({
      data: {
        ...productData,
        organizationId,
        slug,
        variants: variants.length > 0 ? { create: variants } : undefined,
      },
      include: { category: true, variants: true },
    });

    console.log("[ADMIN PRODUCTS] Product created:", product.id, "for organization:", organizationId);
    await invalidateProductCache(product.id);
    return created(product);
  } catch (err) {
    return handleApiError(err);
  }
}
