// src/app/api/events/batch/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';
import { z } from 'zod';
import { EventType, EventSource } from '@prisma/client';
import { eventQueue } from '@/lib/queues/event-processing.queue';

const trackEventSchema = z.object({
  eventType: z.nativeEnum(EventType),
  properties: z.record(z.any()).optional(),
  productId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  searchQuery: z.string().optional(),
  url: z.string().url().optional(),
  referrer: z.string().optional(),
});

const batchTrackSchema = z.object({
  events: z.array(trackEventSchema),
});

export const POST = withApi(async ({ req }) => {
  const session = await (await import('@/lib/auth-api')).getSession();
  const body = await req.json();
  const validated = batchTrackSchema.parse(body);

  const organizationId = session?.organizationId || await getDefaultOrganizationId();
  const sessionId = req.headers.get('x-session-id') || null;

  const jobs = validated.events.map((event) => ({
    name: 'process-event',
    data: {
      eventData: {
        ...event,
        userId: session?.userId,
        sessionId,
        eventSource: EventSource.WEB,
        url: event.url || req.headers.get('referer'),
        referrer: event.referrer || req.headers.get('referer'),
        userAgent: req.headers.get('user-agent'),
        ipAddress: getClientIp(req),
        deviceType: req.headers.get('x-device-type'),
        browser: req.headers.get('x-browser'),
        os: req.headers.get('x-os'),
        organizationId,
      },
    },
    opts: {
      priority: event.eventType === EventType.PURCHASE ? 10 : 5,
    },
  }));

  await eventQueue.addBulk(jobs);

  return { 
    success: true, 
    processed: jobs.length,
    failed: 0,
  };
}, { requireAuth: false });

async function getDefaultOrganizationId(): Promise<string> {
  const { prisma } = await import('@/lib/prisma');
  const org = await prisma.organization.findFirst();
  return org?.id || '';
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}
