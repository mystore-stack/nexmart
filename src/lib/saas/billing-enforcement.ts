// src/lib/saas/billing-enforcement.ts
import { prisma } from '@/lib/prisma';

export class BillingEnforcement {
  /**
   * Check if organization can access a feature
   */
  static async canAccessFeature(organizationId: string, featureKey: string) {
    const { FeatureFlagService } = await import('@/lib/saas/feature-flag-service');
    
    return await FeatureFlagService.isEnabled(featureKey, organizationId);
  }
  
  /**
   * Check if organization has active subscription
   */
  static async hasActiveSubscription(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });
    
    if (!organization) return false;
    
    if (organization.status !== 'ACTIVE') return false;
    
    if (organization.subscription?.status !== 'ACTIVE') return false;
    
    return true;
  }
  
  /**
   * Get upgrade prompt if needed
   */
  static async getUpgradePrompt(organizationId: string, featureKey: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true },
    });
    
    const flag = await prisma.featureFlag.findUnique({
      where: { key: featureKey },
    });
    
    if (!flag || !flag.targetPlans) {
      return null;
    }
    
    const currentPlan = organization.plan?.name;
    const targetPlans = flag.targetPlans as string[];
    
    // Find the minimum plan that has this feature
    const planOrder = ['STARTER', 'GROWTH', 'PRO', 'ENTERPRISE'];
    const currentPlanIndex = planOrder.indexOf(currentPlan);
    
    for (const targetPlan of targetPlans) {
      const targetPlanIndex = planOrder.indexOf(targetPlan);
      
      if (targetPlanIndex > currentPlanIndex) {
        return {
          requiredPlan: targetPlan,
          currentPlan,
          feature: flag.name,
        };
      }
    }
    
    return null;
  }
}
