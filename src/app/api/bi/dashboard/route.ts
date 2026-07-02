// src/app/api/bi/dashboard/route.ts
import { withApi } from '@/lib/withApi';
import { requireAuth } from '@/lib/auth-api';

export const GET = withApi(async () => {
  const session = await requireAuth();
  const { prisma } = await import('@/lib/prisma');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // Get today's revenue
  const todayRevenue = await prisma.order.aggregate({
    where: {
      organizationId: session!.organizationId,
      createdAt: { gte: todayStart },
      status: 'COMPLETED' as any,
    },
    _sum: { total: true },
  });

  // Get today's orders
  const todayOrders = await prisma.order.count({
    where: {
      organizationId: session!.organizationId,
      createdAt: { gte: todayStart },
      status: 'COMPLETED' as any,
    },
  });

  // Get total users - TODO: Implement with proper schema (User doesn't have organizationId directly)
  const totalUsers = 0;

  // Get active users (last 7 days) - TODO: Implement with proper schema
  const activeUsers = 0;

  // Calculate conversion rate (orders / active users)
  const conversionRate = activeUsers > 0 ? (todayOrders / activeUsers) * 100 : 0;

  // Calculate AOV (Average Order Value)
  const aov = todayOrders > 0 ? (todayRevenue._sum?.total || 0) / todayOrders : 0;

  // Get trends for the last 7 days
  const trends = await getTrends(session!.organizationId, 7);

  return {
    success: true,
    data: {
      revenue: todayRevenue._sum.total || 0,
      orders: todayOrders,
      users: totalUsers,
      activeUsers,
      conversionRate,
      aov,
      trends,
    },
  };
}, { requireAuth: true, requireAdmin: true });

async function getTrends(organizationId: string, days: number) {
  const { prisma } = await import('@/lib/prisma');

  const revenueTrend = [];
  const ordersTrend = [];
  const usersTrend = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayRevenue = await prisma.order.aggregate({
      where: {
        organizationId,
        createdAt: { gte: dayStart, lt: dayEnd },
        status: 'COMPLETED' as any,
      },
      _sum: { total: true },
    });

    const dayOrders = await prisma.order.count({
      where: {
        organizationId,
        createdAt: { gte: dayStart, lt: dayEnd },
        status: 'COMPLETED' as any,
      },
    });

    const dayUsers = 0; // TODO: Implement with proper schema

    revenueTrend.push(dayRevenue._sum?.total || 0);
    ordersTrend.push(dayOrders);
    usersTrend.push(dayUsers);
  }

  return { revenue: revenueTrend, orders: ordersTrend, users: usersTrend };
}
