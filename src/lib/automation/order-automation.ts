// src/lib/automation/order-automation.ts
// Order automation: email confirmation, PDF invoice, Telegram notifications, status updates, logging

import { prisma } from '../prisma';
import { sendOrderConfirmation, sendShippingUpdate } from '../email';
import { notifyNewOrder } from '../notifications/telegram';
import { addEmailJob } from '../queue';
import { logSuccess, logFailure, logPending } from './logger';
import { AutomationType, OrderStatus, NotificationChannel } from '@prisma/client';

/**
 * Architecture:
 * - Order automation triggers on order creation and status changes
 * - Uses queue system for async processing
 * - Logs all automation actions
 * - Integrates with email, Telegram, and notification systems
 */

/**
 * Trigger order confirmation automation
 * - Send confirmation email with invoice
 * - Notify admin via Telegram
 * - Log automation action
 */
export async function triggerOrderConfirmation(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        Organization: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Log pending automation
    await logPending(
      order.organizationId,
      AutomationType.ORDER_CONFIRMATION,
      'Order',
      orderId,
      'Order confirmation initiated'
    );

    // Queue email confirmation
    await addEmailJob({
      type: 'order_confirmation',
      to: order.user.email,
      subject: `✅ Commande confirmée — #${order.orderNumber}`,
      template: 'order-confirmation',
      data: {
        orderNumber: order.orderNumber,
        total: order.total,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          city: order.address.city,
          address: `${order.address.line1}, ${order.address.city}`,
        },
      },
    });

    // Generate PDF invoice (async)
    await generateInvoice(order);

    // Notify admin via Telegram
    await notifyNewOrder({
      orderNumber: order.orderNumber,
      customerName: order.user.name,
      total: order.total,
      city: order.address.city,
      itemCount: order.items.length,
      orderId: order.id,
    });

    // Log success
    await logSuccess(
      order.organizationId,
      AutomationType.ORDER_CONFIRMATION,
      'Order',
      orderId,
      'Order confirmation sent',
      {
        orderNumber: order.orderNumber,
        userEmail: order.user.email,
      }
    );

    return { success: true };
  } catch (error) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) {
      await logFailure(
        order.organizationId,
        AutomationType.ORDER_CONFIRMATION,
        'Order',
        orderId,
        'Order confirmation failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    throw error;
  }
}

/**
 * Trigger order status update automation
 * - Notify customer of status change
 * - Log automation action
 */
export async function triggerOrderStatusUpdate(
  orderId: string,
  newStatus: OrderStatus,
  trackingNumber?: string
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        Organization: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Log pending automation
    await logPending(
      order.organizationId,
      AutomationType.ORDER_STATUS_UPDATE,
      'Order',
      orderId,
      `Order status update to ${newStatus}`
    );

    // Queue status update email
    await addEmailJob({
      type: 'shipping_update',
      to: order.user.email,
      subject: `📦 Commande #${order.orderNumber} — ${newStatus}`,
      template: 'shipping-update',
      data: {
        orderNumber: order.orderNumber,
        status: newStatus,
        trackingNumber: trackingNumber || '',
      },
    });

    // Create notification log
    await prisma.notificationLog.create({
      data: {
        userId: order.userId,
        type: 'ORDER_UPDATE',
        channel: NotificationChannel.EMAIL,
        recipient: order.user.email,
        subject: `Commande #${order.orderNumber} mise à jour`,
        content: `Votre commande est maintenant : ${newStatus}`,
        status: 'SENT',
        sentAt: new Date(),
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: newStatus,
          trackingNumber,
        },
      },
    });

    // Log success
    await logSuccess(
      order.organizationId,
      AutomationType.ORDER_STATUS_UPDATE,
      'Order',
      orderId,
      `Order status updated to ${newStatus}`,
      {
        newStatus,
        trackingNumber,
      }
    );

    return { success: true };
  } catch (error) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) {
      await logFailure(
        order.organizationId,
        AutomationType.ORDER_STATUS_UPDATE,
        'Order',
        orderId,
        'Order status update failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    throw error;
  }
}

/**
 * Generate PDF invoice for order
 * - Create invoice record in database
 * - Generate PDF document
 * - Attach to confirmation email
 */
async function generateInvoice(order: any) {
  try {
    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { orderId: order.id },
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { organizationId: order.organizationId },
    });
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;

    // Calculate totals
    const subtotalHT = order.subtotal;
    const tvaRate = 0.20; // 20% TVA in Morocco
    const tvaAmount = subtotalHT * tvaRate;
    const totalTTC = order.total;

    // Create invoice record
    const invoice = await prisma.invoice.create({
      data: {
        organizationId: order.organizationId,
        orderId: order.id,
        invoiceNumber,
        subtotalHT,
        tvaRate,
        tvaAmount,
        totalTTC,
        currency: order.currency,
        buyerName: order.user.name,
        buyerAddress: `${order.address.line1}, ${order.address.city}, ${order.address.country}`,
      },
    });

    // Log invoice generation
    await logSuccess(
      order.organizationId,
      AutomationType.ORDER_CONFIRMATION,
      'Invoice',
      invoice.id,
      'Invoice generated',
      {
        invoiceNumber,
        orderId: order.id,
      }
    );

    return invoice;
  } catch (error) {
    console.error('[Invoice Generation] Failed:', error);
    throw error;
  }
}

/**
 * Get invoice PDF
 * - Generate PDF from invoice data
 * - Return buffer for email attachment
 */
export async function getInvoicePDF(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      Order: {
        include: {
          items: true,
          user: true,
          address: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // TODO: Implement PDF generation using a library like pdfkit or puppeteer
  // For now, return a placeholder
  return {
    invoiceNumber: invoice.invoiceNumber,
    totalTTC: invoice.totalTTC,
    // PDF buffer would be generated here
  };
}

/**
 * Process order automation queue job
 * - Called by worker to process queued order automation
 */
export async function processOrderAutomationJob(jobData: any) {
  const { type, orderId, status, trackingNumber } = jobData;

  switch (type) {
    case 'order_confirmation':
      return await triggerOrderConfirmation(orderId);
    case 'order_status_update':
      return await triggerOrderStatusUpdate(orderId, status, trackingNumber);
    default:
      throw new Error(`Unknown order automation type: ${type}`);
  }
}

/**
 * Bulk order status update
 * - Update multiple orders at once
 * - Trigger automation for each
 */
export async function bulkOrderStatusUpdate(
  orderIds: string[],
  newStatus: OrderStatus,
  trackingNumber?: string
) {
  const results = await Promise.allSettled(
    orderIds.map(orderId =>
      triggerOrderStatusUpdate(orderId, newStatus, trackingNumber)
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return {
    total: orderIds.length,
    successful,
    failed,
  };
}
