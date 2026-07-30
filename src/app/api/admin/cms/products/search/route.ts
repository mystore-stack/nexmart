// src/app/api/admin/cms/products/search/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const searchSchema = z.object({
  query: z.string().optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  published: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    
    const searchParams = req.nextUrl.searchParams;
    const params = {
      query: searchParams.get("query") || undefined,
      sku: searchParams.get("sku") || undefined,
      category: searchParams.get("category") || undefined,
      brand: searchParams.get("brand") || undefined,
      published: searchParams.get("published") === "true" ? true : 
                searchParams.get("published") === "false" ? false : undefined,
      limit: parseInt(searchParams.get("limit") || "20"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    const validated = searchSchema.parse(params);

    // Build where clause
    const where: any = {};

    if (validated.query) {
      where.OR = [
        { name: { contains: validated.query, mode: "insensitive" } },
        { description: { contains: validated.query, mode: "insensitive" } },
        { sku: { contains: validated.query, mode: "insensitive" } },
        { tags: { hasSome: [validated.query] } },
      ];
    }

    if (validated.sku) {
      where.sku = { contains: validated.sku, mode: "insensitive" };
    }

    if (validated.category) {
      where.category = {
        slug: validated.category,
      };
    }

    if (validated.brand) {
      where.tags = { has: validated.brand };
    }

    if (validated.published !== undefined) {
      where.published = validated.published;
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
        take: validated.limit,
        skip: validated.offset,
      }),
      prisma.product.count({ where }),
    ]);

    return ok({
      data: products,
      meta: {
        total,
        limit: validated.limit,
        offset: validated.offset,
        hasMore: validated.offset + validated.limit < total,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
