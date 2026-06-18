// src/lib/email.ts — NexMart Email Service with Resend Integration
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { EmailType, EmailStatus } from '@prisma/client';
import {
  welcomeEmailTemplate,
  orderConfirmationTemplate,
  stockAlertTemplate,
  cartAbandonmentTemplate,
  dailySalesReportTemplate,
} from './email-templates';

// ─── Configuration ─────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'NexMart Maroc <noreply@nexmart.ma>';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

// ─── TypeScript Interfaces ─────────────────────────────────────
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  type: EmailType;
  userId?: string;
  orderId?: string;
  organizationId?: string;
  metadata?: Record<string, any>;
}

interface SendEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

// ─── Core Email Service ───────────────────────────────────────
export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, type, userId, orderId, organizationId, metadata } = options;

  // Create email log entry
  const emailLog = await prisma.emailLog.create({
    data: {
      recipient: to,
      subject,
      type,
      userId,
      orderId,
      organizationId,
      status: EmailStatus.PENDING,
      metadata: metadata || {},
    },
  });

  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < MAX_RETRIES) {
    try {
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });

      // Update email log on success
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.SENT,
          sentAt: new Date(),
          deliveredAt: new Date(),
        },
      });

      return { success: true, emailId: result.data?.id };
    } catch (error) {
      lastError = error as Error;
      retryCount++;

      // Update email log with retry status
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.RETRYING,
          retryCount,
          error: (error as Error).message,
        },
      });

      if (retryCount < MAX_RETRIES) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount - 1)));
      }
    }
  }

  // Mark as failed after all retries
  await prisma.emailLog.update({
    where: { id: emailLog.id },
    data: {
      status: EmailStatus.FAILED,
      error: lastError?.message || 'Unknown error',
      retryCount: MAX_RETRIES,
    },
  });

  return { success: false, error: lastError?.message || 'Failed to send email after retries' };
}

// ─── Welcome Email ────────────────────────────────────────────
export async function sendWelcomeEmail(
  email: string,
  name: string,
  userId?: string,
  organizationId?: string
): Promise<SendEmailResult> {
  const html = welcomeEmailTemplate(name);
  
  return sendEmail({
    to: email,
    subject: `🎉 Bienvenue sur NexMart, ${name.split(' ')[0]} !`,
    html,
    type: EmailType.WELCOME,
    userId,
    organizationId,
    metadata: { userName: name },
  });
}

// ─── Order Confirmation Email ───────────────────────────────
export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  order: {
    orderNumber: string;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress?: { city?: string; address?: string };
  },
  userId?: string,
  orderId?: string,
  organizationId?: string
): Promise<SendEmailResult> {
  const html = orderConfirmationTemplate(name, order.orderNumber, order.total, order.items, order.shippingAddress);
  
  return sendEmail({
    to: email,
    subject: `✅ Commande confirmée — #${order.orderNumber}`,
    html,
    type: EmailType.ORDER_CONFIRMATION,
    userId,
    orderId,
    organizationId,
    metadata: { 
      orderNumber: order.orderNumber,
      total: order.total,
      itemCount: order.items.length,
    },
  });
}

// ─── Stock Alert Email ───────────────────────────────────────
export async function sendStockAlertEmail(
  email: string,
  productName: string,
  currentStock: number,
  threshold: number,
  organizationId?: string
): Promise<SendEmailResult> {
  const html = stockAlertTemplate(productName, currentStock, threshold);
  
  return sendEmail({
    to: email,
    subject: `⚠️ Alerte Stock Faible — ${productName}`,
    html,
    type: EmailType.STOCK_ALERT,
    organizationId,
    metadata: { 
      productName,
      currentStock,
      threshold,
    },
  });
}

// ─── Cart Abandonment Email ───────────────────────────────────
export async function sendCartAbandonmentEmail(
  email: string,
  name: string,
  cartValue: number,
  itemCount: number,
  reminderNumber: 1 | 2 | 3,
  userId?: string,
  organizationId?: string
): Promise<SendEmailResult> {
  const html = cartAbandonmentTemplate(name, cartValue, itemCount);
  const typeMap = {
    1: EmailType.CART_ABANDONMENT_1,
    2: EmailType.CART_ABANDONMENT_2,
    3: EmailType.CART_ABANDONMENT_3,
  };
  
  return sendEmail({
    to: email,
    subject: `🛒 Votre panier vous attend — ${cartValue.toLocaleString('fr-MA')} DH`,
    html,
    type: typeMap[reminderNumber],
    userId,
    organizationId,
    metadata: { 
      cartValue,
      itemCount,
      reminderNumber,
    },
  });
}

// ─── Daily Sales Report Email ────────────────────────────────
export async function sendDailySalesReportEmail(
  email: string,
  totalSales: number,
  totalOrders: number,
  newCustomers: number,
  topProducts: Array<{ name: string; sold: number }>,
  organizationId?: string
): Promise<SendEmailResult> {
  const html = dailySalesReportTemplate(totalSales, totalOrders, newCustomers, topProducts);
  
  return sendEmail({
    to: email,
    subject: `📊 Rapport Quotidien — ${totalSales.toLocaleString('fr-MA')} DH`,
    html,
    type: EmailType.DAILY_SALES_REPORT,
    organizationId,
    metadata: { 
      totalSales,
      totalOrders,
      newCustomers,
      topProductsCount: topProducts.length,
    },
  });
}

// ─── Email Statistics ─────────────────────────────────────────
export async function getEmailStatistics(organizationId?: string) {
  const where = organizationId ? { organizationId } : {};

  const [
    totalSent,
    totalDelivered,
    totalFailed,
    byType,
    recentEmails,
  ] = await Promise.all([
    prisma.emailLog.count({ where: { ...where, status: EmailStatus.SENT } }),
    prisma.emailLog.count({ where: { ...where, status: EmailStatus.DELIVERED } }),
    prisma.emailLog.count({ where: { ...where, status: EmailStatus.FAILED } }),
    prisma.emailLog.groupBy({
      by: ['type'],
      where,
      _count: true,
    }),
    prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        order: { select: { orderNumber: true } },
      },
    }),
  ]);

  const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

  return {
    totalSent,
    totalDelivered,
    totalFailed,
    deliveryRate,
    byType,
    recentEmails,
  };
}

// ─── Environment Validation ─────────────────────────────────
export function validateEmailConfig(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export default {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendStockAlertEmail,
  sendCartAbandonmentEmail,
  sendDailySalesReportEmail,
  getEmailStatistics,
  validateEmailConfig,
};
