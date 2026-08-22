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
    // Get current period (this month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Find existing record for this month
    const existingRecord = await prisma.usageRecord.findFirst({
      where: {
        organizationId: params.organizationId,
        metricType: params.metric,
        recordedAt: { gte: startOfMonth },
      },
    });
    
    if (existingRecord) {
      // Update existing record
      const record = await prisma.usageRecord.update({
        where: { id: existingRecord.id },
        data: {
          metricValue: { increment: params.quantity },
        },
      });
      return record;
    } else {
      // Create new record
      const record = await prisma.usageRecord.create({
        data: {
          organizationId: params.organizationId,
          metricType: params.metric,
          metricValue: params.quantity,
          recordedAt: now,
        },
      });
      return record;
    }
  }
  
  /**
   * Get current usage for a metric
   */
  static async getCurrentUsage(organizationId: string, metric: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const records = await prisma.usageRecord.findMany({
      where: {
        organizationId,
        metricType: metric,
        recordedAt: { gte: startOfMonth },
      },
    });
    
    const total = records.reduce((sum, record) => sum + record.metricValue, 0);
    return total;
  }
  
  /**
   * Get all usage for an organization
   */
  static async getOrganizationUsage(organizationId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const records = await prisma.usageRecord.findMany({
      where: {
        organizationId,
        recordedAt: { gte: startOfMonth },
      },
    });
    
    const usage: Record<string, number> = {};
    
    for (const record of records) {
      if (!usage[record.metricType]) {
        usage[record.metricType] = 0;
      }
      usage[record.metricType] += record.metricValue;
    }
    
    return usage;
  }
}
