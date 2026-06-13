// src/lib/jobs/churn-prediction.job.ts
import { CronJob } from 'cron';
import { ChurnPredictor } from '@/lib/retention/churn-predictor';

export const churnPredictionJob = new CronJob(
  '0 0 * * *', // Daily at midnight
  async () => {
    await runChurnPredictions();
  },
  null,
  true,
  'UTC'
);

async function runChurnPredictions() {
  console.log('[Churn Prediction] Starting churn predictions');

  try {
    const { prisma } = await import('@/lib/prisma');
    const organizations = await prisma.organization.findMany();

    for (const organization of organizations) {
      try {
        await ChurnPredictor.predictForOrganization(organization.id);
        console.log(`[Churn Prediction] Completed predictions for organization: ${organization.id}`);
      } catch (error) {
        console.error(`[Churn Prediction] Failed for organization ${organization.id}:`, error);
      }
    }

    console.log('[Churn Prediction] Completed all churn predictions');
  } catch (error) {
    console.error('[Churn Prediction] Failed:', error);
  }
}
