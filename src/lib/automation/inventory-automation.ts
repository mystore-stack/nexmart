// src/lib/automation/inventory-automation.ts
// Inventory automation: stock decrease/restore, low stock detection, auto out-of-stock

import { prisma } from '../prisma';
import { notifyLowStock } from '../notifications/telegram';
import { addInventorySyncJob } from '../queue';
import { logSuccess, logFailure, logPending } from './logger';
import { AutomationType } from '@prisma/client';

/**
 * Architecture:
 * - Inventory automation triggers on order creation, cancellation, and refund
 * - Uses queue system for async processing
 * - Logs all inventory changes
 * - Sends low stock alerts via Telegram
 * - Auto-marks products as out of stock when inventory reaches zero
 */

/**
 * Decrease stock after successful order
 * - Update product stock levels
 * - Handle variants if present
 * - Log inventory change
 * - Check for low stock
 */
export async function decreaseStockAfterOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        Organization: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Log pending automation
    await logPending(
      order.organizationId,
      AutomationType.INVENTORY_UPDATE,
      'Order',
      orderId,
      'Stock decrease initiated'
    );

    // Process each order item
    for (const item of order.items) {
      const quantity = item.quantity;

      // Update product stock
      const product = await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: quantity,
          },
          soldCount: {
            increment: quantity,
          },
        },
      });

      // Update variant stock if present
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });
      }

      // Check for low stock
      if (product.stock <= product.lowStockAt) {
        await handleLowStock(product, order.organizationId);
      }

      // Auto-mark as out of stock if zero
      if (product.stock === 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: { published: false },
        });

        await logSuccess(
          order.organizationId,
          AutomationType.INVENTORY_UPDATE,
          'Product',
          product.id,
          'Product marked as out of stock',
          {
            productId: product.id,
            productName: product.name,
            stock: 0,
          }
        );
      }

      // Log stock decrease
      await logSuccess(
        order.organizationId,
        AutomationType.INVENTORY_UPDATE,
        'Product',
        product.id,
        'Stock decreased',
        {
          productId: product.id,
          productName: product.name,
          quantityDecreased: quantity,
          newStock: product.stock,
        }
      );
    }

    return { success: true };
  } catch (error) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) {
      await logFailure(
        order.organizationId,
        AutomationType.INVENTORY_UPDATE,
        'Order',
        orderId,
        'Stock decrease failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    throw error;
  }
}

/**
 * Restore stock after order cancellation/refund
 * - Restore product stock levels
 * - Handle variants if present
 * - Log inventory change
 */
export async function restoreStockAfterCancellation(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        Organization: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Log pending automation
    await logPending(
      order.organizationId,
      AutomationType.INVENTORY_UPDATE,
      'Order',
      orderId,
      'Stock restoration initiated'
    );

    // Process each order item
    for (const item of order.items) {
      const quantity = item.quantity;

      // Update product stock
      const product = await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: quantity,
          },
          soldCount: {
            decrement: quantity,
          },
        },
      });

      // Update variant stock if present
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              increment: quantity,
            },
          },
        });
      }

      // Re-publish if stock is restored above threshold
      if (product.stock > product.lowStockAt && !product.published) {
        await prisma.product.update({
          where: { id: product.id },
          data: { published: true },
        });

        await logSuccess(
          order.organizationId,
          AutomationType.INVENTORY_UPDATE,
          'Product',
          product.id,
          'Product re-published',
          {
            productId: product.id,
            productName: product.name,
            newStock: product.stock,
          }
        );
      }

      // Log stock restoration
      await logSuccess(
        order.organizationId,
        AutomationType.INVENTORY_UPDATE,
        'Product',
        product.id,
        'Stock restored',
        {
          productId: product.id,
          productName: product.name,
          quantityRestored: quantity,
          newStock: product.stock,
        }
      );
    }

    return { success: true };
  } catch (error) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) {
      await logFailure(
        order.organizationId,
        AutomationType.INVENTORY_UPDATE,
        'Order',
        orderId,
        'Stock restoration failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    throw error;
  }
}

/**
 * Handle low stock alert
 * - Send Telegram notification to admin
 * - Log low stock event
 */
async function handleLowStock(product: any, organizationId: string) {
  try {
    // Send Telegram notification
    await notifyLowStock({
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      threshold: product.lowStockAt,
      productId: product.id,
    });

    // Log low stock alert
    await logSuccess(
      organizationId,
      AutomationType.LOW_STOCK_ALERT,
      'Product',
      product.id,
      'Low stock alert sent',
      {
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        threshold: product.lowStockAt,
      }
    );
  } catch (error) {
    console.error('[Low Stock Alert] Failed:', error);
  }
}

/**
 * Detect low stock products
 * - Scan all products for low stock
 * - Send alerts for each
 * - Run via cron job
 */
export async function detectLowStockProducts(organizationId?: string) {
  try {
    const whereClause = organizationId
      ? { organizationId, stock: { lte: prisma.product.fields.lowStockAt } }
      : { stock: { lte: prisma.product.fields.lowStockAt } };

    const lowStockProducts = await prisma.product.findMany({
      where: whereClause,
      include: {
        Organization: true,
      },
    });

    for (const product of lowStockProducts) {
      await handleLowStock(product, product.organizationId);
    }

    return {
      total: lowStockProducts.length,
      products: lowStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        threshold: p.lowStockAt,
      })),
    };
  } catch (error) {
    console.error('[Low Stock Detection] Failed:', error);
    throw error;
  }
}

/**
 * Auto-mark out of stock products
 * - Mark products with zero stock as unpublished
 * - Run via cron job
 */
export async function autoMarkOutOfStock() {
  try {
    const outOfStockProducts = await prisma.product.updateMany({
      where: {
        stock: 0,
        published: true,
      },
      data: {
        published: false,
      },
    });

    return {
      count: outOfStockProducts.count,
    };
  } catch (error) {
    console.error('[Auto Mark Out of Stock] Failed:', error);
    throw error;
  }
}

/**
 * Get inventory status report
 * - Return current inventory status
 * - Include low stock and out of stock counts
 */
export async function getInventoryStatusReport(organizationId?: string) {
  const whereClause = organizationId ? { organizationId } : {};

  const [
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    healthyStockProducts,
  ] = await Promise.all([
    prisma.product.count({ where: whereClause }),
    prisma.product.count({
      where: {
        ...whereClause,
        stock: {
          lte: prisma.product.fields.lowStockAt,
          gt: 0,
        },
      },
    }),
    prisma.product.count({
      where: {
        ...whereClause,
        stock: 0,
      },
    }),
    prisma.product.count({
      where: {
        ...whereClause,
        stock: {
          gt: prisma.product.fields.lowStockAt,
        },
      },
    }),
  ]);

  return {
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    healthyStockProducts,
    lowStockPercentage: totalProducts > 0
      ? (lowStockProducts / totalProducts) * 100
      : 0,
    outOfStockPercentage: totalProducts > 0
      ? (outOfStockProducts / totalProducts) * 100
      : 0,
  };
}

/**
 * Process inventory automation queue job
 * - Called by worker to process queued inventory automation
 */
export async function processInventoryAutomationJob(jobData: any) {
  const { type, orderId } = jobData;

  switch (type) {
    case 'stock_decrease':
      return await decreaseStockAfterOrder(orderId);
    case 'stock_restore':
      return await restoreStockAfterCancellation(orderId);
    case 'low_stock_detection':
      return await detectLowStockProducts(jobData.organizationId);
    case 'auto_out_of_stock':
      return await autoMarkOutOfStock();
    default:
      throw new Error(`Unknown inventory automation type: ${type}`);
  }
}
