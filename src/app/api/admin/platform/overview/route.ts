// src/app/api/admin/platform/overview/route.ts
import { withApi } from '@/lib/withApi';
import { RevenueAggregation } from '@/lib/saas/revenue-aggregation';
import { SubscriptionAggregation } from '@/lib/saas/subscription-aggregation';

export const GET = withApi(async () => {
  const { prisma } = await import('@/lib/prisma');

  // Revenue metrics
  const totalRevenue = await RevenueAggregation.calculateTotalRevenue();
  const mrr = await RevenueAggregation.calculateMRR();
  const arr = await RevenueAggregation.calculateARR();
  const revenueGrowth = await RevenueAggregation.calculateRevenueGrowth();

  // Subscription metrics
  const totalSubscriptions = await prisma.subscription.count();
  const activeSubscriptions = await prisma.subscription.count({
    where: { status: 'ACTIVE' },
  });
  const churnRate = await SubscriptionAggregation.calculateChurnRate();

  // Tenant metrics
  const totalTenants = await prisma.organization.count();
  const activeTenants = await prisma.organization.count({
    where: { status: 'ACTIVE' },
  });

  // Usage metrics
  const totalApiCalls = await prisma.usageRecord.aggregate({
    where: { metric: 'API_CALLS' },
    _sum: { quantity: true },
  });

  const totalAiRequests = await prisma.usageRecord.aggregate({
    where: { metric: 'AI_REQUESTS' },
    _sum: { quantity: true },
  });

  const totalEmails = await prisma.usageRecord.aggregate({
    where: { metric: 'EMAILS_SENT' },
    _sum: { quantity: true },
  });

  return {
    success: true,
    data: {
      revenue: {
        total: totalRevenue,
        mrr,
        arr,
        growth: revenueGrowth,
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        churnRate,
      },
      tenants: {
        total: totalTenants,
        active: activeTenants,
      },
      usage: {
        apiCalls: totalApiCalls._sum.quantity || 0,
        aiRequests: totalAiRequests._sum.quantity || 0,
        emails: totalEmails._sum.quantity || 0,
      },
    },
  };
}, { requireAuth: true, requireSuperAdmin: true });
