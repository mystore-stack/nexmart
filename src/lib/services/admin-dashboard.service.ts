import { prisma } from '@/lib/prisma';
import { getDefaultOrganizationId } from '@/lib/tenant';
import { HomepageAnalyticsService } from './homepage-analytics.service';
import { ProductRankingService } from './product-ranking.service';
import { RecommendationService } from './recommendation.service';

interface DashboardMetrics {
  revenue: {
    total: number;
    change: number;
    changePercent: number;
  };
  orders: {
    total: number;
    change: number;
    changePercent: number;
  };
  visitors: {
    total: number;
    change: number;
    changePercent: number;
  };
  conversionRate: {
    value: number;
    change: number;
    changePercent: number;
  };
  ctr: {
    value: number;
    change: number;
    changePercent: number;
  };
  averageOrderValue: {
    value: number;
    change: number;
    changePercent: number;
  };
}

interface TopProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  soldCount: number;
  revenue: number;
  rating: number;
  category: string;
}

interface TopCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  revenue: number;
  orders: number;
}

interface TopCampaign {
  id: string;
  name: string;
  type: string;
  status: string;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
  conversions: number;
}

interface TopHeroSlide {
  id: string;
  title: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  revenue: number;
}

interface SectionPerformance {
  sectionId: string;
  sectionName: string;
  sectionType: string;
  views: number;
  clicks: number;
  ctr: number;
  revenue: number;
  orders: number;
  conversions: number;
  averagePosition: number;
  scrollDepth: number;
}

interface CTAPerformance {
  sectionId: string;
  buttonText: string;
  buttonLink: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  orders: number;
  visitors: number;
  conversions: number;
}

export class AdminDashboardService {
  /**
   * Get main dashboard metrics
   */
  static async getDashboardMetrics(
    startDate?: Date,
    endDate?: Date
  ): Promise<DashboardMetrics> {
    const organizationId = await getDefaultOrganizationId();
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    // Get current period metrics
    const [currentOrders, currentRevenue, currentVisitors] = await Promise.all([
      prisma.order.findMany({
        where: {
          organizationId,
          createdAt: { gte: start, lte: end },
        },
        select: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          organizationId,
          createdAt: { gte: start, lte: end },
        },
        _sum: { total: true },
      }),
      prisma.analyticsSession.count({
        where: {
          organizationId,
          createdAt: { gte: start, lte: end },
        },
      }),
    ]);

    // Get previous period metrics for comparison
    const previousStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
    const previousEnd = start;

    const [previousOrders, previousRevenue, previousVisitors] = await Promise.all([
      prisma.order.count({
        where: {
          organizationId,
          createdAt: { gte: previousStart, lte: previousEnd },
        },
      }),
      prisma.order.aggregate({
        where: {
          organizationId,
          createdAt: { gte: previousStart, lte: previousEnd },
        },
        _sum: { total: true },
      }),
      prisma.analyticsSession.count({
        where: {
          organizationId,
          createdAt: { gte: previousStart, lte: previousEnd },
        },
      }),
    ]);

    const totalRevenue = currentRevenue._sum.total || 0;
    const previousRevenue = previousRevenue._sum.total || 0;
    const totalOrders = currentOrders.length;
    const totalVisitors = currentVisitors;
    const previousOrdersCount = previousOrders;
    const previousVisitorsCount = previousVisitors;

    const revenueChange = totalRevenue - previousRevenue;
    const revenueChangePercent = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const ordersChange = totalOrders - previousOrdersCount;
    const ordersChangePercent = previousOrdersCount > 0 
      ? ((totalOrders - previousOrdersCount) / previousOrdersCount) * 100 
      : 0;

    const visitorsChange = totalVisitors - previousVisitorsCount;
    const visitorsChangePercent = previousVisitorsCount > 0 
      ? ((totalVisitors - previousVisitorsCount) / previousVisitorsCount) * 100 
      : 0;

    const conversionRate = totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0;
    const previousConversionRate = previousVisitorsCount > 0 
      ? (previousOrdersCount / previousVisitorsCount) * 100 
      : 0;
    const conversionChange = conversionRate - previousConversionRate;
    const conversionChangePercent = previousConversionRate > 0 
      ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100 
      : 0;

    const homepageOverview = await HomepageAnalyticsService.getHomepageOverview(start, end);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const previousAverageOrderValue = previousOrdersCount > 0 
      ? previousRevenue / previousOrdersCount 
      : 0;
    const aovChange = averageOrderValue - previousAverageOrderValue;
    const aovChangePercent = previousAverageOrderValue > 0 
      ? ((averageOrderValue - previousAverageOrderValue) / previousAverageOrderValue) * 100 
      : 0;

    return {
      revenue: {
        total: totalRevenue,
        change: revenueChange,
        changePercent: revenueChangePercent,
      },
      orders: {
        total: totalOrders,
        change: ordersChange,
        changePercent: ordersChangePercent,
      },
      visitors: {
        total: totalVisitors,
        change: visitorsChange,
        changePercent: visitorsChangePercent,
      },
      conversionRate: {
        value: conversionRate,
        change: conversionChange,
        changePercent: conversionChangePercent,
      },
      ctr: {
        value: homepageOverview.averageCTR,
        change: 0,
        changePercent: 0,
      },
      averageOrderValue: {
        value: averageOrderValue,
        change: aovChange,
        changePercent: aovChangePercent,
      },
    };
  }

  /**
   * Get top performing products
   */
  static async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const organizationId = await getDefaultOrganizationId();

    const products = await prisma.product.findMany({
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
        soldCount: 'desc',
      },
      take: limit,
    });

    return products.map(p => ({
      id: p.id,
      name: p.name,
      image: p.images[0] || '',
      price: p.price,
      soldCount: p.soldCount || 0,
      revenue: (p.price * (p.soldCount || 0)),
      rating: p.rating || 0,
      category: p.category?.name || '',
    }));
  }

  /**
   * Get top performing categories
   */
  static async getTopCategories(limit: number = 10): Promise<TopCategory[]> {
    const organizationId = await getDefaultOrganizationId();

    const categories = await prisma.category.findMany({
      where: {
        organizationId,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
        products: {
          select: {
            soldCount: true,
            price: true,
          },
        },
      },
      take: limit * 2,
    });

    const categoriesWithMetrics = categories.map(category => {
      const totalSold = category.products.reduce((sum, p) => sum + (p.soldCount || 0), 0);
      const totalRevenue = category.products.reduce((sum, p) => sum + (p.price * (p.soldCount || 0)), 0);

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        productCount: category._count.products,
        revenue: totalRevenue,
        orders: totalSold,
      };
    });

    return categoriesWithMetrics
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  /**
   * Get top performing campaigns
   */
  static async getTopCampaigns(limit: number = 10): Promise<TopCampaign[]> {
    const organizationId = await getDefaultOrganizationId();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const campaigns = await prisma.campaign.findMany({
      where: {
        organizationId,
        startDate: { lte: new Date() },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      include: {
        analytics: {
          where: {
            date: { gte: startDate },
          },
        },
      },
      take: limit,
    });

    return campaigns.map(campaign => {
      const totalImpressions = campaign.analytics.reduce((sum, a) => sum + a.impressions, 0);
      const totalClicks = campaign.analytics.reduce((sum, a) => sum + a.clicks, 0);
      const totalRevenue = campaign.analytics.reduce((sum, a) => sum + a.revenue, 0);
      const totalConversions = campaign.analytics.reduce((sum, a) => sum + a.conversions, 0);

      return {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        revenue: totalRevenue,
        conversions: totalConversions,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get top performing hero slides
   */
  static async getTopHeroSlides(limit: number = 10): Promise<TopHeroSlide[]> {
    const organizationId = await getDefaultOrganizationId();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const heroBanners = await prisma.heroBanner.findMany({
      where: {
        organizationId,
        isActive: true,
        isPublished: true,
      },
      include: {
        analytics: {
          where: {
            createdAt: { gte: startDate },
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
      take: limit,
    });

    return heroBanners.map(banner => {
      const impressions = banner.analytics.filter(a => a.eventType === 'view').length;
      const clicks = banner.analytics.filter(a => a.eventType === 'click').length;
      const conversions = banner.analytics.filter(a => a.eventType === 'conversion').length;
      const revenue = banner.revenueGenerated || 0;

      return {
        id: banner.id,
        title: banner.title,
        impressions,
        clicks,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        conversions,
        revenue,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get homepage section performance
   */
  static async getSectionPerformance(
    startDate?: Date,
    endDate?: Date
  ): Promise<SectionPerformance[]> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const sections = await HomepageAnalyticsService.getAllSectionsMetrics(start, end);

    const sectionDetails = await prisma.homepageSection.findMany({
      where: {
        id: { in: sections.map(s => s.sectionId) },
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    return sections.map(section => {
      const detail = sectionDetails.find(d => d.id === section.sectionId);
      return {
        sectionId: section.sectionId,
        sectionName: detail?.name || 'Unknown',
        sectionType: detail?.type || 'Unknown',
        views: section.views,
        clicks: section.clicks,
        ctr: section.ctr,
        revenue: section.revenue,
        orders: section.orders,
        conversions: section.conversions,
        averagePosition: section.averagePosition,
        scrollDepth: section.scrollDepth,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get CTA performance
   */
  static async getCTAPerformance(
    startDate?: Date,
    endDate?: Date
  ): Promise<CTAPerformance[]> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const sections = await prisma.homepageSection.findMany({
      where: {
        isEnabled: true,
      },
      select: {
        id: true,
        ctaText: true,
        ctaLink: true,
      },
    });

    const ctaPerformance: CTAPerformance[] = [];

    for (const section of sections) {
      if (!section.ctaText) continue;

      const metrics = await HomepageAnalyticsService.getSectionMetrics(section.id, start, end);
      const conversionRate = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0;

      ctaPerformance.push({
        sectionId: section.id,
        buttonText: section.ctaText,
        buttonLink: section.ctaLink || '',
        clicks: metrics.clicks,
        conversions: metrics.conversions,
        conversionRate,
        revenue: metrics.revenue,
      });
    }

    return ctaPerformance.sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get time series data for charts
   */
  static async getTimeSeriesData(days: number = 30): Promise<TimeSeriesData[]> {
    const organizationId = await getDefaultOrganizationId();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.order.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const visitors = await prisma.analyticsSession.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const timeSeries: Record<string, TimeSeriesData> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      timeSeries[dateStr] = {
        date: dateStr,
        revenue: 0,
        orders: 0,
        visitors: 0,
        conversions: 0,
      };
    }

    // Aggregate orders
    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (timeSeries[dateStr]) {
        timeSeries[dateStr].revenue += order.total;
        timeSeries[dateStr].orders += 1;
        timeSeries[dateStr].conversions += 1;
      }
    }

    // Aggregate visitors
    for (const visitor of visitors) {
      const dateStr = visitor.createdAt.toISOString().split('T')[0];
      if (timeSeries[dateStr]) {
        timeSeries[dateStr].visitors += 1;
      }
    }

    return Object.values(timeSeries);
  }

  /**
   * Get recommendation performance
   */
  static async getRecommendationPerformance(): Promise<{
    total: number;
    clicked: number;
    converted: number;
    ctr: number;
    conversionRate: number;
    byType: Record<string, {
      total: number;
      clicked: number;
      converted: number;
    }>;
  }> {
    const metrics = await RecommendationService.getRecommendationMetrics();

    const recommendations = await prisma.recommendation.findMany({
      select: {
        type: true,
        clicked: true,
        converted: true,
      },
    });

    const byType: Record<string, { total: number; clicked: number; converted: number }> = {};

    for (const rec of recommendations) {
      if (!byType[rec.type]) {
        byType[rec.type] = { total: 0, clicked: 0, converted: 0 };
      }
      byType[rec.type].total += 1;
      if (rec.clicked) byType[rec.type].clicked += 1;
      if (rec.converted) byType[rec.type].converted += 1;
    }

    return {
      ...metrics,
      byType,
    };
  }

  /**
   * Get user segment distribution
   */
  static async getUserSegmentDistribution(): Promise<Record<string, number>> {
    const personalizations = await prisma.userPersonalization.findMany({
      select: {
        segment: true,
      },
    });

    const distribution: Record<string, number> = {};

    for (const p of personalizations) {
      distribution[p.segment] = (distribution[p.segment] || 0) + 1;
    }

    return distribution;
  }

  /**
   * Get product ranking distribution
   */
  static async getProductRankingDistribution(): Promise<{
    high: number;
    medium: number;
    low: number;
  }> {
    const rankings = await prisma.productRanking.findMany({
      select: {
        totalScore: true,
      },
    });

    let high = 0;
    let medium = 0;
    let low = 0;

    for (const ranking of rankings) {
      if (ranking.totalScore >= 0.7) high++;
      else if (ranking.totalScore >= 0.4) medium++;
      else low++;
    }

    return { high, medium, low };
  }

  /**
   * Get campaign performance summary
   */
  static async getCampaignSummary(): Promise<{
    active: number;
    scheduled: number;
    expired: number;
    totalRevenue: number;
    totalConversions: number;
  }> {
    const organizationId = await getDefaultOrganizationId();
    const now = new Date();

    const [active, scheduled, expired] = await Promise.all([
      prisma.campaign.count({
        where: {
          organizationId,
          status: 'ACTIVE',
          startDate: { lte: now },
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      }),
      prisma.campaign.count({
        where: {
          organizationId,
          status: 'SCHEDULED',
        },
      }),
      prisma.campaign.count({
        where: {
          organizationId,
          status: 'EXPIRED',
        },
      }),
    ]);

    const allCampaigns = await prisma.campaign.findMany({
      where: { organizationId },
      include: {
        analytics: true,
      },
    });

    const totalRevenue = allCampaigns.reduce(
      (sum, c) => sum + c.analytics.reduce((s, a) => s + a.revenue, 0),
      0
    );
    const totalConversions = allCampaigns.reduce(
      (sum, c) => sum + c.analytics.reduce((s, a) => s + a.conversions, 0),
      0
    );

    return {
      active,
      scheduled,
      expired,
      totalRevenue,
      totalConversions,
    };
  }

  /**
   * Get homepage health score
   */
  static async getHomepageHealthScore(): Promise<{
    overall: number;
    performance: number;
    conversion: number;
    engagement: number;
    issues: string[];
  }> {
    const metrics = await this.getDashboardMetrics();
    const sectionPerformance = await this.getSectionPerformance();

    // Performance score (based on load time, etc.)
    const performanceScore = 85; // Placeholder - would use actual performance metrics

    // Conversion score (based on conversion rate)
    const conversionScore = Math.min(metrics.conversionRate.value * 10, 100);

    // Engagement score (based on CTR and scroll depth)
    const avgCTR = sectionPerformance.reduce((sum, s) => sum + s.ctr, 0) / sectionPerformance.length;
    const avgScrollDepth = sectionPerformance.reduce((sum, s) => sum + s.scrollDepth, 0) / sectionPerformance.length;
    const engagementScore = (avgCTR * 5) + (avgScrollDepth * 50);

    const overallScore = (performanceScore + conversionScore + engagementScore) / 3;

    const issues: string[] = [];
    if (metrics.conversionRate.value < 2) issues.push('Low conversion rate');
    if (metrics.ctr.value < 1) issues.push('Low click-through rate');
    if (performanceScore < 70) issues.push('Performance issues detected');

    return {
      overall: Math.round(overallScore),
      performance: Math.round(performanceScore),
      conversion: Math.round(conversionScore),
      engagement: Math.round(engagementScore),
      issues,
    };
  }

  /**
   * Get AI optimization suggestions
   */
  static async getAIOptimizationSuggestions(): Promise<Array<{
    type: 'hero' | 'products' | 'campaign' | 'layout';
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    expectedImpact: string;
  }>> {
    const suggestions: Array<{
      type: 'hero' | 'products' | 'campaign' | 'layout';
      priority: 'high' | 'medium' | 'low';
      suggestion: string;
      expectedImpact: string;
    }> = [];

    const metrics = await this.getDashboardMetrics();
    const topProducts = await this.getTopProducts(5);
    const sectionPerformance = await this.getSectionPerformance();

    // Analyze and generate suggestions
    if (metrics.conversionRate.value < 2) {
      suggestions.push({
        type: 'hero',
        priority: 'high',
        suggestion: 'Test different hero banner images and CTAs to improve conversion',
        expectedImpact: '+15-25% conversion rate',
      });
    }

    if (metrics.ctr.value < 1) {
      suggestions.push({
        type: 'campaign',
        priority: 'high',
        suggestion: 'Create urgency with countdown timers and limited-time offers',
        expectedImpact: '+20-30% CTR',
      });
    }

    const lowPerformingSections = sectionPerformance.filter(s => s.ctr < 0.5);
    if (lowPerformingSections.length > 0) {
      suggestions.push({
        type: 'layout',
        priority: 'medium',
        suggestion: `Reorder or optimize ${lowPerformingSections.length} underperforming sections`,
        expectedImpact: '+10-15% overall engagement',
      });
    }

    if (topProducts.length > 0) {
      suggestions.push({
        type: 'products',
        priority: 'medium',
        suggestion: 'Feature top-performing products more prominently on homepage',
        expectedImpact: '+10-20% revenue from featured products',
      });
    }

    return suggestions;
  }
}
