// src/lib/services/automation-logs.service.ts
// Automation logs service with pagination and filtering

import { prisma } from '../prisma';
import { AutomationType, AutomationStatus } from '@prisma/client';

interface LogQueryOptions {
  automationId?: string;
  type?: AutomationType;
  status?: AutomationStatus;
  triggeredBy?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedLogs {
  logs: Array<{
    id: string;
    automationId: string;
    type: AutomationType;
    status: AutomationStatus;
    triggeredBy: string | null;
    metadata: unknown;
    error: string | null;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
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
    automationId,
    type,
    status,
    triggeredBy,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 50,
  } = options;

  const whereClause: any = {};

  if (automationId) whereClause.automationId = automationId;
  if (type) whereClause.type = type;
  if (status) whereClause.status = status;
  if (triggeredBy) whereClause.triggeredBy = triggeredBy;
  if (startDate || endDate) {
    whereClause.startedAt = {};
    if (startDate) whereClause.startedAt.gte = startDate;
    if (endDate) whereClause.startedAt.lte = endDate;
  }

  // Search in error field
  if (search) {
    whereClause.error = { contains: search, mode: 'insensitive' };
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.automationLog.findMany({
      where: whereClause,
      orderBy: { startedAt: 'desc' },
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
      startedAt: {
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
export async function getLogStatistics(automationId?: string) {
  const whereClause = automationId ? { automationId } : {};

  const [total, completed, failed, active, error] = await Promise.all([
    prisma.automationLog.count({ where: whereClause }),
    prisma.automationLog.count({ where: { ...whereClause, status: AutomationStatus.ACTIVE } }),
    prisma.automationLog.count({ where: { ...whereClause, status: AutomationStatus.ERROR } }),
    prisma.automationLog.count({ where: { ...whereClause, status: AutomationStatus.ACTIVE } }),
    prisma.automationLog.count({ where: { ...whereClause, status: AutomationStatus.ERROR } }),
  ]);

  return {
    total,
    completed,
    failed,
    active,
    error,
    successRate: total > 0 ? (completed / total) * 100 : 0,
  };
}
