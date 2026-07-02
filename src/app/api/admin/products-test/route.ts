// src/app/api/admin/products-test/route.ts
// Test endpoint for admin products query without authentication (for debugging)
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { ok, handleApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    console.log("[PRODUCTS-TEST] Running admin products test without auth");

    // Use default organizationId for testing
    const organizationId = "a884ca35-332c-4997-8262-36b762c96ccf";
    console.log("[PRODUCTS-TEST] Using organizationId:", organizationId);

    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 20;
    const skip = Number(req.nextUrl.searchParams.get("skip")) || 0;
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const published = req.nextUrl.searchParams.get("published");

    console.log("[PRODUCTS-TEST] Query params:", { page, limit, skip, search, published });

    const where: any = {
      organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(published !== null && published !== undefined && { published: published === "true" }),
    };

    console.log("[PRODUCTS-TEST] Prisma where clause:", JSON.stringify(where, null, 2));

    // DEBUG: Count products BEFORE applying organization filter
    const totalBeforeFilter = await prisma.product.count();
    console.log("[PRODUCTS-TEST] Total products in DB (before org filter):", totalBeforeFilter);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true, _count: { select: { reviews: true, orderItems: true } } },
        orderBy: { createdAt: "desc" },
        skip: Number(skip),
        take: Number(limit),
      }),
      prisma.product.count({ where }),
    ]);

    // DEBUG: Log counts before/after filter
    console.log("[PRODUCTS-TEST] Products count AFTER org filter:", total);
    console.log("[PRODUCTS-TEST] Products filtered out:", totalBeforeFilter - total);

    console.log("[PRODUCTS-TEST] Products found:", products.length, "Total count:", total);
    console.log("[PRODUCTS-TEST] Sample product:", products[0] ? JSON.stringify(products[0], null, 2) : "No products");

    const productsArray = Array.isArray(products) ? products : [];
    
    const responseData = { data: productsArray, pagination: { total, page, limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
    console.log("[PRODUCTS-TEST] Raw API response:", JSON.stringify({
      success: true,
      dataLength: productsArray.length,
      pagination: responseData.pagination
    }, null, 2));
    
    return ok(responseData);
  } catch (err) {
    console.error("[PRODUCTS-TEST] Error:", err);
    return handleApiError(err);
  }
}
