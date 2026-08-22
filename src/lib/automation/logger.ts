// src/lib/automation/logger.ts
// Automation logging service

import { prisma } from '../prisma';
import { AutomationType, AutomationStatus } from '@prisma/client';

interface LogOptions {
  organizationId: string;
  type: AutomationType;
  entityType: string;
  entityId: string;
  action: string;
  status?: AutomationStatus;
  metadata?: Record<string, any>;
  error?: string;
}

/**
 * Log automation actions for audit trail and debugging
 */
export async function logAutomation(options: LogOptions) {
  try {
    await prisma.automationLog.create({
      data: {
        organizationId: options.organizationId,
        type: options.type,
        entityType: options.entityType,
        entityId: options.entityId,
        action: options.action,
        status: options.status || AutomationStatus.COMPLETED,
        metadata: options.metadata || {},
        error: options.error,
      },
    });
  } catch (error) {
    console.error('[Automation Logger] Failed to log automation:', error);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Log successful automation
 */
export async function logSuccess(
  organizationId: string,
  type: AutomationType,
  entityType: string,
  entityId: string,
  action: string,
  metadata?: Record<string, any>
) {
  await logAutomation({
    organizationId,
    type,
    entityType,
    entityId,
    action,
    status: AutomationStatus.COMPLETED,
    metadata,
  });
}

/**
 * Log failed automation
 */
export async function logFailure(
  organizationId: string,
  type: AutomationType,
  entityType: string,
  entityId: string,
  action: string,
  error: string,
  metadata?: Record<string, any>
) {
  await logAutomation({
    organizationId,
    type,
    entityType,
    entityId,
    action,
    status: AutomationStatus.FAILED,
    error,
    metadata,
  });
}

/**
 * Log pending automation
 */
export async function logPending(
  organizationId: string,
  type: AutomationType,
  entityType: string,
  entityId: string,
  action: string,
  metadata?: Record<string, any>
) {
  await logAutomation({
    organizationId,
    type,
    entityType,
    entityId,
    action,
    status: AutomationStatus.PENDING,
    metadata,
  });
}

/**
 * Get automation logs for an entity
 */
export async function getAutomationLogs(
  entityType: string,
  entityId: string,
  limit: number = 50
) {
  return prisma.automationLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: {
      executedAt: 'desc',
    },
    take: limit,
  });
}

/**
 * Get automation logs for an organization
 */
export async function getOrganizationAutomationLogs(
  organizationId: string,
  type?: AutomationType,
  limit: number = 100
) {
  return prisma.automationLog.findMany({
    where: {
      organizationId,
      ...(type && { type }),
    },
    orderBy: {
      executedAt: 'desc',
    },
    take: limit,
  });
}
