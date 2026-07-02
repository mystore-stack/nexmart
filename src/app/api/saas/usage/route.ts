// src/app/api/saas/usage/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';
import { LimitEnforcer } from '@/lib/saas/limit-enforcer';

export const GET = withApi(async () => {
  // Return empty stats for now since session is not available in ApiContext
  return {
    success: true,
    usage: {},
  };
}, { requireAuth: true });

export const POST = withApi(async ({ req }) => {
  const body = await req.json();
  const { metric, quantity } = body;

  // Return mock response since session is not available in ApiContext
  return {
    success: true,
    allowed: true,
    check: { allowed: true },
  };
}, { requireAuth: true });
