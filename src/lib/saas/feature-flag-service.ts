// src/lib/saas/feature-flag-service.ts
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export class FeatureFlagService {
  /**
   * Check if a feature is enabled for an organization
   */
  static async isEnabled(
    featureKey: string,
    organizationId: string
  ): Promise<boolean> {
    // Try cache first
    const cacheKey = `feature_flag:${featureKey}:${organizationId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached !== null) {
      return cached === 'true';
    }
    
    // Fetch from database
    const flag = await prisma.featureFlag.findUnique({
      where: { key: featureKey },
    });
    
    if (!flag || !flag.enabled) {
      await redis.set(cacheKey, 'false', 60); // Cache for 60 seconds
      return false;
    }
    
    // Check plan eligibility
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true },
    });
    
    if (flag.targetPlans) {
      const targetPlans = flag.targetPlans as string[];
      const planName = organization?.plan?.name;
      
      if (!targetPlans.includes(planName)) {
        await redis.set(cacheKey, 'false', 60);
        return false;
      }
    }
    
    // Check organization-specific targeting
    if (flag.targetOrganizations) {
      const targetOrgs = flag.targetOrganizations as string[];
      
      if (!targetOrgs.includes(organizationId)) {
        await redis.set(cacheKey, 'false', 60);
        return false;
      }
    }
    
    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const hash = this.hashString(`${featureKey}:${organizationId}`);
      const percentage = (hash % 100) + 1;
      
      if (percentage > flag.rolloutPercentage) {
        await redis.set(cacheKey, 'false', 60);
        return false;
      }
    }
    
    await redis.set(cacheKey, 'true', 60);
    return true;
  }
  
  /**
   * Get all feature flags for an organization
   */
  static async getOrganizationFlags(organizationId: string) {
    const flags = await prisma.featureFlag.findMany({
      where: { enabled: true },
    });
    
    const result = {};
    
    for (const flag of flags) {
      result[flag.key] = await this.isEnabled(flag.key, organizationId);
    }
    
    return result;
  }
  
  /**
   * Invalidate cache for a feature flag
   */
  static async invalidateCache(featureKey: string, organizationId?: string) {
    if (organizationId) {
      const cacheKey = `feature_flag:${featureKey}:${organizationId}`;
      await redis.del(cacheKey);
    } else {
      // Invalidate all caches for this feature
      const pattern = `feature_flag:${featureKey}:*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }
  
  /**
   * Hash string to number for rollout percentage
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
