// src/lib/saas/limit-enforcer.ts
import { prisma } from '@/lib/prisma';
import { UsageTracker } from './usage-tracker';

export class LimitEnforcer {
  /**
   * Check if usage is within limits
   */
  static async checkLimit(params: {
    organizationId: string;
    metric: string;
    quantity: number;
  }) {
    // Get organization with plan
    const organization = await prisma.organization.findUnique({
      where: { id: params.organizationId },
      include: { plan: true },
    });
    
    if (!organization?.plan) {
      return { allowed: true, reason: 'No plan' };
    }
    
    // Get plan limits
    const limits = organization.plan.limits as any;
    const limit = limits[params.metric];
    
    // Unlimited (-1)
    if (limit === -1 || limit === undefined) {
      return { allowed: true, reason: 'Unlimited' };
    }
    
    // Get current usage
    const currentUsage = await UsageTracker.getCurrentUsage(
      params.organizationId,
      params.metric
    );
    
    const newUsage = currentUsage + params.quantity;
    
    // Check hard limit
    if (newUsage > limit) {
      return {
        allowed: false,
        reason: 'Limit exceeded',
        current: currentUsage,
        limit,
      };
    }
    
    // Check soft limit (80% threshold)
    const softLimit = limit * 0.8;
    if (newUsage > softLimit) {
      return {
        allowed: true,
        warning: true,
        reason: 'Approaching limit',
        current: currentUsage,
        limit,
        percentage: (newUsage / limit) * 100,
      };
    }
    
    return { allowed: true, current: currentUsage, limit };
  }
  
  /**
   * Get usage statistics
   */
  static async getUsageStats(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true },
    });
    
    const limits = organization?.plan?.limits as any || {};
    const usage = await UsageTracker.getOrganizationUsage(organizationId);
    
    const stats: Record<string, { used: number; limit: number; percentage: number }> = {};
    
    for (const [metric, limit] of Object.entries(limits)) {
      const used = usage[metric] || 0;
      const limitNum = typeof limit === 'number' ? limit : 0;
      const percentage = limitNum === -1 || limitNum === undefined ? 0 : (used / limitNum) * 100;
      
      stats[metric] = { used, limit: limitNum, percentage };
    }
    
    return stats;
  }
}
