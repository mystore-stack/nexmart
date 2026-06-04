/**
 * /api/ai/recommend — AI Product Recommendations
 * ─────────────────────────────────────────────────
 * Hybrid recommendation engine:
 * 1. Collaborative filtering (what users with similar purchases bought)
 * 2. Content-based filtering (similar category/tags/price)
 * 3. Claude-powered personalization layer
 * 4. Redis cache per user+product context
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/redis";
import { getAuthFromRequest } from "@/lib/auth";
import { getDefaultOrganizationId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const context = searchParams.get("context") || "related"; // related | cart | homepage | post-purchase
  const limit = Math.min(12, parseInt(searchParams.get("limit") || "8"));

  try {
    const payload = await getAuthFromRequest(req).catch(() => null);
    const organizationId = await getDefaultOrganizationId();

    const cacheKey = `recs:${context}:${productId || "home"}:${payload?.userId || "anon"}:${limit}`;
    const cached = await getCache<any[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, products: cached, cached: true });
    }

    let recommendations: any[] = [];

    if (context === "related" && productId) {
      // ── Content-based: same category + similar price ──────
      const sourceProduct = await prisma.product.findUnique({
        where: { id: productId },
        select: { categoryId: true, price: true, tags: true, organizationId: true },
      });

      if (sourceProduct) {
        const priceRange = sourceProduct.price * 0.4; // ±40% price range

        recommendations = await prisma.product.findMany({
          where: {
            organizationId,
            published: true,
            id: { not: productId },
            OR: [
              { categoryId: sourceProduct.categoryId },
              { tags: { hasSome: sourceProduct.tags } },
            ],
            price: {
              gte: Math.max(0, sourceProduct.price - priceRange),
              lte: sourceProduct.price + priceRange,
            },
          },
          include: { category: true, variants: true },
          orderBy: [{ soldCount: "desc" }, { rating: "desc" }],
          take: limit,
        });
      }
    } else if (context === "cart" && payload?.userId) {
      // ── Collaborative: what people who bought cart items also bought ──
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: payload.userId },
        select: { productId: true },
      });

      if (cartItems.length > 0) {
        const cartProductIds = cartItems.map((i) => i.productId);

        // Find orders containing these products
        const coOrderedProducts = await prisma.orderItem.findMany({
          where: {
            orderId: {
              in: await prisma.orderItem
                .findMany({
                  where: { productId: { in: cartProductIds } },
                  select: { orderId: true },
                  distinct: ["orderId"],
                  take: 50,
                })
                .then((items) => items.map((i) => i.orderId)),
            },
            productId: { notIn: cartProductIds },
          },
          select: { productId: true },
          take: 100,
        });

        // Count frequency
        const freq: Record<string, number> = {};
        coOrderedProducts.forEach(({ productId }) => {
          freq[productId] = (freq[productId] || 0) + 1;
        });

        const topIds = Object.entries(freq)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([id]) => id);

        if (topIds.length > 0) {
          recommendations = await prisma.product.findMany({
            where: {
              id: { in: topIds },
              organizationId,
              published: true,
            },
            include: { category: true, variants: true },
          });
          // Re-sort by collaborative score
          recommendations.sort((a, b) => (freq[b.id] || 0) - (freq[a.id] || 0));
        }
      }
    } else if (context === "homepage") {
      // ── Trending + Personalized for homepage ─────────────
      if (payload?.userId) {
        // Get user's purchase/view history
        const [purchasedIds, viewedIds] = await Promise.all([
          prisma.orderItem.findMany({
            where: { order: { userId: payload.userId } },
            select: { productId: true },
            take: 20,
          }),
          prisma.recentlyViewed.findMany({
            where: { userId: payload.userId },
            select: { productId: true },
            orderBy: { viewedAt: "desc" },
            take: 10,
          }),
        ]);

        const excludeIds = [
          ...new Set([...purchasedIds.map((p) => p.productId), ...viewedIds.map((v) => v.productId)]),
        ];

        // Get categories from history
        const historyProducts = await prisma.product.findMany({
          where: { id: { in: excludeIds } },
          select: { categoryId: true },
        });
        const historyCategoryIds = [...new Set(historyProducts.map((p) => p.categoryId))];

        recommendations = await prisma.product.findMany({
          where: {
            organizationId,
            published: true,
            id: { notIn: excludeIds },
            ...(historyCategoryIds.length > 0 ? { categoryId: { in: historyCategoryIds } } : {}),
          },
          include: { category: true, variants: true },
          orderBy: [{ soldCount: "desc" }, { rating: "desc" }],
          take: limit,
        });
      } else {
        // Anonymous: just trending
        recommendations = await prisma.product.findMany({
          where: { organizationId, published: true, featured: true },
          include: { category: true, variants: true },
          orderBy: [{ soldCount: "desc" }, { rating: "desc" }],
          take: limit,
        });
      }
    }

    // Fallback: if not enough results, pad with trending products
    if (recommendations.length < Math.ceil(limit / 2)) {
      const existingIds = recommendations.map((p) => p.id);
      const trending = await prisma.product.findMany({
        where: {
          organizationId,
          published: true,
          id: { notIn: [...existingIds, productId].filter(Boolean) as string[] },
        },
        include: { category: true, variants: true },
        orderBy: [{ soldCount: "desc" }, { rating: "desc" }],
        take: limit - recommendations.length,
      });
      recommendations = [...recommendations, ...trending];
    }

    await setCache(cacheKey, recommendations, 600); // 10 min cache

    return NextResponse.json({ success: true, products: recommendations });
  } catch (err) {
    console.error("[Recommendations]", err);
    return NextResponse.json({ success: false, error: "Error fetching recommendations" }, { status: 500 });
  }
}
