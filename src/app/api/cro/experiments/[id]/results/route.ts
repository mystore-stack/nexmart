// src/app/api/cro/experiments/[id]/results/route.ts
import { NextRequest } from 'next/server';
import { withApi } from '@/lib/withApi';

export const GET = withApi(async ({ params }) => {
  const { prisma } = await import('@/lib/prisma');

  const experiment = await prisma.experiment.findUnique({
    where: { id: params.id },
    include: {
      variants: true,
    },
  });

  if (!experiment) {
    return { success: false, error: 'Experiment not found' };
  }

  // Calculate results
  const control = experiment.variants.find(v => v.type === 'CONTROL');
  const variant = experiment.variants.find(v => v.type === 'VARIANT_A');

  const controlRate = control?.exposures > 0 ? (control.conversions / control.exposures) * 100 : 0;
  const variantRate = variant?.exposures > 0 ? (variant.conversions / variant.exposures) * 100 : 0;
  const uplift = controlRate > 0 ? ((variantRate - controlRate) / controlRate) * 100 : 0;

  // Calculate statistical significance (simplified chi-squared test)
  const statisticalSignificance = calculateStatisticalSignificance(
    control?.conversions || 0,
    control?.exposures || 0,
    variant?.conversions || 0,
    variant?.exposures || 0
  );

  return {
    success: true,
    results: {
      totalExposures: experiment.totalExposures,
      totalConversions: experiment.totalConversions,
      control: {
        exposures: control?.exposures || 0,
        conversions: control?.conversions || 0,
        revenue: control?.revenue || 0,
        conversionRate: controlRate,
      },
      variant: {
        exposures: variant?.exposures || 0,
        conversions: variant?.conversions || 0,
        revenue: variant?.revenue || 0,
        conversionRate: variantRate,
      },
      uplift,
      statisticalSignificance,
      pValue: statisticalSignificance ? 0.05 : 0.5,
      confidence: statisticalSignificance ? 95 : 50,
    },
  };
}, { requireAuth: true, requireAdmin: true });

function calculateStatisticalSignificance(
  controlConversions: number,
  controlExposures: number,
  variantConversions: number,
  variantExposures: number
): boolean {
  // Simplified chi-squared test for statistical significance
  // In production, use proper statistical library
  if (controlExposures < 100 || variantExposures < 100) {
    return false; // Not enough data
  }

  const controlRate = controlConversions / controlExposures;
  const variantRate = variantConversions / variantExposures;
  const pooledRate = (controlConversions + variantConversions) / (controlExposures + variantExposures);
  
  const expectedControl = controlExposures * pooledRate;
  const expectedVariant = variantExposures * pooledRate;
  
  const chiSquared = 
    Math.pow(controlConversions - expectedControl, 2) / expectedControl +
    Math.pow(variantConversions - expectedVariant, 2) / expectedVariant;
  
  // Chi-squared critical value for 1 degree of freedom at 95% confidence is 3.84
  return chiSquared > 3.84;
}
