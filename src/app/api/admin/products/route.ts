// src/app/api/admin/products/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { ok, created, forbidden, handleApiError, getPaginationParams, buildPaginationMeta } from "@/lib/api";
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
    .min(1, "At least 1 valid image URL is required"),
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

async function requireAdmin(req: NextRequest) {
  const payload = await getAuthFromRequest(req);
  if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
    throw new Error("Forbidden");
  }
  return { payload, organizationId: await getOrganizationIdForUser(payload) };
}

export async function GET(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin(req);
    const { page, limit, skip } = getPaginationParams(req.nextUrl.searchParams);
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const categoryId = req.nextUrl.searchParams.get("categoryId") || undefined;
    const published = req.nextUrl.searchParams.get("published");

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

    return ok({ data: products, pagination: buildPaginationMeta(total, page, limit) });
  } catch (err) {
    if ((err as Error).message === "Forbidden") return forbidden();
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin(req);
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

    await invalidateProductCache(product.id);
    return created(product);
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2002") {
      return handleApiError(new Error("A product with this SKU or slug already exists."));
    }
    // Zod validation errors
    if (err?.name === "ZodError" && Array.isArray(err?.issues)) {
      const message = err.issues
        .map((i: any) => i?.message)
        .filter(Boolean)
        .join(" | ");
      return handleApiError(new Error(message || "Invalid product payload"));
    }
    return handleApiError(err);
  }
}
