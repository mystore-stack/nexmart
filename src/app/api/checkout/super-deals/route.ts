import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = session.organizationId;
    const userId = session.userId;

    const searchParams = req.nextUrl.searchParams;
    const cartProductIds = searchParams.get("cartProductIds");

    // Parse cart product IDs if provided
    const excludeProductIds = cartProductIds ? cartProductIds.split(",") : [];

    const now = new Date();

    // Fetch active, published, and non-expired Super Deals
    const superDeals = await (prisma as any).superDeal.findMany({
      where: {
        organizationId,
        isVisible: true,
        isPublished: true,
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ],
        // Exclude products already in cart
        ...(excludeProductIds.length > 0 && {
          productId: { notIn: excludeProductIds }
        })
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: [
        { featured: "desc" },
        { displayOrder: "asc" }
      ],
      take: 10,
    });

    // Filter out deals with no stock
    const availableDeals = superDeals.filter((deal: any) => {
      if (deal.stockLimit !== null && deal.stockLimit <= 0) {
        return false;
      }
      return true;
    });

    // Format response
    const formattedDeals = availableDeals.map((deal: any) => {
      const originalPrice = deal.originalPrice || deal.product?.price || 0;
      const dealPrice = deal.dealPrice || 0;
      const discountPercent = deal.discountType === "PERCENTAGE" 
        ? deal.discountValue 
        : originalPrice > 0 
          ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100)
          : 0;

      return {
        id: deal.id,
        title: deal.title || deal.product?.name,
        description: deal.description,
        image: deal.image || deal.bannerImage || deal.product?.images?.[0],
        productId: deal.productId,
        originalPrice,
        dealPrice,
        discountPercent,
        discountType: deal.discountType,
        discountValue: deal.discountValue,
        stockLimit: deal.stockLimit,
        featured: deal.featured,
        flashSale: deal.flashSale,
        startDate: deal.startDate,
        endDate: deal.endDate,
        product: deal.product ? {
          id: deal.product.id,
          name: deal.product.name,
          slug: deal.product.slug,
          price: deal.product.price,
          images: deal.product.images,
          stock: deal.product.stock,
          category: deal.product.category
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      deals: formattedDeals
    });
  } catch (error) {
    console.error("[SUPER_DEALS_CHECKOUT] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch super deals";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
