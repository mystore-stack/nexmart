// src/lib/services/automation-logs.service.ts
// Automation logs service with pagination and filtering

import { prisma } from '../prisma';
import { AutomationType, AutomationStatus } from '@prisma/client';

interface LogQueryOptions {
  organizationId?: string;
  type?: AutomationType;
  status?: AutomationStatus;
  entityType?: string;
  entityId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedLogs {
  logs: Array<{
    id: string;
    organizationId: string;
    type: AutomationType;
    entityType: string;
    entityId: string;
    action: string;
    status: AutomationStatus;
    metadata: unknown;
    error: string | null;
    executedAt: Date;
    userId: string | null;
    duration: number | null;
    retryCount: number;
    jobId: string | null;
    queueName: string | null;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Get automation logs with pagination and filtering
 */
export async function getAutomationLogs(options: LogQueryOptions = {}): Promise<PaginatedLogs> {
  const {
    organizationId,
    type,
    status,
    entityType,
    entityId,
    userId,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 50,
  } = options;

  const whereClause: any = {};

  if (organizationId) whereClause.organizationId = organizationId;
  if (type) whereClause.type = type;
  if (status) whereClause.status = status;
  if (entityType) whereClause.entityType = entityType;
  if (entityId) whereClause.entityId = entityId;
  if (userId) whereClause.userId = userId;
  if (startDate || endDate) {
    whereClause.executedAt = {};
    if (startDate) whereClause.executedAt.gte = startDate;
    if (endDate) whereClause.executedAt.lte = endDate;
  }

  // Search in action and error fields
  if (search) {
    whereClause.OR = [
      { action: { contains: search, mode: 'insensitive' } },
      { error: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.automationLog.findMany({
      where: whereClause,
      orderBy: { executedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.automationLog.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

/**
 * Get automation log by ID
 */
export async function getAutomationLogById(id: string) {
  return prisma.automationLog.findUnique({
    where: { id },
  });
}

/**
 * Delete old logs (data retention)
 */
export async function deleteOldLogs(daysToKeep: number = 90) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

  const result = await prisma.automationLog.deleteMany({
    where: {
      executedAt: {
        lt: cutoffDate,
      },
    },
  });

  return {
    deletedCount: result.count,
    cutoffDate,
  };
}

/**
 * Get log statistics
 */
export async function getLogStatistics(organizationId?: string) {
  const whereClause = organizationId ? { organizationId } : {};

  const [total, completed, failed, pending, running] = await Promise.all([
    prisma.automationLog.count({ where: whereClause }),
    prisma.automationLog.count({ where: { ...whereClause, status: AutomationStatus.COMPLETED } }),
    prisma.automationLog.count({ where: { ...whereClause, status: AutomationStatus.FAILED } }),
    prisma.automationLog.count({ where: { ...whereClause, status: AutomationStatus.PENDING } }),
    prisma.automationLog.count({ where: { ...whereClause, status: AutomationStatus.RUNNING } }),
  ]);

  return {
    total,
    completed,
    failed,
    pending,
    running,
    successRate: total > 0 ? (completed / total) * 100 : 0,
  };
}
