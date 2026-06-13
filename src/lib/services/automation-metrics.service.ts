// src/lib/services/automation-metrics.service.ts
// Automation metrics service for control center

import { prisma } from '../prisma';
import { AutomationType, AutomationStatus } from '@prisma/client';

interface MetricsOptions {
  organizationId?: string;
  startDate?: Date;
  endDate?: Date;
}

interface AutomationMetrics {
  totalExecutions: number;
  successRate: number;
  failureRate: number;
  averageDuration: number;
  executionsByType: Record<string, number>;
  executionsByStatus: Record<string, number>;
  executionsOverTime: Array<{ date: string; count: number }>;
  topErrors: Array<{ error: string; count: number }>;
  queueMetrics: Record<string, { waiting: number; active: number; failed: number }>;
}

/**
 * Get comprehensive automation metrics
 */
export async function getAutomationMetrics(options: MetricsOptions = {}): Promise<AutomationMetrics> {
  const { organizationId, startDate, endDate } = options;

  const whereClause: any = {};
  if (organizationId) whereClause.organizationId = organizationId;
  if (startDate) whereClause.executedAt = { ...whereClause.executedAt, gte: startDate };
  if (endDate) whereClause.executedAt = { ...whereClause.executedAt, lte: endDate };

  // Get total executions
  const totalExecutions = await prisma.automationLog.count({ where: whereClause });

  // Get executions by status
  const completedCount = await prisma.automationLog.count({
    where: { ...whereClause, status: AutomationStatus.COMPLETED },
  });
  const failedCount = await prisma.automationLog.count({
    where: { ...whereClause, status: AutomationStatus.FAILED },
  });

  const successRate = totalExecutions > 0 ? (completedCount / totalExecutions) * 100 : 0;
  const failureRate = totalExecutions > 0 ? (failedCount / totalExecutions) * 100 : 0;

  // Get average duration
  const durationResult = await prisma.automationLog.aggregate({
    where: { ...whereClause, duration: { not: null } },
    _avg: { duration: true },
  });
  const averageDuration = durationResult._avg.duration || 0;

  // Get executions by type
  const executionsByType = await prisma.automationLog.groupBy({
    by: ['type'],
    where: whereClause,
    _count: true,
  });
  const typeCounts = executionsByType.reduce((acc, item) => {
    acc[item.type] = item._count;
    return acc;
  }, {} as Record<string, number>);

  // Get executions by status
  const executionsByStatus = await prisma.automationLog.groupBy({
    by: ['status'],
    where: whereClause,
    _count: true,
  });
  const statusCounts = executionsByStatus.reduce((acc, item) => {
    acc[item.status] = item._count;
    return acc;
  }, {} as Record<string, number>);

  // Get executions over time (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const executionsOverTime = await prisma.automationLog.groupBy({
    by: ['executedAt'],
    where: {
      ...whereClause,
      executedAt: { gte: sevenDaysAgo },
    },
    _count: true,
  });
  
  // Group by date
  const timeMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    timeMap.set(dateStr, 0);
  }
  
  executionsOverTime.forEach(item => {
    const dateStr = item.executedAt.toISOString().split('T')[0];
    timeMap.set(dateStr, (timeMap.get(dateStr) || 0) + item._count);
  });
  
  const timeSeries = Array.from(timeMap.entries()).map(([date, count]) => ({ date, count }));

  // Get top errors
  const errorLogs = await prisma.automationLog.findMany({
    where: { ...whereClause, status: AutomationStatus.FAILED, error: { not: null } },
    select: { error: true },
    take: 100,
  });
  
  const errorMap = new Map<string, number>();
  errorLogs.forEach(log => {
    if (log.error) {
      const errorKey = log.error.substring(0, 100); // Truncate long errors
      errorMap.set(errorKey, (errorMap.get(errorKey) || 0) + 1);
    }
  });
  
  const topErrors = Array.from(errorMap.entries())
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Get queue metrics from BullMQ
  const queueMetrics = await getQueueMetrics();

  return {
    totalExecutions,
    successRate,
    failureRate,
    averageDuration,
    executionsByType: typeCounts,
    executionsByStatus: statusCounts,
    executionsOverTime: timeSeries,
    topErrors,
    queueMetrics,
  };
}

/**
 * Get queue metrics from BullMQ
 */
async function getQueueMetrics(): Promise<Record<string, { waiting: number; active: number; failed: number }>> {
  try {
    const { getQueueHealth } = await import('../queue');
    const queueHealth = await getQueueHealth();
    
    return queueHealth.reduce((acc, queue) => {
      acc[queue.name] = {
        waiting: queue.waiting,
        active: queue.active,
        failed: queue.failed,
      };
      return acc;
    }, {} as Record<string, { waiting: number; active: number; failed: number }>);
  } catch (error) {
    console.error('[Automation Metrics] Failed to get queue metrics:', error);
    return {};
  }
}

/**
 * Get real-time automation status
 */
export async function getRealTimeStatus(organizationId?: string) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const whereClause: any = {
    executedAt: { gte: oneHourAgo },
  };
  if (organizationId) whereClause.organizationId = organizationId;

  const [recentExecutions, activeErrors] = await Promise.all([
    prisma.automationLog.count({ where: whereClause }),
    prisma.automationLog.count({
      where: { ...whereClause, status: AutomationStatus.FAILED },
    }),
  ]);

  return {
    recentExecutions,
    activeErrors,
    timestamp: now.toISOString(),
  };
}
