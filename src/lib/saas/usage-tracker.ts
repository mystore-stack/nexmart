// src/lib/saas/usage-tracker.ts
import { prisma } from '@/lib/prisma';

export class UsageTracker {
  /**
   * Track usage for a metric
   */
  static async trackUsage(params: {
    organizationId: string;
    metric: string;
    quantity: number;
  }) {
    // Get current period
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Upsert usage record
    const record = await prisma.usageRecord.upsert({
      where: {
        id: `${params.organizationId}_${params.metric}_${periodStart.toISOString()}`,
      },
      create: {
        organizationId: params.organizationId,
        metric: params.metric as any,
        quantity: params.quantity,
        periodStart,
        periodEnd,
      },
      update: {
        quantity: {
          increment: params.quantity,
        },
      },
    });
    
    return record;
  }
  
  /**
   * Get current usage for a metric
   */
  static async getCurrentUsage(organizationId: string, metric: string) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const record = await prisma.usageRecord.findFirst({
      where: {
        organizationId,
        metric: metric as any,
        periodStart,
      },
    });
    
    return record?.quantity || 0;
  }
  
  /**
   * Get all usage for an organization
   */
  static async getOrganizationUsage(organizationId: string) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const records = await prisma.usageRecord.findMany({
      where: {
        organizationId,
        periodStart,
      },
    });
    
    const usage: Record<string, number> = {};
    
    for (const record of records) {
      usage[record.metric] = record.quantity;
    }
    
    return usage;
  }
}
