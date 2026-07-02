// src/lib/notifications/service.ts — Unified notification service
// Provides a unified interface for all notification channels (Telegram, Email, etc.)

import { 
  notifyNewOrder, 
  notifyPaymentSuccess, 
  notifyNewUser,
  notifyLowStock,
  sendDailyReport,
  notifySystemError 
} from "./telegram";
import { sendEmail } from "@/lib/email";

// ─── Order Notifications ───────────────────────────────────────

/**
 * Send notification when an order is created
 * Sends both Telegram notification to admin and email to customer
 */
export async function sendOrderCreatedNotification(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  city?: string;
  itemCount: number;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}) {
  // Send Telegram notification to admin
  await notifyNewOrder({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    total: order.total,
    city: order.city,
    itemCount: order.itemCount,
    orderId: order.orderId,
  });

  // Send email confirmation to customer
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";
  const itemsHtml = order.items.map(item => `
    <div style="padding: 10px; border-bottom: 1px solid #eee;">
      <div style="font-weight: bold;">${item.name}</div>
      <div style="color: #666;">Qty: ${item.quantity} × ${item.price.toFixed(2)} DH</div>
    </div>
  `).join('');

  await sendEmail({
    type: 'ORDER_CONFIRMATION' as any,
    to: order.customerEmail,
    subject: `Order Confirmed - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .total { font-size: 24px; font-weight: bold; color: #667eea; text-align: right; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed! 🎉</h1>
            <p>Thank you for your purchase</p>
          </div>
          <div class="content">
            <p>Hi ${order.customerName},</p>
            <p>Your order has been confirmed and is being processed.</p>
            <div style="font-size: 20px; font-weight: bold; margin: 20px 0;">Order #${order.orderNumber}</div>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${itemsHtml}
            </div>
            <div class="total">Total: ${order.total.toFixed(2)} DH</div>
            <div style="text-align: center;">
              <a href="${appUrl}/orders/${order.orderNumber}" class="button">Track Your Order</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

/**
 * Send admin notification for various events
 * Routes to appropriate notification channel based on severity
 */
export async function sendAdminNotification(notification: {
  type: "ORDER" | "PAYMENT" | "USER" | "STOCK" | "ERROR" | "REPORT";
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  data: any;
}) {
  switch (notification.type) {
    case "ORDER":
      await notifyNewOrder(notification.data);
      break;
    case "PAYMENT":
      await notifyPaymentSuccess(notification.data);
      break;
    case "USER":
      await notifyNewUser(notification.data);
      break;
    case "STOCK":
      await notifyLowStock(notification.data);
      break;
    case "ERROR":
      await notifySystemError({
        message: notification.data.message,
        path: notification.data.path,
        severity: notification.severity || "MEDIUM",
      });
      break;
    case "REPORT":
      await sendDailyReport(notification.data);
      break;
    default:
      console.warn("[NotificationService] Unknown notification type:", notification.type);
  }
}

// ─── Re-export Telegram functions for direct use ────────────────

export async function sendPaymentReceivedNotification(order: {
  orderNumber?: string;
  total?: number;
  customerName?: string | null;
  paymentMethod?: string | null;
  user?: { name?: string | null } | null;
}) {
  await notifyPaymentSuccess({
    orderNumber: order.orderNumber || "Unknown",
    amount: Number(order.total || 0),
    customerName: order.customerName || order.user?.name || "Customer",
    method: order.paymentMethod || "Stripe",
  });
}

export {
  notifyNewOrder,
  notifyPaymentSuccess,
  notifyNewUser,
  notifyLowStock,
  sendDailyReport,
  notifySystemError,
  sendTelegramMessage,
} from "./telegram";

// ─── Email Notifications ───────────────────────────────────────

/**
 * Send shipping status update email
 */
export async function sendShippingUpdateEmail(params: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  status: "PROCESSING" | "SHIPPED" | "DELIVERED";
  trackingNumber?: string;
  courier?: string;
  estimatedDelivery?: string;
}) {
  const statusMessages = {
    PROCESSING: {
      title: "Your order is being prepared 📦",
      message: "Great news! Your order is now being prepared for shipment.",
      color: "#667eea",
    },
    SHIPPED: {
      title: "Your order has shipped! 🚚",
      message: "Great news! Your order has been shipped and is on its way to you.",
      color: "#11998e",
    },
    DELIVERED: {
      title: "Your order has been delivered! 🎉",
      message: "Your order has been delivered. Enjoy your purchase!",
      color: "#f093fb",
    },
  };

  const statusInfo = statusMessages[params.status];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";

  await sendEmail({
    type: 'ORDER_STATUS_UPDATE' as any,
    to: params.customerEmail,
    subject: `${statusInfo.title} - #${params.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .tracking { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .tracking-number { font-size: 24px; font-weight: bold; color: #11998e; margin: 10px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusInfo.title}</h1>
            <p>Order #${params.orderNumber}</p>
          </div>
          <div class="content">
            <p>Hi ${params.customerName},</p>
            <p>${statusInfo.message}</p>
            ${params.status === "SHIPPED" && params.trackingNumber ? `
              <div class="tracking">
                <p><strong>Tracking Number:</strong></p>
                <div class="tracking-number">${params.trackingNumber}</div>
                <p><strong>Courier:</strong> ${params.courier || "N/A"}</p>
                ${params.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${params.estimatedDelivery}</p>` : ""}
              </div>
            ` : ""}
            <div style="text-align: center;">
              <a href="${appUrl}/orders/${params.orderNumber}" class="button">Track Your Order</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

/**
 * Send abandoned cart recovery email
 */
export async function sendAbandonedCartEmail(params: {
  customerEmail: string;
  customerName: string;
  cartItems: Array<{
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  couponCode?: string;
  stage: 1 | 2 | 3;
}) {
  const stageMessages = {
    1: {
      subject: "You left something behind! 🛒",
      message: "We noticed you left some items in your cart. Don't miss out!",
      discount: null,
    },
    2: {
      subject: "Still interested? Your cart is waiting",
      message: "Your cart is still here! Complete your purchase before items sell out.",
      discount: null,
    },
    3: {
      subject: "Last chance! 5% off your order 🎁",
      message: "Here's a special offer just for you - complete your order now!",
      discount: 5,
    },
  };

  const stageInfo = stageMessages[params.stage];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";
  const couponText = params.couponCode 
    ? `<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
        <p style="margin: 0; font-size: 18px; font-weight: bold;">Use code: <span style="font-size: 24px; color: #667eea;">${params.couponCode}</span></p>
        <p style="margin: 5px 0 0 0; color: #666;">${stageInfo.discount ? `${stageInfo.discount}% off your order` : "Special offer"}</p>
       </div>`
    : "";

  const itemsHtml = params.cartItems.map(item => `
    <div style="display: flex; align-items: center; margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px; margin-right: 15px;">
      <div style="flex: 1;">
        <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
        <div style="color: #666;">Qty: ${item.quantity} × ${item.price.toFixed(2)} DH</div>
      </div>
    </div>
  `).join('');

  await sendEmail({
    type: 'CART_RECOVERY' as any,
    to: params.customerEmail,
    subject: stageInfo.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${stageInfo.subject}</h1>
          </div>
          <div class="content">
            <p>Hi ${params.customerName},</p>
            <p>${stageInfo.message}</p>
            ${itemsHtml}
            ${couponText}
            <div style="text-align: center;">
              <a href="${appUrl}/cart" class="button">Complete Your Order</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
