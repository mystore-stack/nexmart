// src/lib/automation/stock-alerts.ts — Low Stock Alert System
import { prisma } from '@/lib/prisma';
import { sendStockAlertEmail } from '@/lib/email';

interface StockAlertConfig {
  threshold?: number;
  checkInterval?: number; // hours
  adminEmail?: string;
}

export async function checkLowStock(config: StockAlertConfig = {}) {
  const {
    threshold = 5,
    checkInterval = 24,
    adminEmail = process.env.ADMIN_EMAIL || 'admin@nexmart.ma',
  } = config;

  // Get all organizations
  const organizations = await prisma.organization.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, name: true },
  });

  for (const organization of organizations) {
    await checkOrganizationLowStock(organization.id, organization.name, threshold, checkInterval, adminEmail);
  }
}

async function checkOrganizationLowStock(
  organizationId: string,
  organizationName: string,
  threshold: number,
  checkInterval: number,
  adminEmail: string
) {
  // Find products with stock below threshold
  const lowStockProducts = await prisma.product.findMany({
    where: {
      organizationId,
      published: true,
      stock: { lte: threshold },
    },
    select: {
      id: true,
      name: true,
      stock: true,
      lowStockAt: true,
    },
  });

  for (const product of lowStockProducts) {
    // Check if alert was sent in the last 24 hours
    const recentAlert = await prisma.stockAlertLog.findFirst({
      where: {
        productId: product.id,
        alertSent: true,
        alertSentAt: {
          gte: new Date(Date.now() - checkInterval * 60 * 60 * 1000),
        },
      },
    });

    if (recentAlert) {
      continue; // Skip if alert was sent recently
    }

    // Create stock alert log
    const alertLog = await prisma.stockAlertLog.create({
      data: {
        organizationId,
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        threshold: product.lowStockAt,
        alertSent: false,
      },
    });

    // Send alert email
    try {
      await sendStockAlertEmail(
        adminEmail,
        product.name,
        product.stock,
        product.lowStockAt,
        organizationId
      );

      // Update alert log
      await prisma.stockAlertLog.update({
        where: { id: alertLog.id },
        data: {
          alertSent: true,
          alertSentAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`[Stock Alert Error] Product ${product.id}:`, error);
    }
  }
}

export async function acknowledgeStockAlert(alertId: string, userId: string) {
  return prisma.stockAlertLog.update({
    where: { id: alertId },
    data: {
      acknowledged: true,
      acknowledgedAt: new Date(),
      acknowledgedBy: userId,
    },
  });
}

export async function resolveStockAlert(alertId: string) {
  return prisma.stockAlertLog.update({
    where: { id: alertId },
    data: {
      resolved: true,
      resolvedAt: new Date(),
    },
  });
}

export async function getStockAlerts(organizationId?: string, includeResolved = false) {
  const where = organizationId ? { organizationId } : {};
  if (!includeResolved) {
    Object.assign(where, { resolved: false });
  }

  return prisma.stockAlertLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: {
          name: true,
          sku: true,
          images: true,
        },
      },
      organization: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function getStockAlertStats(organizationId?: string) {
  const where = organizationId ? { organizationId } : {};

  const [total, pending, acknowledged, resolved] = await Promise.all([
    prisma.stockAlertLog.count({ where }),
    prisma.stockAlertLog.count({ where: { ...where, resolved: false, acknowledged: false } }),
    prisma.stockAlertLog.count({ where: { ...where, acknowledged: true, resolved: false } }),
    prisma.stockAlertLog.count({ where: { ...where, resolved: true } }),
  ]);

  return {
    total,
    pending,
    acknowledged,
    resolved,
  };
}
