// src/lib/automation/ai-features.ts
// AI Features: sales insights dashboard, product analysis, customer behavior, forecasting

import { prisma } from '../prisma';
import { logSuccess, logFailure } from './logger';
import { AutomationType } from '@prisma/client';

/**
 * Architecture:
 * - AI Features provide intelligent insights and predictions
 * - Sales insights dashboard with key metrics
 * - Product performance analysis
 * - Customer behavior analysis
 * - Sales forecasting using historical data
 * - Inventory forecasting
 * - Uses statistical analysis and machine learning concepts
 */

/**
 * Generate sales insights dashboard
 * - Key performance indicators
 * - Revenue trends
 * - Order patterns
 */
export async function generateSalesInsights(organizationId: string, period: 'day' | 'week' | 'month' = 'week') {
  try {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
    }

    const orders = await prisma.order.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Calculate daily revenue trend
    const dailyRevenue = new Map<string, number>();
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + order.total);
    });

    const revenueTrend = Array.from(dailyRevenue.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Peak hours analysis
    const hourlyOrders = new Map<number, number>();
    orders.forEach(order => {
      const hour = order.createdAt.getHours();
      hourlyOrders.set(hour, (hourlyOrders.get(hour) || 0) + 1);
    });

    const peakHours = Array.from(hourlyOrders.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const insights = {
      period,
      totalOrders: orders.length,
      totalRevenue,
      averageOrderValue,
      revenueTrend,
      peakHours,
      conversionRate: calculateConversionRate(organizationId, startDate),
      topCategories: await getTopCategories(organizationId, startDate),
    };

    // Log success
    await logSuccess(
      organizationId,
      AutomationType.MARKETING_CAMPAIGN,
      'AI',
      'sales-insights',
      'Sales insights generated',
      insights
    );

    return insights;
  } catch (error) {
    await logFailure(
      organizationId,
      AutomationType.MARKETING_CAMPAIGN,
      'AI',
      'sales-insights',
      'Sales insights generation failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

/**
 * Analyze product performance
 * - Sales velocity
 * - Profit margins
 * - Stock turnover
 */
export async function analyzeProductPerformance(organizationId: string, period: number = 30) {
  try {
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

    const products = await prisma.product.findMany({
      where: { organizationId },
      include: {
        orderItems: {
          where: {
            order: {
              createdAt: { gte: startDate },
              status: {
                in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
              },
            },
          },
        },
      },
    });

    const productAnalysis = products.map(product => {
      const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalRevenue = product.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const salesVelocity = totalSold / period; // units per day
      const stockTurnover = product.stock > 0 ? totalSold / product.stock : 0;
      const profitMargin = product.cost ? ((product.price - product.cost) / product.price) * 100 : 0;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        totalSold,
        totalRevenue,
        salesVelocity,
        stockTurnover,
        profitMargin,
        currentStock: product.stock,
        rating: product.rating,
        reviewCount: product.reviewCount,
        performance: calculatePerformanceScore(salesVelocity, stockTurnover, profitMargin, product.rating),
      };
    });

    // Sort by performance score
    productAnalysis.sort((a, b) => b.performance - a.performance);

    return {
      period,
      topPerformers: productAnalysis.slice(0, 10),
      underperformers: productAnalysis.slice(-10).reverse(),
      averagePerformance: productAnalysis.reduce((sum, p) => sum + p.performance, 0) / productAnalysis.length,
    };
  } catch (error) {
    console.error('[Analyze Product Performance] Failed:', error);
    throw error;
  }
}

/**
 * Analyze customer behavior
 * - Purchase patterns
 * - Category preferences
 * - Lifetime value prediction
 */
export async function analyzeCustomerBehavior(organizationId: string, limit: number = 100) {
  try {
    const customers = await prisma.user.findMany({
      where: {
        Organization: { some: { id: organizationId } },
      },
      include: {
        orders: {
          where: {
            status: {
              in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
            },
          },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
        loyaltyPoints: true,
        customerSegment: true,
      },
      take: limit,
    });

    const customerAnalysis = customers.map(customer => {
      const orders = customer.orders;
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
      const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
      const orderFrequency = orders.length > 0
        ? calculateOrderFrequency(orders)
        : 0;

      // Category preferences
      const categoryPreferences = new Map<string, number>();
      orders.forEach(order => {
        order.items.forEach(item => {
          const category = item.product.category.name;
          categoryPreferences.set(category, (categoryPreferences.get(category) || 0) + 1);
        });
      });

      const topCategories = Array.from(categoryPreferences.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category, count]) => ({ category, count }));

      // Predict lifetime value
      const predictedLTV = predictLifetimeValue(totalSpent, orderFrequency, orders.length);

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalOrders: orders.length,
        totalSpent,
        avgOrderValue,
        orderFrequency,
        topCategories,
        loyaltyTier: customer.loyaltyPoints[0]?.tier || 'BRONZE',
        segment: customer.customerSegment[0]?.segment || 'NEW',
        predictedLTV,
        churnRisk: calculateChurnRisk(orders, orderFrequency),
      };
    });

    return {
      totalCustomers: customerAnalysis.length,
      customers: customerAnalysis,
      insights: {
        avgLifetimeValue: customerAnalysis.reduce((sum, c) => sum + c.predictedLTV, 0) / customerAnalysis.length,
        highValueCustomers: customerAnalysis.filter(c => c.predictedLTV > 5000).length,
        atRiskCustomers: customerAnalysis.filter(c => c.churnRisk > 0.7).length,
      },
    };
  } catch (error) {
    console.error('[Analyze Customer Behavior] Failed:', error);
    throw error;
  }
}

/**
 * Sales forecasting
 * - Predict future sales based on historical data
 * - Uses simple linear regression
 */
export async function forecastSales(organizationId: string, forecastPeriod: number = 30) {
  try {
    const historicalDays = 90;
    const startDate = new Date(Date.now() - historicalDays * 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
    });

    // Group by day
    const dailySales = new Map<string, number>();
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailySales.set(date, (dailySales.get(date) || 0) + order.total);
    });

    const salesData = Array.from(dailySales.entries())
      .map(([date, revenue], index) => ({ day: index, revenue }))
      .sort((a, b) => a.day - b.day);

    // Simple linear regression
    const n = salesData.length;
    const sumX = salesData.reduce((sum, d) => sum + d.day, 0);
    const sumY = salesData.reduce((sum, d) => sum + d.revenue, 0);
    const sumXY = salesData.reduce((sum, d) => sum + d.day * d.revenue, 0);
    const sumXX = salesData.reduce((sum, d) => sum + d.day * d.day, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate forecast
    const forecast = [];
    for (let i = historicalDays; i < historicalDays + forecastPeriod; i++) {
      const predictedRevenue = slope * i + intercept;
      forecast.push({
        day: i,
        date: new Date(Date.now() + (i - historicalDays) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predictedRevenue: Math.max(0, predictedRevenue),
      });
    }

    const totalForecastedRevenue = forecast.reduce((sum, f) => sum + f.predictedRevenue, 0);
    const avgDailyRevenue = forecast.reduce((sum, f) => sum + f.predictedRevenue, 0) / forecast.length;

    return {
      forecastPeriod,
      forecast,
      totalForecastedRevenue,
      avgDailyRevenue,
      confidence: calculateForecastConfidence(salesData),
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
    };
  } catch (error) {
    console.error('[Forecast Sales] Failed:', error);
    throw error;
  }
}

/**
 * Inventory forecasting
 * - Predict stock depletion
 * - Recommend reorder points
 */
export async function forecastInventory(organizationId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { organizationId },
      include: {
        orderItems: {
          where: {
            order: {
              createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              status: {
                in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
              },
            },
          },
        },
      },
    });

    const inventoryForecast = products.map(product => {
      const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const dailySalesRate = totalSold / 30; // units per day
      const daysUntilStockout = dailySalesRate > 0 ? Math.floor(product.stock / dailySalesRate) : Infinity;
      const recommendedReorderPoint = dailySalesRate * 14; // 14 days of stock
      const recommendedReorderQuantity = dailySalesRate * 30; // 30 days of stock

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        currentStock: product.stock,
        dailySalesRate,
        daysUntilStockout,
        stockStatus: getStockStatus(daysUntilStockout, product.lowStockAt),
        recommendedReorderPoint,
        recommendedReorderQuantity,
        urgency: calculateReorderUrgency(daysUntilStockout, product.lowStockAt),
      };
    });

    // Sort by urgency
    inventoryForecast.sort((a, b) => b.urgency - a.urgency);

    return {
      criticalItems: inventoryForecast.filter(i => i.urgency >= 0.8).length,
      warningItems: inventoryForecast.filter(i => i.urgency >= 0.5 && i.urgency < 0.8).length,
      forecast: inventoryForecast,
    };
  } catch (error) {
    console.error('[Forecast Inventory] Failed:', error);
    throw error;
  }
}

// Helper functions

function calculateConversionRate(organizationId: string, startDate: Date): number {
  // Simplified conversion rate calculation
  // In production, this would compare visitors to orders
  return 0.05; // Placeholder
}

async function getTopCategories(organizationId: string, startDate: Date) {
  const categorySales = await prisma.orderItem.findMany({
    where: {
      order: {
        organizationId,
        createdAt: { gte: startDate },
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  });

  const categoryMap = new Map<string, number>();
  categorySales.forEach(item => {
    const category = item.product.category.name;
    categoryMap.set(category, (categoryMap.get(category) || 0) + item.price * item.quantity);
  });

  return Array.from(categoryMap.entries())
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

function calculatePerformanceScore(velocity: number, turnover: number, margin: number, rating: number): number {
  // Weighted score calculation
  const velocityScore = Math.min(velocity * 10, 100);
  const turnoverScore = Math.min(turnover * 50, 100);
  const marginScore = Math.min(margin * 2, 100);
  const ratingScore = rating * 20;

  return (velocityScore * 0.3 + turnoverScore * 0.2 + marginScore * 0.3 + ratingScore * 0.2);
}

function calculateOrderFrequency(orders: any[]): number {
  if (orders.length < 2) return 0;
  const dates = orders.map(o => o.createdAt.getTime()).sort((a, b) => a - b);
  const intervals = [];
  for (let i = 1; i < dates.length; i++) {
    intervals.push(dates[i] - dates[i - 1]);
  }
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  return avgInterval / (24 * 60 * 60 * 1000); // days
}

function predictLifetimeValue(totalSpent: number, frequency: number, orderCount: number): number {
  if (orderCount === 0) return 0;
  const avgOrderValue = totalSpent / orderCount;
  const predictedOrders = frequency > 0 ? 365 / frequency : 12; // Predict orders per year
  return avgOrderValue * predictedOrders * 2; // 2-year prediction
}

function calculateChurnRisk(orders: any[], frequency: number): number {
  if (orders.length === 0) return 0.5;
  const lastOrder = orders[orders.length - 1];
  const daysSinceLastOrder = (Date.now() - lastOrder.createdAt.getTime()) / (24 * 60 * 60 * 1000);
  
  if (frequency === 0) return 0.3;
  const expectedInterval = frequency;
  const risk = Math.min(daysSinceLastOrder / (expectedInterval * 3), 1);
  return risk;
}

function calculateForecastConfidence(salesData: any[]): number {
  // Simplified confidence calculation based on data variance
  if (salesData.length < 10) return 0.5;
  const revenues = salesData.map(d => d.revenue);
  const mean = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;
  const variance = revenues.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / revenues.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;
  return Math.max(0, 1 - coefficientOfVariation);
}

function getStockStatus(daysUntilStockout: number, lowStockAt: number): string {
  if (daysUntilStockout === Infinity) return 'excess';
  if (daysUntilStockout <= 0) return 'out_of_stock';
  if (daysUntilStockout <= 7) return 'critical';
  if (daysUntilStockout <= 14) return 'low';
  return 'healthy';
}

function calculateReorderUrgency(daysUntilStockout: number, lowStockAt: number): number {
  if (daysUntilStockout === Infinity) return 0;
  if (daysUntilStockout <= 0) return 1;
  if (daysUntilStockout <= 7) return 0.9;
  if (daysUntilStockout <= 14) return 0.7;
  if (daysUntilStockout <= 30) return 0.5;
  return 0.2;
}

/**
 * Process AI features automation queue job
 * - Called by worker to process queued AI automation
 */
export async function processAIFeaturesJob(jobData: any) {
  const { type, organizationId, period, limit, forecastPeriod } = jobData;

  switch (type) {
    case 'sales_insights':
      return await generateSalesInsights(organizationId, period);
    case 'product_analysis':
      return await analyzeProductPerformance(organizationId, period);
    case 'customer_behavior':
      return await analyzeCustomerBehavior(organizationId, limit);
    case 'sales_forecast':
      return await forecastSales(organizationId, forecastPeriod);
    case 'inventory_forecast':
      return await forecastInventory(organizationId);
    default:
      throw new Error(`Unknown AI features type: ${type}`);
  }
}
