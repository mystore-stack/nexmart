import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import type { CmsAuditAction } from "@prisma/client";

import type { Prisma } from "@prisma/client";

export async function logCmsActivity(params: {
  userId?: string;
  organizationId?: string;
  entityType: string;
  entityId?: string;
  action: CmsAuditAction;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  const organizationId = params.organizationId ?? (await getDefaultOrganizationId());

  return prisma.cmsActivityLog.create({
    data: {
      organizationId,
      userId: params.userId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      ipAddress: params.ipAddress,
    },
  });
}

export async function getCmsActivityLogs(params: {
  organizationId?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}) {
  const organizationId = params.organizationId ?? (await getDefaultOrganizationId());

  const [logs, total] = await Promise.all([
    prisma.cmsActivityLog.findMany({
      where: {
        organizationId,
        ...(params.entityType ? { entityType: params.entityType } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: params.limit ?? 50,
      skip: params.offset ?? 0,
    }),
    prisma.cmsActivityLog.count({
      where: {
        organizationId,
        ...(params.entityType ? { entityType: params.entityType } : {}),
      },
    }),
  ]);

  return { logs, total };
}
