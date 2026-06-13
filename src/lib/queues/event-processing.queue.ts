// src/lib/queues/event-processing.queue.ts
import { Queue, Worker } from 'bullmq';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { EventType, EventSource } from '@prisma/client';

export const eventQueue = new Queue('events', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

// Event Processor Worker
export const eventWorker = new Worker(
  'events',
  async (job) => {
    const { eventData } = job.data;
    await processEvent(eventData);
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

async function processEvent(eventData: any) {
  try {
    // Create or update session
    let session = null;
    if (eventData.sessionId) {
      session = await prisma.analyticsSession.upsert({
        where: { sessionId: eventData.sessionId },
        update: {
          pageViews: { increment: 1 },
          endedAt: new Date(),
        },
        create: {
          organizationId: eventData.organizationId,
          userId: eventData.userId,
          sessionId: eventData.sessionId,
          deviceType: eventData.deviceType,
          browser: eventData.browser,
          os: eventData.os,
          ipAddress: eventData.ipAddress,
        },
      });
    }

    // Store event
    await prisma.analyticsEvent.create({
      data: {
        organizationId: eventData.organizationId,
        userId: eventData.userId,
        sessionId: eventData.sessionId,
        eventType: eventData.eventType,
        eventSource: eventData.eventSource,
        properties: eventData.properties || {},
        productId: eventData.productId,
        categoryId: eventData.categoryId,
        orderId: eventData.orderId,
        searchQuery: eventData.searchQuery,
        url: eventData.url,
        referrer: eventData.referrer,
        userAgent: eventData.userAgent,
        ipAddress: eventData.ipAddress,
        deviceType: eventData.deviceType,
        browser: eventData.browser,
        os: eventData.os,
        processedAt: new Date(),
      },
    });

    // Update session conversion count for conversion events
    if (session && isConversionEvent(eventData.eventType)) {
      await prisma.analyticsSession.update({
        where: { id: session.id },
        data: {
          conversions: { increment: 1 },
          bounce: false,
        },
      });
    }

    // Publish event to Redis for real-time analytics
    await redis.publish('channel:analytics', JSON.stringify({
      type: eventData.eventType,
      organizationId: eventData.organizationId,
      timestamp: new Date().toISOString(),
    }));

  } catch (error) {
    console.error('[Event Processing] Failed to process event:', error);
    throw error;
  }
}

function isConversionEvent(eventType: EventType): boolean {
  return [
    EventType.PURCHASE,
    EventType.CHECKOUT_COMPLETED,
    EventType.ADD_TO_CART,
  ].includes(eventType);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await eventWorker.close();
  await eventQueue.close();
});

process.on('SIGINT', async () => {
  await eventWorker.close();
  await eventQueue.close();
});
