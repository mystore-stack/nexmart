// src/lib/automation/marketing-automation.ts
// Marketing automation: recommendations engine, cross-sell, upsell, personalized offers

import { prisma } from '../prisma';
import { logSuccess, logFailure, logPending } from './logger';
import { AutomationType, RecommendationType } from '@prisma/client';

/**
 * Architecture:
 * - Marketing automation uses AI-powered recommendations
 * - Generates product recommendations based on user behavior
 * - Cross-sell: suggest complementary products
 * - Upsell: suggest higher-value alternatives
 * - Personalized offers based on purchase history
 * - Tracks recommendation performance (clicks, purchases)
 */

/**
 * Generate product recommendations for user
 * - Based on purchase history, browsing behavior, and similar users
 * - Returns personalized product recommendations
 */
export async function generateProductRecommendations(userId: string, limit: number = 10) {
  try {
    // Get user's purchase history
    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      take: 20,
    });

    // Get user's viewed products
    const viewedProducts = await prisma.recentlyViewed.findMany({
      where: { userId },
      include: {
        product: true,
      },
      take: 20,
    });

    // Get user's wishlist
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
      take: 20,
    });

    // Collect all product IDs
    const purchasedProductIds = new Set(
      orders.flatMap(o => o.items.map(i => i.productId))
    );
    const viewedProductIds = new Set(viewedProducts.map(v => v.productId));
    const wishlistProductIds = new Set(wishlist.map(w => w.productId));

    // Find similar products based on category and tags
    const categories = Array.from(
      new Set(
        orders.flatMap(o => o.items.map(i => i.product.categoryId))
      )
    );

    const similarProducts = await prisma.product.findMany({
      where: {
        categoryId: { in: categories },
        published: true,
        id: {
          notIn: Array.from(purchasedProductIds),
        },
      },
      include: {
        category: true,
      },
      take: limit * 2,
    });

    // Score products based on relevance
    const scoredProducts = similarProducts.map(product => {
      let score = 0;

      // Boost if in wishlist
      if (wishlistProductIds.has(product.id)) {
        score += 50;
      }

      // Boost if viewed recently
      if (viewedProductIds.has(product.id)) {
        score += 30;
      }

      // Boost if same category as purchased items
      if (categories.includes(product.categoryId)) {
        score += 20;
      }

      // Boost if high rating
      score += product.rating * 10;

      // Boost if featured
      if (product.featured) {
        score += 15;
      }

      return {
        product,
        score,
        type: RecommendationType.PRODUCT,
        reason: determineReason(score, product),
      };
    });

    // Sort by score and take top results
    const topRecommendations = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Store recommendations in database
    for (const rec of topRecommendations) {
      const existing = await prisma.recommendation.findFirst({
        where: {
          userId,
          productId: rec.product.id,
        },
      });

      if (existing) {
        await prisma.recommendation.update({
          where: { id: existing.id },
          data: {
            score: rec.score,
            reason: rec.reason,
            type: rec.type,
          },
        });
      } else {
        await prisma.recommendation.create({
          data: {
            userId,
            productId: rec.product.id,
            score: rec.score,
            reason: rec.reason,
            type: rec.type,
          },
        });
      }
    }

    // Log success
    await logSuccess(
      'system',
      AutomationType.MARKETING_CAMPAIGN,
      'User',
      userId,
      'Product recommendations generated',
      {
        count: topRecommendations.length,
      }
    );

    return topRecommendations.map(rec => ({
      ...rec.product,
      score: rec.score,
      reason: rec.reason,
      type: rec.type,
    }));
  } catch (error) {
    console.error('[Generate Product Recommendations] Failed:', error);
    throw error;
  }
}

/**
 * Generate cross-sell recommendations
 * - Suggest complementary products based on cart contents
 */
export async function generateCrossSellRecommendations(cartItems: any[]) {
  try {
    if (cartItems.length === 0) {
      return [];
    }

    // Get categories of products in cart
    const productIds = cartItems.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });

    const categoryIds = Array.from(
      new Set(products.map(p => p.categoryId))
    );

    // Find complementary products from different categories
    const crossSellProducts = await prisma.product.findMany({
      where: {
        categoryId: { notIn: categoryIds },
        published: true,
        id: { notIn: productIds },
        stock: { gt: 0 },
      },
      include: { category: true },
      take: 5,
    });

    return crossSellProducts.map(product => ({
      ...product,
      type: RecommendationType.CROSS_SELL,
      reason: 'Complementary to your cart items',
      score: 60,
    }));
  } catch (error) {
    console.error('[Generate Cross-Sell Recommendations] Failed:', error);
    throw error;
  }
}

/**
 * Generate upsell recommendations
 * - Suggest higher-value alternatives
 */
export async function generateUpsellRecommendations(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      return [];
    }

    // Find higher-priced products in same category
    const upsellProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        published: true,
        id: { not: productId },
        price: { gt: product.price },
        stock: { gt: 0 },
      },
      include: { category: true },
      orderBy: { price: 'asc' },
      take: 3,
    });

    return upsellProducts.map(p => ({
      ...p,
      type: RecommendationType.UPSELL,
      reason: 'Premium version with more features',
      score: 70,
    }));
  } catch (error) {
    console.error('[Generate Upsell Recommendations] Failed:', error);
    throw error;
  }
}

/**
 * Generate personalized offers based on purchase history
 * - Create targeted discount offers
 */
export async function generatePersonalizedOffer(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        loyaltyPoints: true,
        customerSegment: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let discountPercentage = 5;
    let minOrder = 100;

    // Adjust based on loyalty tier
    if (user.loyaltyPoints && user.loyaltyPoints.length > 0) {
      const loyalty = user.loyaltyPoints[0];
      switch (loyalty.tier) {
        case 'BRONZE':
          discountPercentage = 5;
          break;
        case 'SILVER':
          discountPercentage = 10;
          break;
        case 'GOLD':
          discountPercentage = 15;
          break;
        case 'PLATINUM':
          discountPercentage = 20;
          break;
        case 'DIAMOND':
          discountPercentage = 25;
          break;
      }
    }

    // Adjust based on customer segment
    if (user.customerSegment && user.customerSegment.length > 0) {
      const segment = user.customerSegment[0];
      switch (segment.segment) {
        case 'NEW':
          discountPercentage = Math.max(discountPercentage, 10);
          break;
        case 'VIP':
          discountPercentage = Math.max(discountPercentage, 20);
          break;
        case 'INACTIVE':
          discountPercentage = Math.max(discountPercentage, 15);
          break;
      }
    }

    // Generate unique coupon code
    const couponCode = `PERSONAL${discountPercentage}-${Date.now().toString(36).toUpperCase()}`;

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        organizationId: 'default', // Would be actual org ID
        code: couponCode,
        description: `Personalized ${discountPercentage}% discount offer`,
        type: 'PERCENTAGE',
        value: discountPercentage,
        minOrder,
        userLimit: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        active: true,
      },
    });

    // Log success
    await logSuccess(
      'system',
      AutomationType.MARKETING_CAMPAIGN,
      'User',
      userId,
      'Personalized offer generated',
      {
        couponCode,
        discountPercentage,
      }
    );

    return {
      couponCode,
      discountPercentage,
      minOrder,
      expiresAt: coupon.endDate,
    };
  } catch (error) {
    console.error('[Generate Personalized Offer] Failed:', error);
    throw error;
  }
}

/**
 * Track recommendation click
 * - Update recommendation when user clicks
 */
export async function trackRecommendationClick(userId: string, productId: string) {
  try {
    await prisma.recommendation.updateMany({
      where: {
        userId,
        productId,
      },
      data: {
        clicked: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('[Track Recommendation Click] Failed:', error);
    throw error;
  }
}

/**
 * Track recommendation purchase
 * - Update recommendation when user purchases
 */
export async function trackRecommendationPurchase(userId: string, productId: string) {
  try {
    await prisma.recommendation.updateMany({
      where: {
        userId,
        productId,
      },
      data: {
        purchased: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('[Track Recommendation Purchase] Failed:', error);
    throw error;
  }
}

/**
 * Get recommendation performance metrics
 * - Return click-through and conversion rates
 */
export async function getRecommendationMetrics(userId?: string) {
  const whereClause = userId ? { userId } : {};

  const [totalRecommendations, clicked, purchased] = await Promise.all([
    prisma.recommendation.count({ where: whereClause }),
    prisma.recommendation.count({
      where: { ...whereClause, clicked: true },
    }),
    prisma.recommendation.count({
      where: { ...whereClause, purchased: true },
    }),
  ]);

  const clickThroughRate = totalRecommendations > 0
    ? (clicked / totalRecommendations) * 100
    : 0;
  const conversionRate = clicked > 0
    ? (purchased / clicked) * 100
    : 0;

  return {
    totalRecommendations,
    clicked,
    purchased,
    clickThroughRate,
    conversionRate,
  };
}

/**
 * Determine recommendation reason based on score
 */
function determineReason(score: number, product: any): string {
  if (score >= 70) {
    return 'Highly recommended based on your preferences';
  } else if (score >= 50) {
    return 'Popular in your favorite categories';
  } else if (score >= 30) {
    return 'Trending product';
  } else {
    return 'You might also like';
  }
}

/**
 * Process marketing automation queue job
 * - Called by worker to process queued marketing automation
 */
export async function processMarketingAutomationJob(jobData: any) {
  const { type, userId, cartItems, productId } = jobData;

  switch (type) {
    case 'product_recommendations':
      return await generateProductRecommendations(userId, jobData.limit);
    case 'cross_sell':
      return await generateCrossSellRecommendations(cartItems);
    case 'upsell':
      return await generateUpsellRecommendations(productId);
    case 'personalized_offer':
      return await generatePersonalizedOffer(userId);
    default:
      throw new Error(`Unknown marketing automation type: ${type}`);
  }
}
