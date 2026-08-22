// src/app/api/events/track/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';
import { z } from 'zod';
import { eventQueue } from '@/lib/queues/event-processing.queue';
import { getClientIp } from '@/lib/utils';

const EventType = {
  PAGE_VIEW: 'PAGE_VIEW',
  PRODUCT_VIEW: 'PRODUCT_VIEW',
  ADD_TO_CART: 'ADD_TO_CART',
  SEARCH: 'SEARCH',
  CHECKOUT: 'CHECKOUT',
  CHECKOUT_STARTED: 'CHECKOUT_STARTED',
  PURCHASE: 'PURCHASE',
} as const;

const EventSource = {
  WEB: 'WEB',
} as const;

const trackEventSchema = z.object({
  eventType: z.enum(Object.values(EventType) as [string, ...string[]]),
  properties: z.record(z.any()).optional(),
  productId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  searchQuery: z.string().optional(),
  url: z.string().url().optional(),
  referrer: z.string().optional(),
});

export const POST = withApi(async ({ req }) => {
  const session = await (await import('@/lib/auth-api')).getSession();
  const body = await req.json();
  const validated = trackEventSchema.parse(body);

  const eventData = {
    ...validated,
    userId: session?.userId,
    sessionId: req.headers.get('x-session-id') || null,
    eventSource: EventSource.WEB,
    url: validated.url || req.headers.get('referer'),
    referrer: validated.referrer || req.headers.get('referer'),
    userAgent: req.headers.get('user-agent'),
    ipAddress: getClientIp(req),
    deviceType: req.headers.get('x-device-type'),
    browser: req.headers.get('x-browser'),
    os: req.headers.get('x-os'),
    organizationId: session?.organizationId || await getDefaultOrganizationId(),
  };

  // Enqueue event for async processing
  await eventQueue.add('process-event', { eventData }, {
    priority: validated.eventType === 'PURCHASE' ? 10 : 5,
  });

  return { success: true, eventId: crypto.randomUUID() };
}, { requireAuth: false });

async function getDefaultOrganizationId(): Promise<string> {
  const { prisma } = await import('@/lib/prisma');
  const org = await prisma.organization.findFirst();
  return org?.id || '';
}
