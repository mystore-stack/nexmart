// src/lib/jobs/user-profile-update.job.ts
import { CronJob } from 'cron';
import { prisma } from '@/lib/prisma';
import { UserProfileService } from '@/lib/personalization/user-profile.service';

export const userProfileUpdateJob = new CronJob(
  '0 */15 * * * *', // Every 15 minutes
  async () => {
    await updateUserProfiles();
  },
  null,
  true,
  'UTC'
);

export const personalizationCacheJob = new CronJob(
  '0 */10 * * * *', // Every 10 minutes
  async () => {
    await refreshPersonalizationCache();
  },
  null,
  true,
  'UTC'
);

async function updateUserProfiles() {
  console.log('[User Profile Update] Starting profile updates');

  try {
    // Get users with recent activity
    const recentUsers = await prisma.userProfile.findMany({
      where: {
        lastActivityAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      take: 1000,
    });

    for (const profile of recentUsers) {
      await UserProfileService.recalculateScores(profile.id);
    }

    console.log(`[User Profile Update] Updated ${recentUsers.length} profiles`);
  } catch (error) {
    console.error('[User Profile Update] Failed:', error);
  }
}

async function refreshPersonalizationCache() {
  console.log('[Personalization Cache] Starting cache refresh');

  try {
    // Clear expired personalizations
    const now = new Date();
    await prisma.personalization.deleteMany({
      where: {
        expiresAt: {
          lte: now,
        },
      },
    });

    console.log('[Personalization Cache] Cleared expired personalizations');
  } catch (error) {
    console.error('[Personalization Cache] Failed:', error);
  }
}
