// src/app/api/bi/revenue/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';

export const GET = withApi(async ({ req, session }) => {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = searchParams.get('endDate') || new Date().toISOString();
  const granularity = searchParams.get('granularity') || 'DAILY';

  const { prisma } = await import('@/lib/prisma');

  // Get total revenue for the period
  const totalRevenue = await prisma.order.aggregate({
    where: {
      organizationId: session.organizationId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      status: 'COMPLETED',
    },
    _sum: { total: true },
  });

  // Get previous period revenue for comparison
  const periodLength = new Date(endDate).getTime() - new Date(startDate).getTime();
  const previousStartDate = new Date(new Date(startDate).getTime() - periodLength).toISOString();
  const previousEndDate = startDate;

  const previousRevenue = await prisma.order.aggregate({
    where: {
      organizationId: session.organizationId,
      createdAt: {
        gte: new Date(previousStartDate),
        lte: new Date(previousEndDate),
      },
      status: 'COMPLETED',
    },
    _sum: { total: true },
  });

  // Calculate change percentage
  const currentTotal = totalRevenue._sum.total || 0;
  const previousTotal = previousRevenue._sum.total || 0;
  const changePercent = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  // Get revenue by period
  const revenueByPeriod = await getRevenueByPeriod(session.organizationId, startDate, endDate, granularity);

  // Get revenue by category
  const revenueByCategory = await getRevenueByCategory(session.organizationId, startDate, endDate);

  return {
    success: true,
    data: {
      totalRevenue: currentTotal,
      previousRevenue: previousTotal,
      changePercent,
      byPeriod: revenueByPeriod,
      byCategory: revenueByCategory,
    },
  };
}, { requireAuth: true, requireAdmin: true });

async function getRevenueByPeriod(organizationId: string, startDate: string, endDate: string, granularity: string) {
  const { prisma } = await import('@/lib/prisma');

  const orders = await prisma.order.findMany({
    where: {
      organizationId,
      createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
      status: 'COMPLETED',
    },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by period based on granularity
  const grouped = new Map<string, number>();
  
  for (const order of orders) {
    const period = getPeriodKey(order.createdAt, granularity);
    grouped.set(period, (grouped.get(period) || 0) + order.total);
  }

  return Array.from(grouped.entries()).map(([period, revenue]) => ({ period, revenue }));
}

async function getRevenueByCategory(organizationId: string, startDate: string, endDate: string) {
  const { prisma } = await import('@/lib/prisma');

  const orders = await prisma.order.findMany({
    where: {
      organizationId,
      createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
      status: 'COMPLETED',
    },
    include: { items: { include: { product: { include: { category: true } } } } },
  });

  const categoryRevenue = new Map<string, number>();

  for (const order of orders) {
    for (const item of order.items) {
      const categoryName = item.product.category.name;
      categoryRevenue.set(categoryName, (categoryRevenue.get(categoryName) || 0) + item.price * item.quantity);
    }
  }

  const total = Array.from(categoryRevenue.values()).reduce((a, b) => a + b, 0);

  return Array.from(categoryRevenue.entries()).map(([category, revenue]) => ({
    category,
    revenue,
    percent: total > 0 ? (revenue / total) * 100 : 0,
  })).sort((a, b) => b.revenue - a.revenue);
}

function getPeriodKey(date: Date, granularity: string): string {
  const d = new Date(date);
  
  switch (granularity) {
    case 'HOURLY':
      return d.toISOString().substring(0, 13);
    case 'DAILY':
      return d.toISOString().substring(0, 10);
    case 'WEEKLY':
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      return weekStart.toISOString().substring(0, 10);
    case 'MONTHLY':
      return d.toISOString().substring(0, 7);
    default:
      return d.toISOString().substring(0, 10);
  }
}
