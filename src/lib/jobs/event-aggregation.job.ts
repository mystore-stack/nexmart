// src/lib/jobs/event-aggregation.job.ts
import { CronJob } from 'cron';
import { prisma } from '@/lib/prisma';

export const eventAggregationJob = new CronJob(
  '0 * * * *', // Every hour
  async () => {
    await aggregateHourlyEvents();
  },
  null,
  true,
  'UTC'
);

export const sessionCleanupJob = new CronJob(
  '0 0 * * *', // Daily at midnight
  async () => {
    await cleanupOldSessions();
  },
  null,
  true,
  'UTC'
);

async function aggregateHourlyEvents() {
  const startTime = new Date(Date.now() - 60 * 60 * 1000);
  const endTime = new Date();

  console.log('[Event Aggregation] Starting hourly aggregation');

  try {
    await aggregateEventsByType(startTime, endTime);
    await aggregateEventsByUser(startTime, endTime);
    await aggregateEventsByProduct(startTime, endTime);
    await aggregateEventsByOrganization(startTime, endTime);

    console.log('[Event Aggregation] Hourly aggregation completed');
  } catch (error) {
    console.error('[Event Aggregation] Failed:', error);
  }
}

async function aggregateEventsByType(startTime: Date, endTime: Date) {
  const eventsByType = await prisma.analyticsEvent.groupBy({
    by: ['eventType'],
    where: {
      occurredAt: {
        gte: startTime,
        lte: endTime,
      },
    },
    _count: true,
  });

  console.log('[Event Aggregation] Events by type:', eventsByType);
  // Store aggregated metrics in Redis or separate aggregation table
}

async function aggregateEventsByUser(startTime: Date, endTime: Date) {
  const eventsByUser = await prisma.analyticsEvent.groupBy({
    by: ['userId'],
    where: {
      occurredAt: {
        gte: startTime,
        lte: endTime,
      },
      userId: {
        not: null,
      },
    },
    _count: true,
    orderBy: {
      _count: {
        userId: 'desc',
      },
    },
    take: 100,
  });

  console.log('[Event Aggregation] Top users by events:', eventsByUser.slice(0, 10));
}

async function aggregateEventsByProduct(startTime: Date, endTime: Date) {
  const eventsByProduct = await prisma.analyticsEvent.groupBy({
    by: ['productId'],
    where: {
      occurredAt: {
        gte: startTime,
        lte: endTime,
      },
      productId: {
        not: null,
      },
    },
    _count: true,
    orderBy: {
      _count: {
        productId: 'desc',
      },
    },
    take: 100,
  });

  console.log('[Event Aggregation] Top products by events:', eventsByProduct.slice(0, 10));
}

async function aggregateEventsByOrganization(startTime: Date, endTime: Date) {
  const eventsByOrg = await prisma.analyticsEvent.groupBy({
    by: ['organizationId'],
    where: {
      occurredAt: {
        gte: startTime,
        lte: endTime,
      },
    },
    _count: true,
  });

  console.log('[Event Aggregation] Events by organization:', eventsByOrg);
}

async function cleanupOldSessions() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  console.log('[Session Cleanup] Starting session cleanup');

  try {
    const result = await prisma.analyticsSession.deleteMany({
      where: {
        startedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    console.log(`[Session Cleanup] Deleted ${result.count} old sessions`);
  } catch (error) {
    console.error('[Session Cleanup] Failed:', error);
  }
}
