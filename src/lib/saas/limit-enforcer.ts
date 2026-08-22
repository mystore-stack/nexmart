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
      include: { Subscription: true },
    });
    
    if (!organization) {
      return { allowed: true, reason: 'No organization' };
    }
    
    // Define plan limits based on plan tier
    const planLimits: Record<string, Record<string, number>> = {
      FREE: { products: 50, orders: 100, users: 5, storage: 1000, automations: 0 },
      PRO: { products: 500, orders: 1000, users: 25, storage: 10000, automations: 50 },
      BUSINESS: { products: -1, orders: -1, users: -1, storage: -1, automations: -1 }
    };
    
    const currentPlan = organization.plan || 'FREE';
    const limits = planLimits[currentPlan] || planLimits.FREE;
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
      include: { Subscription: true },
    });
    
    // Define plan limits based on plan tier
    const planLimits: Record<string, Record<string, number>> = {
      FREE: { products: 50, orders: 100, users: 5, storage: 1000, automations: 0 },
      PRO: { products: 500, orders: 1000, users: 25, storage: 10000, automations: 50 },
      BUSINESS: { products: -1, orders: -1, users: -1, storage: -1, automations: -1 }
    };
    
    const currentPlan = organization?.plan || 'FREE';
    const limits = planLimits[currentPlan] || planLimits.FREE;
    const usage = await UsageTracker.getOrganizationUsage(organizationId);
    
    const stats: Record<string, { used: number; limit: number; percentage: number }> = {};
    
    for (const [metric, limit] of Object.entries(limits)) {
      const used = usage[metric] || 0;
      const percentage = limit === -1 || limit === undefined ? 0 : (used / limit) * 100;
      
      stats[metric] = { used, limit, percentage };
    }
    
    return stats;
  }
}
