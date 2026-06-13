// src/lib/services/executive-analytics.service.ts
// Enhanced analytics service with executive metrics

import { prisma } from '../prisma';

interface AnalyticsOptions {
  organizationId: string;
  startDate: Date;
  endDate: Date;
  previousStartDate?: Date;
  previousEndDate?: Date;
}

interface ExecutiveMetrics {
  revenue: {
    total: number;
    change: number;
  };
  orders: {
    total: number;
    change: number;
    averageOrderValue: number;
    aovChange: number;
  };
  customers: {
    total: number;
    new: number;
    active: number;
    growth: number;
    lifetimeValue: number;
    repeatPurchaseRate: number;
  };
  profit: {
    total: number;
    margin: number;
    change: number;
  };
  inventory: {
    totalValue: number;
    outOfStock: number;
    lowStock: number;
    overstocked: number;
  };
  conversion: {
    rate: number;
    cartAbandonmentRate: number;
  };
}

/**
 * Calculate executive analytics metrics
 */
export async function getExecutiveMetrics(options: AnalyticsOptions): Promise<ExecutiveMetrics> {
  const { organizationId, startDate, endDate, previousStartDate, previousEndDate } = options;

  // Current period data
  const [
    currentRevenue,
    currentOrders,
    currentOrderValues,
    currentCustomers,
    newCustomers,
    customerOrders,
    totalProducts,
    inventoryValue,
    outOfStock,
    lowStock,
    overstocked,
    funnelData,
  ] = await Promise.all([
    // Revenue
    prisma.order.aggregate({
      where: { organizationId, createdAt: { gte: startDate, lte: endDate }, paymentStatus: 'PAID' },
      _sum: { total: true },
    }),
    
    // Order count
    prisma.order.count({
      where: { organizationId, createdAt: { gte: startDate, lte: endDate } },
    }),
    
    // Order values for AOV
    prisma.order.findMany({
      where: { organizationId, createdAt: { gte: startDate, lte: endDate }, paymentStatus: 'PAID' },
      select: { total: true },
    }),
    
    // Total customers
    prisma.membership.count({
      where: { organizationId },
    }),
    
    // New customers
    prisma.membership.count({
      where: { organizationId, createdAt: { gte: startDate, lte: endDate } },
    }),
    
    // Customer orders for LTV and repeat rate
    prisma.order.groupBy({
      by: ['userId'],
      where: { organizationId, paymentStatus: 'PAID' },
      _count: true,
      _sum: { total: true },
    }),
    
    // Total products
    prisma.product.count({
      where: { organizationId },
    }),
    
    // Inventory value
    prisma.product.aggregate({
      where: { organizationId },
      _sum: { price: true },
    }),
    
    // Out of stock
    prisma.product.count({
      where: { organizationId, stock: 0 },
    }),
    
    // Low stock
    prisma.product.count({
      where: { organizationId, stock: { gt: 0, lte: 10 } },
    }),
    
    // Overstocked (more than 100 units)
    prisma.product.count({
      where: { organizationId, stock: { gt: 100 } },
    }),
    
    // Funnel data from Redis (if available)
    getFunnelMetrics(organizationId, startDate, endDate),
  ]);

  // Previous period data for comparison
  let previousRevenue = 0;
  let previousOrders = 0;
  let previousOrderValues: number[] = [];
  
  if (previousStartDate && previousEndDate) {
    const [prevRev, prevOrd, prevOrdVals] = await Promise.all([
      prisma.order.aggregate({
        where: { organizationId, createdAt: { gte: previousStartDate, lte: previousEndDate }, paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { organizationId, createdAt: { gte: previousStartDate, lte: previousEndDate } },
      }),
      prisma.order.findMany({
        where: { organizationId, createdAt: { gte: previousStartDate, lte: previousEndDate }, paymentStatus: 'PAID' },
        select: { total: true },
      }),
    ]);
    
    previousRevenue = prevRev._sum.total || 0;
    previousOrders = prevOrd;
    previousOrderValues = prevOrdVals.map(o => o.total);
  }

  // Calculate metrics
  const revenueTotal = currentRevenue._sum.total || 0;
  const ordersTotal = currentOrders;
  const orderValues = currentOrderValues.map(o => o.total);
  const averageOrderValue = ordersTotal > 0 ? revenueTotal / ordersTotal : 0;
  
  const previousAOV = previousOrders > 0 ? previousOrderValues.reduce((a, b) => a + b, 0) / previousOrders : 0;
  const aovChange = previousAOV > 0 ? ((averageOrderValue - previousAOV) / previousAOV) * 100 : 0;
  
  const revenueChange = previousRevenue > 0 ? ((revenueTotal - previousRevenue) / previousRevenue) * 100 : 0;
  const ordersChange = previousOrders > 0 ? ((ordersTotal - previousOrders) / previousOrders) * 100 : 0;
  
  // Customer metrics
  const totalCustomers = currentCustomers;
  const activeCustomers = customerOrders.length;
  const repeatCustomers = customerOrders.filter(c => c._count > 1).length;
  const repeatPurchaseRate = activeCustomers > 0 ? (repeatCustomers / activeCustomers) * 100 : 0;
  
  const totalCustomerRevenue = customerOrders.reduce((sum, c) => sum + (c._sum.total || 0), 0);
  const lifetimeValue = totalCustomers > 0 ? totalCustomerRevenue / totalCustomers : 0;
  
  // Active customers (orders in last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activeCustomersCount = await prisma.order.groupBy({
    by: ['userId'],
    where: { organizationId, createdAt: { gte: thirtyDaysAgo } },
  }).then(result => result.length);
  
  // Profit calculation (assuming 70% margin if no cost data)
  const profitTotal = revenueTotal * 0.7;
  const profitMargin = revenueTotal > 0 ? (profitTotal / revenueTotal) * 100 : 0;
  
  const previousProfit = previousRevenue * 0.7;
  const profitChange = previousProfit > 0 ? ((profitTotal - previousProfit) / previousProfit) * 100 : 0;
  
  // Inventory metrics
  const inventoryTotalValue = inventoryValue._sum.price || 0;
  
  // Conversion metrics
  const conversionRate = funnelData ? funnelData.conversionRate : 0;
  const cartAbandonmentRate = funnelData ? funnelData.cartAbandonmentRate : 0;

  return {
    revenue: {
      total: revenueTotal,
      change: revenueChange,
    },
    orders: {
      total: ordersTotal,
      change: ordersChange,
      averageOrderValue,
      aovChange,
    },
    customers: {
      total: totalCustomers,
      new: newCustomers,
      active: activeCustomersCount,
      growth: ordersChange, // Using orders change as proxy for customer growth
      lifetimeValue,
      repeatPurchaseRate,
    },
    profit: {
      total: profitTotal,
      margin: profitMargin,
      change: profitChange,
    },
    inventory: {
      totalValue: inventoryTotalValue,
      outOfStock,
      lowStock,
      overstocked,
    },
    conversion: {
      rate: conversionRate,
      cartAbandonmentRate,
    },
  };
}

/**
 * Get funnel metrics from Redis or database
 */
async function getFunnelMetrics(organizationId: string, startDate: Date, endDate: Date) {
  try {
    // Try to get from Redis first
    const { getCounter } = await import('../redis');
    const today = new Date().toISOString().split('T')[0];
    
    const [pageViews, addToCart, checkoutStart, orders] = await Promise.all([
      getCounter(`analytics:page_views:${today}`),
      getCounter(`analytics:add_to_cart:${today}`),
      getCounter(`analytics:checkout_start:${today}`),
      getCounter(`analytics:daily_orders:${today}`),
    ]);
    
    const addToCartRate = pageViews > 0 ? (addToCart / pageViews) * 100 : 0;
    const checkoutRate = addToCart > 0 ? (checkoutStart / addToCart) * 100 : 0;
    const purchaseRate = checkoutStart > 0 ? (orders / checkoutStart) * 100 : 0;
    const overallRate = pageViews > 0 ? (orders / pageViews) * 100 : 0;
    const cartAbandonmentRate = checkoutStart > 0 ? ((checkoutStart - orders) / checkoutStart) * 100 : 0;
    
    return {
      pageViews,
      addToCart,
      checkoutStart,
      orders,
      conversionRate: overallRate,
      cartAbandonmentRate,
    };
  } catch (error) {
    console.error('[Executive Analytics] Failed to get funnel metrics:', error);
    return {
      pageViews: 0,
      addToCart: 0,
      checkoutStart: 0,
      orders: 0,
      conversionRate: 0,
      cartAbandonmentRate: 0,
    };
  }
}

/**
 * Get sales trends data
 */
export async function getSalesTrends(organizationId: string, days: number = 90) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const orders = await prisma.order.findMany({
    where: { organizationId, createdAt: { gte: startDate }, paymentStatus: 'PAID' },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  
  // Group by month
  const monthlyData = new Map<string, { revenue: number; orders: number }>();
  
  orders.forEach(order => {
    const month = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyData.has(month)) {
      monthlyData.set(month, { revenue: 0, orders: 0 });
    }
    const data = monthlyData.get(month)!;
    data.revenue += order.total;
    data.orders += 1;
  });
  
  return Array.from(monthlyData.entries()).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    orders: data.orders,
  }));
}

/**
 * Get inventory metrics
 */
export async function getInventoryMetrics(organizationId: string) {
  const [products, inventoryValue, outOfStock, lowStock, overstocked] = await Promise.all([
    prisma.product.findMany({
      where: { organizationId },
      select: { id: true, name: true, stock: true, price: true, soldCount: true },
    }),
    prisma.product.aggregate({
      where: { organizationId },
      _sum: { price: true },
    }),
    prisma.product.count({
      where: { organizationId, stock: 0 },
    }),
    prisma.product.count({
      where: { organizationId, stock: { gt: 0, lte: 10 } },
    }),
    prisma.product.count({
      where: { organizationId, stock: { gt: 100 } },
    }),
  ]);
  
  // Calculate inventory turnover (simplified)
  const totalInventoryValue = inventoryValue._sum.price || 0;
  const totalSoldValue = products.reduce((sum, p) => sum + (p.soldCount * p.price), 0);
  const inventoryTurnover = totalInventoryValue > 0 ? totalSoldValue / totalInventoryValue : 0;
  
  // Days sales of inventory (simplified)
  const avgDailySales = totalSoldValue / 90; // Assuming 90 days
  const daysSalesOfInventory = avgDailySales > 0 ? totalInventoryValue / avgDailySales : 0;
  
  return {
    totalValue: totalInventoryValue,
    outOfStock,
    lowStock,
    overstocked,
    inventoryTurnover,
    daysSalesOfInventory,
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      value: p.stock * p.price,
      soldCount: p.soldCount,
    })),
  };
}
