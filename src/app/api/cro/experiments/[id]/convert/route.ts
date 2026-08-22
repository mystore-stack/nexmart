// src/app/api/cro/experiments/[id]/convert/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';
import { z } from 'zod';
import { ExperimentGoal } from '@prisma/client';

const trackConversionSchema = z.object({
  variantId: z.string().uuid(),
  goal: z.nativeEnum(ExperimentGoal),
  value: z.number().optional(),
});

export const POST = withApi(async ({ req, params, session }) => {
  const body = await req.json();
  const validated = trackConversionSchema.parse(body);

  const { prisma } = await import('@/lib/prisma');

  // Get existing exposure
  const exposure = await prisma.experimentExposure.findFirst({
    where: {
      experimentId: params.id,
      userId: session?.userId || null,
      sessionId: req.headers.get('x-session-id') || null,
      variantId: validated.variantId,
      convertedAt: null,
    },
  });

  if (!exposure) {
    return { success: false, error: 'No exposure found or already converted' };
  }

  // Update exposure with conversion
  await prisma.experimentExposure.update({
    where: { id: exposure.id },
    data: {
      convertedAt: new Date(),
    },
  });

  // Update experiment and variant metrics
  await prisma.$transaction([
    prisma.experiment.update({
      where: { id: params.id },
      data: {
        totalConversions: { increment: 1 },
        variantRevenue: { increment: validated.value || 0 },
      },
    }),
    prisma.experimentVariant.update({
      where: { id: validated.variantId },
      data: {
        conversions: { increment: 1 },
        revenue: { increment: validated.value || 0 },
      },
    }),
  ]);

  // Track conversion event
  const { eventTracker } = await import('@/lib/event-tracking/client');
  eventTracker.track('EXPERIMENT_CONVERSION', {
    experimentId: params.id,
    variantId: validated.variantId,
    goal: validated.goal,
    value: validated.value,
  });

  return { success: true };
}, { requireAuth: false });
