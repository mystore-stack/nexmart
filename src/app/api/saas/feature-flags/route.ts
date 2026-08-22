// src/app/api/saas/feature-flags/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';

export const GET = withApi(async ({ session }) => {
  const { prisma } = await import('@/lib/prisma');

  const flags = await prisma.featureFlag.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return {
    success: true,
    flags,
  };
}, { requireAuth: true, requireAdmin: true });

export const POST = withApi(async ({ req, session }) => {
  const body = await req.json();
  const { key, name, description, enabled, rolloutPercentage, targetPlans, targetOrganizations, category } = body;

  const { prisma } = await import('@/lib/prisma');

  const flag = await prisma.featureFlag.create({
    data: {
      key,
      name,
      description,
      enabled: enabled || false,
      rolloutPercentage: rolloutPercentage || 0,
      targetPlans,
      targetOrganizations,
      category,
    },
  });

  return {
    success: true,
    flag,
  };
}, { requireAuth: true, requireAdmin: true });
