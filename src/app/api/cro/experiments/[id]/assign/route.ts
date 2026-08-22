// src/app/api/cro/experiments/[id]/assign/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';
import { AssignmentEngine } from '@/lib/cro/assignment-engine';

export const GET = withApi(async ({ req, params }) => {
  const session = await (await import('@/lib/auth-api')).getSession();
  const userId = session?.userId || null;
  const sessionId = req.headers.get('x-session-id') || null;

  const { variant, isNewExposure } = await AssignmentEngine.getVariant(
    params.id,
    userId,
    sessionId
  );

  return { 
    success: true, 
    variant,
    experimentId: params.id,
    isNewExposure,
  };
}, { requireAuth: false });
