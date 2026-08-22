// src/app/api/marketing/campaigns/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';

export const GET = withApi(async ({ session }) => {
  const { prisma } = await import('@/lib/prisma');

  const campaigns = await prisma.marketingCampaign.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
  });

  return {
    success: true,
    campaigns,
  };
}, { requireAuth: true, requireAdmin: true });

export const POST = withApi(async ({ req, session }) => {
  const body = await req.json();
  const { name, type, subject, content, targetSegments, scheduledAt } = body;

  const { prisma } = await import('@/lib/prisma');

  const campaign = await prisma.marketingCampaign.create({
    data: {
      organizationId: session.organizationId,
      name,
      type,
      subject,
      content,
      targetSegments,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
    },
  });

  return {
    success: true,
    campaign,
  };
}, { requireAuth: true, requireAdmin: true });
