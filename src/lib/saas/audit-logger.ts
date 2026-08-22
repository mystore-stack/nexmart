// src/lib/saas/audit-logger.ts
import { prisma } from '@/lib/prisma';

export class AuditLogger {
  static async log(params: {
    organizationId: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: any;
  }) {
    const log = await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata,
        ipAddress: params.metadata?.ipAddress,
        userAgent: params.metadata?.userAgent,
      },
    });
    
    return log;
  }
  
  static async getAuditLogs(organizationId: string, options?: {
    action?: string;
    entityType?: string;
    limit?: number;
    offset?: number;
  }) {
    const logs = await prisma.auditLog.findMany({
      where: {
        organizationId,
        action: options?.action,
        entityType: options?.entityType,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
    
    return logs;
  }
}
