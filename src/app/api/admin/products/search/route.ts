import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const published = searchParams.get("published");
    const limit = parseInt(searchParams.get("limit") || "50");

    console.log("[PRODUCTS_SEARCH] Request:", {
      userId: session.userId,
      organizationId: session.organizationId,
      search,
      published,
      limit,
    });

    // Build where clause with proper tenant isolation
    const where: any = {
      organizationId: session.organizationId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    // Only filter by published if explicitly set to true
    if (published === "true") {
      where.published = true;
    }

    console.log("[PRODUCTS_SEARCH] Where clause:", JSON.stringify(where, null, 2));

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

    console.log("[PRODUCTS_SEARCH] Found products:", products.length);
    console.log("[PRODUCTS_SEARCH] Sample products:", products.slice(0, 3).map(p => ({ id: p.id, name: p.name, orgId: p.organizationId })));

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("[PRODUCTS_SEARCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search products" },
      { status: 500 }
    );
  }
}
