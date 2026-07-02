// src/app/api/retention/churn-risk/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';
import { ChurnPredictor } from '@/lib/retention/churn-predictor';

export const GET = withApi(async ({ req, session }) => {
  if (!session) throw new Error("Session required");
  const { searchParams } = new URL(req.url);
  const riskLevel = searchParams.get('riskLevel');
  const limit = parseInt(searchParams.get('limit') || '50');

  const { prisma } = await import('@/lib/prisma');

  const where: any = {
    organizationId: session!.organizationId,
    validUntil: { gte: new Date() },
  };

  if (riskLevel) {
    where.riskLevel = riskLevel;
  }

  const predictions = await prisma.churnPrediction.findMany({
    where,
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { riskScore: 'desc' },
    take: limit,
  });

  // Get counts by risk level
  const byRiskLevel = await prisma.churnPrediction.groupBy({
    by: ['riskLevel'],
    where: {
      organizationId: session!.organizationId,
      validUntil: { gte: new Date() },
    },
    _count: true,
  });

  const riskLevelCounts = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  for (const item of byRiskLevel) {
    riskLevelCounts[item.riskLevel] = item._count;
  }

  const totalAtRisk = riskLevelCounts.HIGH + riskLevelCounts.CRITICAL;

  return {
    success: true,
    data: {
      totalAtRisk,
      byRiskLevel: riskLevelCounts,
      users: predictions.map((p) => ({
        userId: p.user.id,
        email: p.user.email,
        name: p.user.name,
        riskScore: p.riskScore,
        riskLevel: p.riskLevel,
        factors: p.factors,
        predictedAt: p.predictedAt,
      })),
    },
  };
}, { requireAuth: true, requireAdmin: true });
