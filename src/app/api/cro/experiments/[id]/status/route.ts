// src/app/api/cro/experiments/[id]/status/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';
import { z } from 'zod';
import { ExperimentStatus } from '@prisma/client';

const updateStatusSchema = z.object({
  status: z.nativeEnum(ExperimentStatus),
});

export const PATCH = withApi(async ({ req, params, session }) => {
  const body = await req.json();
  const validated = updateStatusSchema.parse(body);

  const { prisma } = await import('@/lib/prisma');

  const experiment = await prisma.experiment.findUnique({
    where: { id: params.id },
  });

  if (!experiment) {
    return { success: false, error: 'Experiment not found' };
  }

  if (experiment.organizationId !== session.organizationId) {
    return { success: false, error: 'Unauthorized' };
  }

  const updateData: any = { status: validated.status };

  if (validated.status === 'RUNNING' && experiment.status !== 'RUNNING') {
    updateData.startedAt = new Date();
  }

  if (validated.status === 'COMPLETED' && experiment.status !== 'COMPLETED') {
    updateData.completedAt = new Date();
  }

  const updated = await prisma.experiment.update({
    where: { id: params.id },
    data: updateData,
  });

  return { success: true, experiment: updated };
}, { requireAuth: true, requireAdmin: true });
