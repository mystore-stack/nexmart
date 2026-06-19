// src/lib/automation/product-recommendations.ts — AI-Powered Product Recommendations
import { prisma } from '@/lib/prisma';
import { EmailType } from '@prisma/client';
import { sendEmail } from '@/lib/email';

// Get personalized product recommendations for a user
export async function getPersonalizedRecommendations(userId: string, organizationId: string, limit: number = 5) {
  try {
    // Get user's order history
    const orders = await prisma.order.findMany({
      where: {
        userId,
        organizationId,
      },
      include: {
        OrderItem: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Extract purchased product categories
    const purchasedCategories = new Set<string>();
    const purchasedProductIds = new Set<string>();

    for (const order of orders) {
      for (const item of order.OrderItem) {
        if (item.product) {
          purchasedCategories.add(item.product.categoryId);
          purchasedProductIds.add(item.product.id);
        }
      }
    }

    // Get user's wishlist
    const wishlist = await prisma.wishlistItem.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    for (const item of wishlist) {
      if (item.product) {
        purchasedCategories.add(item.product.categoryId);
      }
    }

    // Get recently viewed products
    const recentlyViewed = await prisma.recentlyViewed.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        viewedAt: 'desc',
      },
      take: 10,
    });

    for (const item of recentlyViewed) {
      if (item.product) {
        purchasedCategories.add(item.product.categoryId);
      }
    }

    // Find similar products based on categories
    const categoryRecommendations = await prisma.product.findMany({
      where: {
        organizationId,
        categoryId: { in: Array.from(purchasedCategories) },
        published: true,
        id: { notIn: Array.from(purchasedProductIds) },
      },
      include: {
        category: true,
      },
      take: limit * 2,
    });

    // Find trending products
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingProducts = await prisma.product.findMany({
      where: {
        organizationId,
        published: true,
        OrderItem: {
          some: {
            order: {
              createdAt: { gte: thirtyDaysAgo },
            },
          },
        },
      },
      include: {
        category: true,
        OrderItem: {
          where: {
            order: {
              createdAt: { gte: thirtyDaysAgo },
            },
          },
        },
      },
      take: limit * 2,
    });

    // Sort trending by sales count
    trendingProducts.sort((a, b) => b.OrderItem.length - a.OrderItem.length);

    // Combine and deduplicate recommendations
    const allRecommendations = new Map<string, any>();

    for (const product of categoryRecommendations) {
      if (!allRecommendations.has(product.id)) {
        allRecommendations.set(product.id, { ...product, score: 1.5 });
      }
    }

    for (const product of trendingProducts) {
      if (!allRecommendations.has(product.id)) {
        allRecommendations.set(product.id, { ...product, score: 1.0 });
      } else {
        allRecommendations.get(product.id)!.score += 0.5;
      }
    }

    // Sort by score and return top recommendations
    const sortedRecommendations = Array.from(allRecommendations.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return sortedRecommendations;
  } catch (error) {
    console.error('[Get Personalized Recommendations Error]:', error);
    return [];
  }
}

// Send product recommendation email
export async function sendProductRecommendationEmail(userId: string, organizationId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const recommendations = await getPersonalizedRecommendations(userId, organizationId, 5);

    if (recommendations.length === 0) {
      console.log(`[Product Recommendations] No recommendations for user ${userId}`);
      return { sent: false, reason: 'No recommendations available' };
    }

    const html = await generateRecommendationHTML(user.name, recommendations);

    await sendEmail({
      to: user.email,
      subject: '🎯 Des produits qui pourraient vous plaire !',
      html,
      type: EmailType.PRODUCT_RECOMMENDATION,
      userId,
      organizationId,
      metadata: {
        recommendationCount: recommendations.length,
        productIds: recommendations.map((p) => p.id),
      },
    });

    console.log(`[Product Recommendations] Sent email to ${user.email}`);
    return { sent: true, recommendationCount: recommendations.length };
  } catch (error) {
    console.error('[Send Product Recommendation Email Error]:', error);
    return { sent: false, error: 'Failed to send email' };
  }
}

// Generate recommendation email HTML
async function generateRecommendationHTML(userName: string, recommendations: any[]) {
  const { productRecommendationTemplate } = await import('@/lib/email-templates');
  return productRecommendationTemplate(userName, recommendations);
}

// Send recommendations to inactive users (called by cron job)
export async function sendRecommendationsToInactiveUsers() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveUsers = await prisma.user.findMany({
      where: {
        Membership: {
          some: {
            role: 'MEMBER',
          },
        },
        Order: {
          none: {
            createdAt: { gte: thirtyDaysAgo },
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        Membership: {
          select: {
            organizationId: true,
          },
        },
      },
      take: 100,
    });

    let sentCount = 0;
    const results = [];

    for (const user of inactiveUsers) {
      const organizationId = user.Membership[0]?.organizationId;
      if (!organizationId) continue;

      const result = await sendProductRecommendationEmail(user.id, organizationId);
      results.push({
        userId: user.id,
        email: user.email,
        ...result,
      });

      if (result.sent) {
        sentCount++;
      }
    }

    console.log(`[Product Recommendations] Sent ${sentCount} recommendation emails`);
    return { sentCount, totalProcessed: inactiveUsers.length, results };
  } catch (error) {
    console.error('[Send Recommendations To Inactive Users Error]:', error);
    throw error;
  }
}

// Get recommendation statistics
export async function getRecommendationStatistics(organizationId?: string) {
  try {
    const where = organizationId ? { organizationId } : {};

    const [
      totalRecommendations,
      totalClicks,
      totalConversions,
    ] = await Promise.all([
      prisma.emailLog.count({
        where: { ...where, type: EmailType.PRODUCT_RECOMMENDATION },
      }),
      prisma.emailLog.count({
        where: { ...where, type: EmailType.PRODUCT_RECOMMENDATION, status: 'CLICKED' },
      }),
      prisma.order.count({
        where: {
          ...where,
          couponId: { not: null },
        },
      }),
    ]);

    return {
      totalRecommendations,
      totalClicks,
      totalConversions,
      clickRate: totalRecommendations > 0 ? (totalClicks / totalRecommendations) * 100 : 0,
      conversionRate: totalRecommendations > 0 ? (totalConversions / totalRecommendations) * 100 : 0,
    };
  } catch (error) {
    console.error('[Get Recommendation Statistics Error]:', error);
    return null;
  }
}
