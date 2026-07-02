// src/lib/saas/subscription-aggregation.ts
import { prisma } from '@/lib/prisma';

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
      const plan = await prisma.plan.findUnique({
        where: { id: item.plan },
      });
      
      if (plan) {
        result[plan.name] = item._count as number;
      }
    }
    
    return result;
  }
}
