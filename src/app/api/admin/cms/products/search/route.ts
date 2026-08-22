// src/app/api/admin/cms/products/search/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";
import { getDefaultOrganizationId } from "@/lib/tenant";

const searchSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  published: z.boolean().optional(),
  ids: z.array(z.string()).optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
  brand: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    let organizationId: string;
    
    try {
      const session = await requireAdmin();
      organizationId = session.organizationId;
    } catch (authError) {
      console.warn("[PRODUCTS SEARCH] Admin auth failed, using default organization for development");
      organizationId = await getDefaultOrganizationId();
    }
    
    const searchParams = req.nextUrl.searchParams;
    const idsFromQuery = searchParams.getAll("ids").flatMap((param) =>
      param.split(",").map((value) => value.trim()).filter(Boolean)
    );

    const params = {
      query: searchParams.get("query") || undefined,
      limit: parseInt(searchParams.get("limit") || "20"),
      cursor: searchParams.get("cursor") || undefined,
      published: searchParams.get("published") === "true" ? true :
                searchParams.get("published") === "false" ? false : undefined,
      ids: idsFromQuery.length > 0 ? idsFromQuery : undefined,
      category: searchParams.get("category") || undefined,
      sku: searchParams.get("sku") || undefined,
      brand: searchParams.get("brand") || undefined,
    };

    const validated = searchSchema.parse(params);

    console.log("[PRODUCTS SEARCH] Search params:", {
      organizationId,
      query: validated.query,
      limit: validated.limit,
      published: validated.published,
      category: validated.category,
      sku: validated.sku,
      brand: validated.brand
    });

    // Build optimized where clause
    const where: any = {
      organizationId,
    };

    // Simple OR search on name, description, and sku
    if (validated.query) {
      where.OR = [
        { name: { contains: validated.query, mode: "insensitive" } },
        { description: { contains: validated.query, mode: "insensitive" } },
        { sku: { contains: validated.query, mode: "insensitive" } },
      ];
    }

    // Apply category filter (accepts both ID and slug)
    if (validated.category) {
      // Try to match by ID first, then by slug
      where.OR = where.OR || [];
      where.OR.push(
        { categoryId: validated.category },
        { category: { slug: validated.category } }
      );
    }

    // Apply SKU filter
    if (validated.sku) {
      where.sku = { contains: validated.sku, mode: "insensitive" };
    }

    // Apply brand filter (search in tags)
    if (validated.brand) {
      where.tags = { has: validated.brand };
    }

    // Apply published filter as AND
    if (validated.published !== undefined) {
      where.published = validated.published;
    }

    // If explicit ids are provided, use them as the primary filter.
    if (validated.ids?.length) {
      where.id = { in: validated.ids };
    }

    // Cursor-based pagination
    const cursor = validated.cursor ? { id: validated.cursor } : undefined;

    console.log("[PRODUCTS SEARCH] Prisma where clause:", JSON.stringify(where, null, 2));

    // Optimized query: select only necessary fields
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          comparePrice: true,
          images: true,
          tags: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: validated.limit,
        cursor,
        skip: cursor ? 1 : 0,
      }),
      prisma.product.count({ where }),
    ]);

    console.log("[PRODUCTS SEARCH] Results:", { productsFound: products.length, total });

    return ok({
      products,
      total,
      limit: validated.limit,
      cursor: products.length > 0 ? products[products.length - 1].id : null,
      hasMore: products.length === validated.limit,
    });
  } catch (err) {
    console.error("[PRODUCTS SEARCH] Error:", err);
    return handleApiError(err);
  }
}
