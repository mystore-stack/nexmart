// src/app/api/cro/experiments/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';
import { z } from 'zod';

const ExperimentType = {
  A_B: 'A_B',
  MULTIVARIATE: 'MULTIVARIATE',
} as const;

const ExperimentStatus = {
  DRAFT: 'DRAFT',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
} as const;

const ExperimentGoal = {
  CONVERSION: 'CONVERSION',
  REVENUE: 'REVENUE',
  ENGAGEMENT: 'ENGAGEMENT',
} as const;

const createExperimentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(Object.values(ExperimentType) as [string, ...string[]]),
  trafficSplit: z.number().min(0).max(1),
  primaryGoal: z.enum(Object.values(ExperimentGoal) as [string, ...string[]]),
  secondaryGoals: z.array(z.enum(Object.values(ExperimentGoal) as [string, ...string[]])).optional(),
  targetAudience: z.record(z.any()).optional(),
  excludeAudience: z.record(z.any()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const POST = withApi(async ({ req, session }) => {
  const body = await req.json();
  const validated = createExperimentSchema.parse(body);

  const { prisma } = await import('@/lib/prisma');

  const experiment = await prisma.experiment.create({
    data: {
      organizationId: session.organizationId,
      name: validated.name,
      description: validated.description,
      type: validated.type,
      trafficSplit: validated.trafficSplit,
      primaryGoal: validated.primaryGoal,
      secondaryGoals: validated.secondaryGoals || [],
      targetAudience: validated.targetAudience,
      excludeAudience: validated.excludeAudience,
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      endDate: validated.endDate ? new Date(validated.endDate) : null,
    },
    include: {
      variants: true,
    },
  });

  // Create default variants (Control and Variant A)
  await prisma.experimentVariant.createMany({
    data: [
      {
        experimentId: experiment.id,
        name: 'Control',
        type: 'CONTROL',
        description: 'Original version',
        config: {},
        weight: 1 - validated.trafficSplit,
      },
      {
        experimentId: experiment.id,
        name: 'Variant A',
        type: 'VARIANT_A',
        description: 'Test version',
        config: {},
        weight: validated.trafficSplit,
      },
    ],
  });

  return { success: true, experiment };
}, { requireAuth: true, requireAdmin: true });

export const GET = withApi(async ({ req, session }) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as (typeof ExperimentStatus)[keyof typeof ExperimentStatus] | null;
  const type = searchParams.get('type') as (typeof ExperimentType)[keyof typeof ExperimentType] | null;
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const { prisma } = await import('@/lib/prisma');

  const where: any = { organizationId: session.organizationId };
  if (status) where.status = status;
  if (type) where.type = type;

  const [experiments, total] = await Promise.all([
    prisma.experiment.findMany({
      where,
      include: {
        variants: true,
        _count: {
          select: { exposures: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.experiment.count({ where }),
  ]);

  return { success: true, experiments, total };
}, { requireAuth: true, requireAdmin: true });
