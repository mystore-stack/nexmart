// src/lib/saas/revenue-aggregation.ts
import { prisma } from '@/lib/prisma';
import { PlanTier } from '@prisma/client';

// Plan pricing configuration
const PLAN_PRICING: Record<PlanTier, { monthlyPrice: number; yearlyPrice: number; name: string }> = {
  FREE: { monthlyPrice: 0, yearlyPrice: 0, name: 'Free' },
  PRO: { monthlyPrice: 29, yearlyPrice: 290, name: 'Pro' },
  BUSINESS: { monthlyPrice: 99, yearlyPrice: 990, name: 'Business' }
};

export class RevenueAggregation {
  static async calculateMRR() {
    const subscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
    });
    
    let mrr = 0;
    
    for (const subscription of subscriptions) {
      const planConfig = PLAN_PRICING[subscription.plan];
      const monthlyPrice = planConfig.monthlyPrice;
      
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
    });
    
    const revenueByPlan: Record<string, number> = {};
    
    for (const subscription of subscriptions) {
      const planConfig = PLAN_PRICING[subscription.plan];
      const planName = planConfig.name;
      const monthlyPrice = planConfig.monthlyPrice;
      
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
    });
    
    let totalRevenue = 0;
    
    for (const subscription of subscriptions) {
      const planConfig = PLAN_PRICING[subscription.plan];
      const monthlyPrice = planConfig.monthlyPrice;
      
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
