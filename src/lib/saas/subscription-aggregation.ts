// src/lib/saas/subscription-aggregation.ts
import { prisma } from '@/lib/prisma';
import { PlanTier } from '@prisma/client';

export class SubscriptionAggregation {
  static async calculateChurnRate() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const subscriptionsAtStart = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        createdAt: { lte: thirtyDaysAgo },
      },
    });
    
    const cancelledSubscriptions = await prisma.subscription.count({
      where: {
        status: 'CANCELED',
        updatedAt: { gte: thirtyDaysAgo },
      },
    });
    
    if (subscriptionsAtStart === 0) return 0;
    
    return (cancelledSubscriptions / subscriptionsAtStart) * 100;
  }
  
  static async getSubscriptionsByPlan() {
    const subscriptions = await prisma.subscription.groupBy({
      by: ['plan'],
      _count: true,
    });
    
    const result: Record<string, number> = {};
    
    for (const item of subscriptions) {
      const planName = item.plan as string;
      result[planName] = item._count as number;
    }
    
    return result;
  }
}
