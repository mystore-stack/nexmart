// src/app/api/discover/route.ts
// Discover endpoint for mobile app - Returns curated products for the discover/swipe feature
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { getSession } from "@/lib/auth-api";

export const dynamic = "force-dynamic";

const discoverQuerySchema = {
  page: 1,
  limit: 20,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const session = await getSession();
    let organizationId;
    if (session) {
      organizationId = await getOrganizationIdForUser({ userId: session.userId });
    } else {
      organizationId = await getDefaultOrganizationId();
    }

    // Fetch featured products for discover - prioritize products with discounts and high ratings
    const where: any = {
      organizationId,
      published: true,
      // Filter out DEMO products
      OR: [
        { source: null },
        { source: { not: "DEMO" } }
      ],
      stock: { gt: 0 },
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [
          { comparePrice: { sort: 'desc', nulls: 'last' } }, // Products with discounts first
          { rating: "desc" },
          { soldCount: "desc" },
          { createdAt: "desc" }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Get category data for products
    const productCategoryIds = products.map(p => p.categoryId).filter(Boolean);
    const categories = await prisma.category.findMany({
      where: { id: { in: productCategoryIds } }
    });
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    // Transform products to match mobile app's expected format
    const items = products.map(product => {
      const category = product.categoryId ? categoryMap.get(product.categoryId) : null;
      const brand = product.tags?.find(t => category?.name !== t) || product.brand || '';
      const discount = product.comparePrice && product.comparePrice > product.price
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

      return {
        id: product.id,
        title: product.name,
        brand: brand,
        price: product.price,
        oldPrice: product.comparePrice || product.price,
        discount: discount,
        rating: product.rating || 0,
        blurb: product.description?.substring(0, 150) || '',
        stock: product.stock || 0,
        images: product.images || [],
        category: category?.name || '',
      };
    });

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("[DISCOVER API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch discover products" },
      { status: 500 }
    );
  }
}
