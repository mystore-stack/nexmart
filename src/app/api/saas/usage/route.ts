// src/app/api/saas/usage/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';
import { LimitEnforcer } from '@/lib/saas/limit-enforcer';

export const GET = withApi(async ({ session }) => {
  const stats = await LimitEnforcer.getUsageStats(session.organizationId);

  return {
    success: true,
    usage: stats,
  };
}, { requireAuth: true });

export const POST = withApi(async ({ req, session }) => {
  const body = await req.json();
  const { metric, quantity } = body;

  const check = await LimitEnforcer.checkLimit({
    organizationId: session.organizationId,
    metric,
    quantity,
  });

  if (!check.allowed) {
    return {
      success: false,
      error: 'Usage limit exceeded',
      check,
    };
  }

  // Track usage
  const { UsageTracker } = await import('@/lib/saas/usage-tracker');
  const record = await UsageTracker.trackUsage({
    organizationId: session.organizationId,
    metric,
    quantity,
  });

  return {
    success: true,
    record,
    check,
  };
}, { requireAuth: true });
