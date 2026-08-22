import { prisma } from '@/lib/prisma';
import { getDefaultOrganizationId } from '@/lib/tenant';

interface RankingWeights {
  salesScore: number;
  revenueScore: number;
  ctrScore: number;
  wishlistScore: number;
  viewsScore: number;
  stockScore: number;
  conversionScore: number;
  trendingScore: number;
  seasonalityScore: number;
  adminPriority: number;
}

interface ProductMetrics {
  salesCount: number;
  revenue: number;
  ctr: number;
  wishlistCount: number;
  viewCount: number;
  stock: number;
  conversionRate: number;
  trendingScore: number;
  seasonalityScore: number;
  adminPriority: number;
}

const DEFAULT_WEIGHTS: RankingWeights = {
  salesScore: 0.25,
  revenueScore: 0.20,
  ctrScore: 0.10,
  wishlistScore: 0.10,
  viewsScore: 0.08,
  stockScore: 0.05,
  conversionScore: 0.12,
  trendingScore: 0.06,
  seasonalityScore: 0.04,
  adminPriority: 0.10,
};

export class ProductRankingService {
  /**
   * Calculate normalized score for a metric (0-1 range)
   */
  private static normalizeMetric(value: number, max: number): number {
    if (max === 0) return 0;
    return Math.min(value / max, 1);
  }

  /**
   * Calculate stock score (higher for moderate stock, lower for out of stock or overstock)
   */
  private static calculateStockScore(stock: number, averageStock: number): number {
    if (stock === 0) return 0;
    if (stock < 5) return 0.3; // Low stock urgency
    if (stock > averageStock * 2) return 0.5; // Overstocked
    return 1; // Optimal stock level
  }

  /**
   * Calculate seasonality score based on current month
   */
  private static calculateSeasonalityScore(product: any): number {
    const currentMonth = new Date().getMonth();
    const createdAt = new Date(product.createdAt);
    const productAge = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24); // days
    
    // New products get higher seasonality score
    if (productAge < 30) return 1;
    if (productAge < 90) return 0.8;
    if (productAge < 180) return 0.6;
    return 0.4;
  }

  /**
   * Calculate trending score based on recent performance
   */
  private static calculateTrendingScore(product: any): number {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    // This would ideally use time-series data
    // For now, use soldCount as a proxy
    const soldScore = Math.min(product.soldCount / 100, 1);
    const reviewScore = Math.min(product.reviewCount / 50, 1);
    
    return (soldScore * 0.7 + reviewScore * 0.3);
  }

  /**
   * Calculate individual scores for a product
   */
  private static async calculateProductScores(
    product: any,
    metrics: ProductMetrics,
    maxMetrics: ProductMetrics,
    weights: RankingWeights
  ): Promise<{
    salesScore: number;
    revenueScore: number;
    ctrScore: number;
    wishlistScore: number;
    viewsScore: number;
    stockScore: number;
    conversionScore: number;
    trendingScore: number;
    seasonalityScore: number;
    adminPriority: number;
    totalScore: number;
  }> {
    const salesScore = this.normalizeMetric(metrics.salesCount, maxMetrics.salesCount);
    const revenueScore = this.normalizeMetric(metrics.revenue, maxMetrics.revenue);
    const ctrScore = this.normalizeMetric(metrics.ctr, maxMetrics.ctr || 1);
    const wishlistScore = this.normalizeMetric(metrics.wishlistCount, maxMetrics.wishlistCount);
    const viewsScore = this.normalizeMetric(metrics.viewCount, maxMetrics.viewCount);
    const stockScore = this.calculateStockScore(metrics.stock, maxMetrics.stock);
    const conversionScore = this.normalizeMetric(metrics.conversionRate, maxMetrics.conversionRate || 1);
    const trendingScore = this.calculateTrendingScore(product);
    const seasonalityScore = this.calculateSeasonalityScore(product);
    const adminPriorityScore = this.normalizeMetric(metrics.adminPriority, 10);

    const totalScore =
      salesScore * weights.salesScore +
      revenueScore * weights.revenueScore +
      ctrScore * weights.ctrScore +
      wishlistScore * weights.wishlistScore +
      viewsScore * weights.viewsScore +
      stockScore * weights.stockScore +
      conversionScore * weights.conversionScore +
      trendingScore * weights.trendingScore +
      seasonalityScore * weights.seasonalityScore +
      adminPriorityScore * weights.adminPriority;

    return {
      salesScore,
      revenueScore,
      ctrScore,
      wishlistScore,
      viewsScore,
      stockScore,
      conversionScore,
      trendingScore,
      seasonalityScore,
      adminPriority: adminPriorityScore,
      totalScore,
    };
  }

  /**
   * Get product metrics for ranking
   */
  private static async getProductMetrics(organizationId: string): Promise<{
    products: any[];
    maxMetrics: ProductMetrics;
  }> {
    const products = await prisma.product.findMany({
      where: {
        organizationId,
        published: true,
        isVisible: true,
      },
      include: {
        category: true,
        _count: {
          select: {
            reviews: true,
            wishlistItems: true,
          },
        },
      },
    });

    // Calculate max metrics for normalization
    const maxMetrics: ProductMetrics = {
      salesCount: Math.max(...products.map(p => p.soldCount || 0)),
      revenue: Math.max(...products.map(p => (p.price * (p.soldCount || 0)))),
      ctr: Math.max(...products.map(p => 0.1)), // Placeholder
      wishlistCount: Math.max(...products.map(p => p._count.wishlistItems)),
      viewCount: Math.max(...products.map(p => 0)), // Placeholder
      stock: Math.max(...products.map(p => p.stock || 0)),
      conversionRate: Math.max(...products.map(p => 0.1)), // Placeholder
      trendingScore: 1,
      seasonalityScore: 1,
      adminPriority: 10,
    };

    return { products, maxMetrics };
  }

  /**
   * Calculate and update product rankings for all products
   */
  static async calculateAllRankings(
    weights: RankingWeights = DEFAULT_WEIGHTS
  ): Promise<void> {
    const organizationId = await getDefaultOrganizationId();
    const { products, maxMetrics } = await this.getProductMetrics(organizationId);

    for (const product of products) {
      const metrics: ProductMetrics = {
        salesCount: product.soldCount || 0,
        revenue: product.price * (product.soldCount || 0),
        ctr: 0.05, // Placeholder
        wishlistCount: product._count.wishlistItems,
        viewCount: 0, // Placeholder
        stock: product.stock || 0,
        conversionRate: 0.05, // Placeholder
        trendingScore: 0,
        seasonalityScore: 0,
        adminPriority: product.displayOrder || 0,
      };

      const scores = await this.calculateProductScores(product, metrics, maxMetrics, weights);

      await prisma.productRanking.upsert({
        where: { productId: product.id },
        update: {
          salesScore: scores.salesScore,
          revenueScore: scores.revenueScore,
          ctrScore: scores.ctrScore,
          wishlistScore: scores.wishlistScore,
          viewsScore: scores.viewsScore,
          stockScore: scores.stockScore,
          conversionScore: scores.conversionScore,
          trendingScore: scores.trendingScore,
          seasonalityScore: scores.seasonalityScore,
          adminPriority: metrics.adminPriority,
          totalScore: scores.totalScore,
          calculatedAt: new Date(),
        },
        create: {
          productId: product.id,
          organizationId,
          salesScore: scores.salesScore,
          revenueScore: scores.revenueScore,
          ctrScore: scores.ctrScore,
          wishlistScore: scores.wishlistScore,
          viewsScore: scores.viewsScore,
          stockScore: scores.stockScore,
          conversionScore: scores.conversionScore,
          trendingScore: scores.trendingScore,
          seasonalityScore: scores.seasonalityScore,
          adminPriority: metrics.adminPriority,
          totalScore: scores.totalScore,
          calculatedAt: new Date(),
        },
      });
    }
  }

  /**
   * Get ranked products by score
   */
  static async getRankedProducts(options: {
    limit?: number;
    offset?: number;
    categorySlug?: string;
    minScore?: number;
  } = {}): Promise<any[]> {
    const { limit = 20, offset = 0, categorySlug, minScore } = options;
    const organizationId = await getDefaultOrganizationId();

    const where: any = {
      organizationId,
      published: true,
      isVisible: true,
    };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        ranking: true,
        _count: {
          select: {
            reviews: true,
            wishlistItems: true,
          },
        },
      },
      orderBy: {
        ranking: {
          totalScore: 'desc',
        },
      },
      take: limit,
      skip: offset,
    });

    // Filter by minScore if provided
    if (minScore) {
      return products.filter(p => p.ranking?.totalScore >= minScore);
    }

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
      include: {
        category: true,
        ranking: true,
      },
      orderBy: {
        ranking: {
          trendingScore: 'desc',
        },
      },
      take: limit,
    });
  }

  /**
   * Get best selling products
   */
  static async getBestSellingProducts(limit: number = 10): Promise<any[]> {
    const organizationId = await getDefaultOrganizationId();

    return prisma.product.findMany({
      where: {
        organizationId,
        published: true,
        isVisible: true,
      },
      include: {
        category: true,
        ranking: true,
      },
      orderBy: {
        ranking: {
          salesScore: 'desc',
        },
      },
      take: limit,
    });
  }

  /**
   * Get recommended products based on ranking
   */
  static async getRecommendedProducts(limit: number = 10): Promise<any[]> {
    const organizationId = await getDefaultOrganizationId();

    return prisma.product.findMany({
      where: {
        organizationId,
        published: true,
        isVisible: true,
      },
      include: {
        category: true,
        ranking: true,
      },
      orderBy: {
        ranking: {
          totalScore: 'desc',
        },
      },
      take: limit,
    });
  }

  /**
   * Update ranking for a single product
   */
  static async updateProductRanking(productId: string): Promise<void> {
    const organizationId = await getDefaultOrganizationId();
    const { products, maxMetrics } = await this.getProductMetrics(organizationId);
    
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const metrics: ProductMetrics = {
      salesCount: product.soldCount || 0,
      revenue: product.price * (product.soldCount || 0),
      ctr: 0.05,
      wishlistCount: product._count.wishlistItems,
      viewCount: 0,
      stock: product.stock || 0,
      conversionRate: 0.05,
      trendingScore: 0,
      seasonalityScore: 0,
      adminPriority: product.displayOrder || 0,
    };

    const scores = await this.calculateProductScores(product, metrics, maxMetrics, DEFAULT_WEIGHTS);

    await prisma.productRanking.upsert({
      where: { productId },
      update: {
        salesScore: scores.salesScore,
        revenueScore: scores.revenueScore,
        ctrScore: scores.ctrScore,
        wishlistScore: scores.wishlistScore,
        viewsScore: scores.viewsScore,
        stockScore: scores.stockScore,
        conversionScore: scores.conversionScore,
        trendingScore: scores.trendingScore,
        seasonalityScore: scores.seasonalityScore,
        adminPriority: metrics.adminPriority,
        totalScore: scores.totalScore,
        calculatedAt: new Date(),
      },
      create: {
        productId,
        organizationId,
        salesScore: scores.salesScore,
        revenueScore: scores.revenueScore,
        ctrScore: scores.ctrScore,
        wishlistScore: scores.wishlistScore,
        viewsScore: scores.viewsScore,
        stockScore: scores.stockScore,
        conversionScore: scores.conversionScore,
        trendingScore: scores.trendingScore,
        seasonalityScore: scores.seasonalityScore,
        adminPriority: metrics.adminPriority,
        totalScore: scores.totalScore,
        calculatedAt: new Date(),
      },
    });
  }
}
