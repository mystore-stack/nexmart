// src/lib/cro/assignment-engine.ts
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { VariantType } from '@prisma/client';
import crypto from 'crypto';

/**
 * Hash-based deterministic assignment engine
 * Ensures consistent variant assignment for the same user
 */
export class AssignmentEngine {
  /**
   * Get variant assignment for a user in an experiment
   */
  static async getVariant(
    experimentId: string,
    userId: string | null,
    sessionId: string | null
  ): Promise<{ variant: any; isNewExposure: boolean }> {
    const cacheKey = this.getCacheKey(experimentId, userId, sessionId);
    
    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return { variant: JSON.parse(cached), isNewExposure: false };
    }

    // Get experiment and variants
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
      include: { variants: true },
    });

    if (!experiment || experiment.status !== 'RUNNING') {
      throw new Error('Experiment not found or not running');
    }

    // Calculate variant assignment
    const variant = this.assignVariant(experiment.variants, userId || sessionId);
    
    // Cache assignment
    await redis.setex(cacheKey, 3600, JSON.stringify(variant)); // 1 hour cache

    // Track exposure if user/session provided
    if (userId || sessionId) {
      await this.trackExposure(experimentId, variant.id, userId, sessionId);
    }

    return { variant, isNewExposure: true };
  }

  /**
   * Assign variant based on hash of user/session ID
   */
  private static assignVariant(variants: any[], identifier: string | null): any {
    if (!identifier) {
      // Random assignment for anonymous users
      const random = Math.random();
      let cumulative = 0;
      for (const variant of variants) {
        cumulative += variant.weight;
        if (random <= cumulative) {
          return variant;
        }
      }
      return variants[0];
    }

    // Deterministic assignment using hash
    const hash = crypto.createHash('md5').update(identifier + variants[0].experimentId).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16) / 0xffffffff;
    
    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.weight;
      if (hashValue <= cumulative) {
        return variant;
      }
    }
    
    return variants[0];
  }

  /**
   * Track exposure to experiment variant
   */
  private static async trackExposure(
    experimentId: string,
    variantId: string,
    userId: string | null,
    sessionId: string | null
  ): Promise<void> {
    try {
      await prisma.experimentExposure.create({
        data: {
          experimentId,
          variantId,
          userId,
          sessionId,
          url: typeof window !== 'undefined' ? window.location.href : null,
          referrer: typeof document !== 'undefined' ? document.referrer : null,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        },
      });

      // Update exposure counts
      await prisma.experiment.update({
        where: { id: experimentId },
        data: { totalExposures: { increment: 1 } },
      });

      await prisma.experimentVariant.update({
        where: { id: variantId },
        data: { exposures: { increment: 1 } },
      });
    } catch (error) {
      // Silently fail to avoid blocking user experience
      console.error('[Assignment Engine] Failed to track exposure:', error);
    }
  }

  /**
   * Get cache key for variant assignment
   */
  private static getCacheKey(
    experimentId: string,
    userId: string | null,
    sessionId: string | null
  ): string {
    const identifier = userId || sessionId || 'anonymous';
    return `cro:assignment:${experimentId}:${identifier}`;
  }

  /**
   * Clear assignment cache (for testing or manual override)
   */
  static async clearCache(
    experimentId: string,
    userId: string | null,
    sessionId: string | null
  ): Promise<void> {
    const cacheKey = this.getCacheKey(experimentId, userId, sessionId);
    await redis.del(cacheKey);
  }
}
