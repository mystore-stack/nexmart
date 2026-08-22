import { prisma } from '@/lib/prisma';
import { getDefaultOrganizationId } from '@/lib/tenant';
import { RecommendationType } from '@prisma/client';

interface RecommendationOptions {
  limit?: number;
  excludePurchased?: boolean;
  excludeViewed?: boolean;
  minScore?: number;
}

interface UserBehavior {
  viewedProducts: string[];
  wishlistProducts: string[];
  purchasedProducts: string[];
  favoriteCategories: string[];
  searchTerms: string[];
}

export class RecommendationService {
  /**
   * Calculate similarity between two products based on attributes
   */
  private static calculateProductSimilarity(product1: any, product2: any): number {
    let score = 0;
    let factors = 0;

    // Category similarity
    if (product1.categoryId === product2.categoryId) {
      score += 0.4;
      factors++;
    }

    // Price range similarity (within 20%)
    const priceRatio = Math.abs(product1.price - product2.price) / Math.max(product1.price, product2.price);
    if (priceRatio < 0.2) {
      score += 0.2;
      factors++;
    }

    // Rating similarity
    const ratingDiff = Math.abs((product1.rating || 0) - (product2.rating || 0));
    if (ratingDiff < 0.5) {
      score += 0.2;
      factors++;
    }

    // Tag similarity (if available)
    if (product1.tags && product2.tags) {
      const commonTags = product1.tags.filter((tag: string) => product2.tags.includes(tag));
      if (commonTags.length > 0) {
        score += 0.2 * (commonTags.length / Math.max(product1.tags.length, product2.tags.length));
        factors++;
      }
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Get user behavior data for personalization
   */
  private static async getUserBehavior(userId: string): Promise<UserBehavior> {
    const [viewed, wishlist, orders, searches] = await Promise.all([
      prisma.recentlyViewed.findMany({
        where: { userId },
        select: { productId: true },
        orderBy: { viewedAt: 'desc' },
        take: 50,
      }),
      prisma.wishlistItem.findMany({
        where: { userId },
        select: { productId: true },
      }),
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            select: { productId: true },
          },
        },
        take: 20,
      }),
      prisma.eventTracking.findMany({
        where: {
          userId,
          eventType: 'search',
        },
        select: { metadata: true },
        take: 30,
      }),
    ]);

    const purchasedProducts = orders.flatMap(order => 
      order.items.map(item => item.productId)
    );

    const favoriteCategories = await this.getFavoriteCategories(userId);

    const searchTerms = searches
      .map(s => s.metadata?.query)
      .filter(Boolean) as string[];

    return {
      viewedProducts: viewed.map(v => v.productId),
      wishlistProducts: wishlist.map(w => w.productId),
      purchasedProducts,
      favoriteCategories,
      searchTerms,
    };
  }

  /**
   * Get user's favorite categories based on behavior
   */
  private static async getFavoriteCategories(userId: string): Promise<string[]> {
    const categoryViews = await prisma.eventTracking.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        categoryId: { not: null },
      },
      _count: {
        categoryId: true,
      },
      orderBy: {
        _count: {
          categoryId: 'desc',
        },
      },
      take: 5,
    });

    return categoryViews.map(c => c.categoryId!);
  }

  /**
   * Generate content-based recommendations for a product
   */
  private static async getContentBasedRecommendations(
    productId: string,
    limit: number = 10
  ): Promise<any[]> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) return [];

    const similarProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
        organizationId: product.organizationId,
        published: true,
        isVisible: true,
      },
      include: { category: true },
      take: limit * 3, // Get more to filter
    });

    // Calculate similarity scores
    const scored = similarProducts.map(p => ({
      ...p,
      similarity: this.calculateProductSimilarity(product, p),
    }));

    // Sort by similarity and return top results
    return scored
      .filter(p => p.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Generate collaborative filtering recommendations
   */
  private static async getCollaborativeRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<any[]> {
    const behavior = await this.getUserBehavior(userId);
    
    // Find users with similar behavior
    const similarUsers = await prisma.wishlistItem.groupBy({
      by: ['userId'],
      where: {
        productId: { in: behavior.wishlistProducts },
        userId: { not: userId },
      },
      _count: {
        productId: true,
      },
      having: {
        productId: { _count: { gte: 2 } },
      },
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: 20,
    });

    const similarUserIds = similarUsers.map(u => u.userId);

    // Get products liked by similar users but not by current user
    const recommendedProducts = await prisma.product.findMany({
      where: {
        organizationId: await getDefaultOrganizationId(),
        published: true,
        isVisible: true,
        wishlistItems: {
          some: {
            userId: { in: similarUserIds },
          },
        },
        id: { notIn: [...behavior.purchasedProducts, ...behavior.wishlistProducts] },
      },
      include: {
        category: true,
        _count: {
          select: {
            wishlistItems: true,
          },
        },
      },
      take: limit * 2,
    });

    // Score by popularity among similar users
    const scored = recommendedProducts.map(p => ({
      ...p,
      score: p._count.wishlistItems / similarUsers.length,
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Generate "Recommended For You" recommendations
   */
  static async getRecommendedForYou(
    userId: string,
    options: RecommendationOptions = {}
  ): Promise<any[]> {
    const { limit = 10, excludePurchased = true, excludeViewed = true } = options;
    const behavior = await this.getUserBehavior(userId);

    let recommendedProducts: any[] = [];

    // If user has behavior data, use collaborative filtering
    if (behavior.wishlistProducts.length > 0 || behavior.viewedProducts.length > 0) {
      recommendedProducts = await this.getCollaborativeRecommendations(userId, limit * 2);
    }

    // Fall back to content-based if not enough results
    if (recommendedProducts.length < limit && behavior.viewedProducts.length > 0) {
      const lastViewed = behavior.viewedProducts[0];
      const contentBased = await this.getContentBasedRecommendations(lastViewed, limit);
      recommendedProducts = [...recommendedProducts, ...contentBased];
    }

    // Filter out purchased/viewed if requested
    if (excludePurchased) {
      recommendedProducts = recommendedProducts.filter(
        p => !behavior.purchasedProducts.includes(p.id)
      );
    }

    if (excludeViewed) {
      recommendedProducts = recommendedProducts.filter(
        p => !behavior.viewedProducts.includes(p.id)
      );
    }

    // Remove duplicates and limit
    const uniqueProducts = Array.from(
      new Map(recommendedProducts.map(p => [p.id, p])).values()
    );

    return uniqueProducts.slice(0, limit);
  }

  /**
   * Generate "Recently Viewed" recommendations
   */
  static async getRecentlyViewed(userId: string, limit: number = 10): Promise<any[]> {
    const viewed = await prisma.recentlyViewed.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: limit,
    });

    return viewed.map(v => ({
      ...v.product,
      viewedAt: v.viewedAt,
    }));
  }

  /**
   * Generate "Continue Shopping" recommendations
   */
  static async getContinueShopping(userId: string, limit: number = 10): Promise<any[]> {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true },
        },
      },
      take: 5,
    });

    if (cartItems.length === 0) {
      // Fall back to recently viewed
      return this.getRecentlyViewed(userId, limit);
    }

    const productIds = cartItems.map(ci => ci.productId);
    const recommendations: any[] = [];

    for (const cartItem of cartItems) {
      const similar = await this.getContentBasedRecommendations(cartItem.productId!, 2);
      recommendations.push(...similar);
    }

    // Remove duplicates and items already in cart
    const uniqueProducts = Array.from(
      new Map(recommendations.map(p => [p.id, p])).values()
    ).filter(p => !productIds.includes(p.id));

    return uniqueProducts.slice(0, limit);
  }

  /**
   * Generate "Frequently Bought Together" recommendations
   */
  static async getFrequentlyBoughtTogether(productId: string, limit: number = 6): Promise<any[]> {
    // Find orders that contain this product
    const ordersWithProduct = await prisma.order.findMany({
      where: {
        items: {
          some: { productId },
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
      take: 100,
    });

    // Count co-occurrence of other products
    const productCounts = new Map<string, number>();

    for (const order of ordersWithProduct) {
      for (const item of order.items) {
        if (item.productId !== productId) {
          productCounts.set(
            item.productId,
            (productCounts.get(item.productId) || 0) + 1
          );
        }
      }
    }

    // Sort by frequency and get top products
    const sortedProductIds = Array.from(productCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit * 2)
      .map(([id]) => id);

    const products = await prisma.product.findMany({
      where: {
        id: { in: sortedProductIds },
        published: true,
        isVisible: true,
      },
      include: { category: true },
    });

    // Sort by frequency
    const frequencyMap = new Map(productCounts);
    return products
      .sort((a, b) => (frequencyMap.get(b.id) || 0) - (frequencyMap.get(a.id) || 0))
      .slice(0, limit);
  }

  /**
   * Generate "Customers Also Bought" recommendations
   */
  static async getCustomersAlsoBought(productId: string, limit: number = 10): Promise<any[]> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    if (!product) return [];

    // Find products in the same category that are frequently purchased
    const products = await prisma.product.findMany({
      where: {
        id: { not: productId },
        categoryId: product.categoryId,
        published: true,
        isVisible: true,
      },
      include: {
        category: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      take: limit * 2,
    });

    // Sort by purchase count
    return products
      .sort((a, b) => b._count.orderItems - a._count.orderItems)
      .slice(0, limit);
  }

  /**
   * Generate "You May Like" recommendations (content-based)
   */
  static async getYouMayLike(userId: string, limit: number = 10): Promise<any[]> {
    const behavior = await this.getUserBehavior(userId);

    if (behavior.viewedProducts.length === 0) {
      // Fall back to trending products
      return this.getTrendingProducts(limit);
    }

    const lastViewed = behavior.viewedProducts[0];
    return this.getContentBasedRecommendations(lastViewed, limit);
  }

  /**
   * Generate "Trending Near You" recommendations
   */
  static async getTrendingNearYou(userId: string, limit: number = 10): Promise<any[]> {
    // This would use geolocation data
    // For now, return trending products in user's favorite categories
    const behavior = await this.getUserBehavior(userId);

    if (behavior.favoriteCategories.length === 0) {
      return this.getTrendingProducts(limit);
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId: { in: behavior.favoriteCategories },
        published: true,
        isVisible: true,
      },
      include: { category: true },
      orderBy: {
        soldCount: 'desc',
      },
      take: limit,
    });

    return products;
  }

  /**
   * Generate "Best In Category" recommendations
   */
  static async getBestInCategory(categorySlug: string, limit: number = 10): Promise<any[]> {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) return [];

    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        published: true,
        isVisible: true,
      },
      include: { category: true },
      orderBy: [
        { rating: 'desc' },
        { soldCount: 'desc' },
      ],
      take: limit,
    });

    return products;
  }

  /**
   * Get trending products
   */
  static async getTrendingProducts(limit: number = 10): Promise<any[]> {
    const organizationId = await getDefaultOrganizationId();

    return prisma.product.findMany({
      where: {
        organizationId,
        published: true,
        isVisible: true,
      },
      include: { category: true },
      orderBy: [
        { soldCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });
  }

  /**
   * Generate similar products
   */
  static async getSimilarProducts(productId: string, limit: number = 10): Promise<any[]> {
    return this.getContentBasedRecommendations(productId, limit);
  }

  /**
   * Generate complementary products (cross-sell)
   */
  static async getComplementaryProducts(productId: string, limit: number = 6): Promise<any[]> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) return [];

    // Find products in related categories or with complementary tags
    const products = await prisma.product.findMany({
      where: {
        id: { not: productId },
        organizationId: product.organizationId,
        published: true,
        isVisible: true,
        OR: [
          { categoryId: product.categoryId },
          { tags: { hasSome: product.tags } },
        ],
      },
      include: { category: true },
      take: limit * 2,
    });

    // Score and sort
    const scored = products.map(p => ({
      ...p,
      score: this.calculateProductSimilarity(product, p),
    }));

    return scored
      .filter(p => p.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Generate up-sell products (higher value in same category)
   */
  static async getUpSellProducts(productId: string, limit: number = 4): Promise<any[]> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { price: true, categoryId: true },
    });

    if (!product) return [];

    const products = await prisma.product.findMany({
      where: {
        id: { not: productId },
        categoryId: product.categoryId,
        price: { gt: product.price },
        published: true,
        isVisible: true,
      },
      include: { category: true },
      orderBy: { price: 'asc' },
      take: limit,
    });

    return products;
  }

  /**
   * Save recommendation to database for analytics
   */
  static async saveRecommendation(
    userId: string,
    productId: string,
    type: RecommendationType,
    score: number,
    reason?: string,
    metadata?: any
  ): Promise<void> {
    await prisma.recommendation.create({
      data: {
        userId,
        productId,
        type,
        score,
        reason,
        metadata,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  /**
   * Track recommendation click
   */
  static async trackRecommendationClick(
    recommendationId: string
  ): Promise<void> {
    await prisma.recommendation.update({
      where: { id: recommendationId },
      data: { clicked: true },
    });
  }

  /**
   * Track recommendation conversion
   */
  static async trackRecommendationConversion(
    recommendationId: string
  ): Promise<void> {
    await prisma.recommendation.update({
      where: { id: recommendationId },
      data: { converted: true },
    });
  }

  /**
   * Get recommendation performance metrics
   */
  static async getRecommendationMetrics(userId?: string): Promise<{
    total: number;
    clicked: number;
    converted: number;
    ctr: number;
    conversionRate: number;
  }> {
    const where = userId ? { userId } : {};

    const recommendations = await prisma.recommendation.findMany({
      where,
      select: {
        clicked: true,
        converted: true,
      },
    });

    const total = recommendations.length;
    const clicked = recommendations.filter(r => r.clicked).length;
    const converted = recommendations.filter(r => r.converted).length;

    return {
      total,
      clicked,
      converted,
      ctr: total > 0 ? clicked / total : 0,
      conversionRate: clicked > 0 ? converted / clicked : 0,
    };
  }
}
