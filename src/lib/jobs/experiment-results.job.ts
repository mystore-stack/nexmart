// src/lib/jobs/experiment-results.job.ts
import { CronJob } from 'cron';
import { prisma } from '@/lib/prisma';

export const experimentResultsJob = new CronJob(
  '0 */30 * * * *', // Every 30 minutes
  async () => {
    await calculateExperimentResults();
  },
  null,
  true,
  'UTC'
);

export const experimentAutoStopJob = new CronJob(
  '0 * * * * *', // Every hour
  async () => {
    await checkExperimentEndDates();
  },
  null,
  true,
  'UTC'
);

async function calculateExperimentResults() {
  const runningExperiments = await prisma.experiment.findMany({
    where: { status: 'RUNNING' },
    include: { variants: true },
  });

  for (const experiment of runningExperiments) {
    await updateExperimentResults(experiment.id);
  }
}

async function updateExperimentResults(experimentId: string) {
  const experiment = await prisma.experiment.findUnique({
    where: { id: experimentId },
    include: { variants: true },
  });

  if (!experiment) return;

  const control = experiment.variants.find((v: any) => v.type === 'CONTROL');
  const variant = experiment.variants.find((v: any) => v.type === 'VARIANT_A');

  const controlRate = control?.exposures > 0 ? (control.conversions / control.exposures) * 100 : 0;
  const variantRate = variant?.exposures > 0 ? (variant.conversions / variant.exposures) * 100 : 0;
  const uplift = controlRate > 0 ? ((variantRate - controlRate) / controlRate) * 100 : 0;

  const statisticalSignificance = calculateStatisticalSignificance(
    control?.conversions || 0,
    control?.exposures || 0,
    variant?.conversions || 0,
    variant?.exposures || 0
  );

  await prisma.experiment.update({
    where: { id: experimentId },
    data: {
      totalExposures: (control?.exposures || 0) + (variant?.exposures || 0),
      totalConversions: (control?.conversions || 0) + (variant?.conversions || 0),
      controlConversions: control?.conversions || 0,
      variantConversions: variant?.conversions || 0,
      controlRevenue: control?.revenue || 0,
      variantRevenue: variant?.revenue || 0,
      conversionRate: variantRate,
      uplift,
      statisticalSignificance,
      pValue: statisticalSignificance ? 0.05 : 0.5,
    },
  });
}

async function checkExperimentEndDates() {
  const now = new Date();

  await prisma.experiment.updateMany({
    where: {
      status: 'RUNNING',
      endDate: {
        lte: now,
      },
    },
    data: {
      status: 'COMPLETED',
      completedAt: now,
    },
  });
}

function calculateStatisticalSignificance(
  controlConversions: number,
  controlExposures: number,
  variantConversions: number,
  variantExposures: number
): boolean {
  if (controlExposures < 100 || variantExposures < 100) {
    return false;
  }

  const controlRate = controlConversions / controlExposures;
  const variantRate = variantConversions / variantExposures;
  const pooledRate = (controlConversions + variantConversions) / (controlExposures + variantExposures);

  const expectedControl = controlExposures * pooledRate;
  const expectedVariant = variantExposures * pooledRate;

  const chiSquared =
    Math.pow(controlConversions - expectedControl, 2) / expectedControl +
    Math.pow(variantConversions - expectedVariant, 2) / expectedVariant;

  return chiSquared > 3.84;
}
