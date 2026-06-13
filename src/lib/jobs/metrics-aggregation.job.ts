// src/lib/jobs/metrics-aggregation.job.ts
import { CronJob } from 'cron';
import { prisma } from '@/lib/prisma';

export const metricsAggregationJob = new CronJob(
  '0 * * * * *', // Every hour
  async () => {
    await aggregateMetrics();
  },
  null,
  true,
  'UTC'
);

async function aggregateMetrics() {
  console.log('[Metrics Aggregation] Starting metrics aggregation');

  try {
    const organizations = await prisma.organization.findMany();

    for (const organization of organizations) {
      await aggregateOrganizationMetrics(organization.id);
    }

    console.log('[Metrics Aggregation] Completed metrics aggregation');
  } catch (error) {
    console.error('[Metrics Aggregation] Failed:', error);
  }
}

async function aggregateOrganizationMetrics(organizationId: string) {
  const now = new Date();
  const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
  const hourEnd = new Date(hourStart);
  hourEnd.setHours(hourEnd.getHours() + 1);

  // Aggregate revenue metrics
  await aggregateRevenueMetrics(organizationId, hourStart, hourEnd);

  // Aggregate user metrics
  await aggregateUserMetrics(organizationId, hourStart, hourEnd);

  // Aggregate order metrics
  await aggregateOrderMetrics(organizationId, hourStart, hourEnd);
}

async function aggregateRevenueMetrics(organizationId: string, periodStart: Date, periodEnd: Date) {
  const revenue = await prisma.order.aggregate({
    where: {
      organizationId,
      createdAt: { gte: periodStart, lt: periodEnd },
      status: 'COMPLETED',
    },
    _sum: { total: true },
  });

  const previousPeriodStart = new Date(periodStart);
  previousPeriodStart.setHours(previousPeriodStart.getHours() - 1);
  const previousPeriodEnd = periodStart;

  const previousRevenue = await prisma.order.aggregate({
    where: {
      organizationId,
      createdAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
      status: 'COMPLETED',
    },
    _sum: { total: true },
  });

  const currentTotal = revenue._sum.total || 0;
  const previousTotal = previousRevenue._sum.total || 0;
  const changePercent = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

  await prisma.analyticsMetric.upsert({
    where: {
      organizationId_type_granularity_periodStart: {
        organizationId,
        type: 'REVENUE',
        granularity: 'HOURLY',
        periodStart,
      },
    },
    create: {
      organizationId,
      type: 'REVENUE',
      granularity: 'HOURLY',
      periodStart,
      periodEnd,
      value: currentTotal,
      previousValue: previousTotal,
      changePercent,
      dimensions: {},
    },
    update: {
      value: currentTotal,
      previousValue: previousTotal,
      changePercent,
    },
  });
}

async function aggregateUserMetrics(organizationId: string, periodStart: Date, periodEnd: Date) {
  const users = await prisma.user.count({
    where: {
      organizationId,
      createdAt: { gte: periodStart, lt: periodEnd },
    },
  });

  const previousPeriodStart = new Date(periodStart);
  previousPeriodStart.setHours(previousPeriodStart.getHours() - 1);
  const previousPeriodEnd = periodStart;

  const previousUsers = await prisma.user.count({
    where: {
      organizationId,
      createdAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
    },
  });

  const changePercent = previousUsers > 0 ? ((users - previousUsers) / previousUsers) * 100 : 0;

  await prisma.analyticsMetric.upsert({
    where: {
      organizationId_type_granularity_periodStart: {
        organizationId,
        type: 'USERS',
        granularity: 'HOURLY',
        periodStart,
      },
    },
    create: {
      organizationId,
      type: 'USERS',
      granularity: 'HOURLY',
      periodStart,
      periodEnd,
      value: users,
      previousValue: previousUsers,
      changePercent,
      dimensions: {},
    },
    update: {
      value: users,
      previousValue: previousUsers,
      changePercent,
    },
  });
}

async function aggregateOrderMetrics(organizationId: string, periodStart: Date, periodEnd: Date) {
  const orders = await prisma.order.count({
    where: {
      organizationId,
      createdAt: { gte: periodStart, lt: periodEnd },
      status: 'COMPLETED',
    },
  });

  const previousPeriodStart = new Date(periodStart);
  previousPeriodStart.setHours(previousPeriodStart.getHours() - 1);
  const previousPeriodEnd = periodStart;

  const previousOrders = await prisma.order.count({
    where: {
      organizationId,
      createdAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
      status: 'COMPLETED',
    },
  });

  const changePercent = previousOrders > 0 ? ((orders - previousOrders) / previousOrders) * 100 : 0;

  await prisma.analyticsMetric.upsert({
    where: {
      organizationId_type_granularity_periodStart: {
        organizationId,
        type: 'ORDERS',
        granularity: 'HOURLY',
        periodStart,
      },
    },
    create: {
      organizationId,
      type: 'ORDERS',
      granularity: 'HOURLY',
      periodStart,
      periodEnd,
      value: orders,
      previousValue: previousOrders,
      changePercent,
      dimensions: {},
    },
    update: {
      value: orders,
      previousValue: previousOrders,
      changePercent,
    },
  });
}
