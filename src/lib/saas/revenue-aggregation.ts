// src/lib/saas/revenue-aggregation.ts
import { prisma } from '@/lib/prisma';

export class RevenueAggregation {
  static async calculateMRR() {
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });
    
    let mrr = 0;
    
    for (const subscription of subscriptions) {
      const plan = subscription.plan;
      if (!plan) continue;
      
      const limits = plan.limits as any;
      const monthlyPrice = subscription.billingCycle === 'YEARLY'
        ? plan.yearlyPrice / 12
        : plan.monthlyPrice;
      
      mrr += monthlyPrice;
    }
    
    return mrr;
  }
  
  static async calculateARR() {
    const mrr = await this.calculateMRR();
    return mrr * 12;
  }
  
  static async calculateRevenueByPlan() {
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });
    
    const revenueByPlan: Record<string, number> = {};
    
    for (const subscription of subscriptions) {
      const plan = subscription.plan;
      if (!plan) continue;
      
      const planName = plan.name;
      const monthlyPrice = subscription.billingCycle === 'YEARLY'
        ? plan.yearlyPrice / 12
        : plan.monthlyPrice;
      
      if (!revenueByPlan[planName]) {
        revenueByPlan[planName] = 0;
      }
      
      revenueByPlan[planName] += monthlyPrice;
    }
    
    return revenueByPlan;
  }
  
  static async calculateTotalRevenue() {
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });
    
    let totalRevenue = 0;
    
    for (const subscription of subscriptions) {
      const plan = subscription.plan;
      if (!plan) continue;
      
      const monthlyPrice = subscription.billingCycle === 'YEARLY'
        ? plan.yearlyPrice / 12
        : plan.monthlyPrice;
      
      totalRevenue += monthlyPrice;
    }
    
    return totalRevenue;
  }
  
  static async calculateRevenueGrowth() {
    // Calculate revenue growth month over month
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // This is a simplified calculation
    // In production, you'd compare actual revenue from invoices
    const currentMRR = await this.calculateMRR();
    const lastMonthMRR = currentMRR * 0.95; // Simulated 5% growth
    
    const growth = ((currentMRR - lastMonthMRR) / lastMonthMRR) * 100;
    
    return growth;
  }
}
