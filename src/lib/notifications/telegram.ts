// src/lib/notifications/telegram.ts — NexMart × Telegram
// إرسال إشعارات Telegram من داخل المشروع مباشرة

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// ─── إرسال رسالة نصية ───────────────────────────────────────
export async function sendTelegramMessage(
  text: string,
  chatId: string = TELEGRAM_CHAT_ID!,
  parseMode: "HTML" | "Markdown" = "HTML"
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !chatId) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set");
    return false;
  }
  try {
    const res = await fetch(`${BASE_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("[Telegram] Error:", data.description);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[Telegram] Failed to send:", e);
    return false;
  }
}

// ─── إشعار طلب جديد ─────────────────────────────────────────
export async function notifyNewOrder(order: {
  orderNumber: string;
  customerName: string;
  total: number;
  city?: string;
  itemCount: number;
  orderId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";
  const msg = `
🛒 <b>طلب جديد — NexMart</b>
━━━━━━━━━━━━━━━━━━━
📦 <b>رقم الطلب:</b> <code>${order.orderNumber}</code>
👤 <b>العميل:</b> ${order.customerName}
🛍️ <b>المنتجات:</b> ${order.itemCount} عنصر
💰 <b>المبلغ:</b> <b>${order.total.toLocaleString("fr-MA")} DH</b>
📍 <b>المدينة:</b> ${order.city || "غير محدد"}
━━━━━━━━━━━━━━━━━━━
🔗 <a href="${appUrl}/admin/orders/${order.orderId}">فتح في لوحة التحكم</a>
`.trim();
  return sendTelegramMessage(msg);
}

// ─── إشعار دفع ناجح ─────────────────────────────────────────
export async function notifyPaymentSuccess(payment: {
  orderNumber: string;
  amount: number;
  customerName: string;
  method: string;
}) {
  const msg = `
✅ <b>دفع ناجح!</b>
━━━━━━━━━━━━━━━━━━━
📋 <b>الطلب:</b> <code>${payment.orderNumber}</code>
👤 <b>العميل:</b> ${payment.customerName}
💳 <b>طريقة الدفع:</b> ${payment.method}
💰 <b>المبلغ:</b> <b>${payment.amount.toLocaleString("fr-MA")} DH</b>
`.trim();
  return sendTelegramMessage(msg);
}

// ─── إشعار تسجيل مستخدم جديد ────────────────────────────────
export async function notifyNewUser(user: {
  name: string;
  email: string;
  userId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";
  const msg = `
👤 <b>مستخدم جديد!</b>
━━━━━━━━━━━━━━━━━━━
🙋 <b>الاسم:</b> ${user.name}
📧 <b>الإيميل:</b> ${user.email}
🔗 <a href="${appUrl}/admin/users/${user.userId}">عرض الملف الشخصي</a>
`.trim();
  return sendTelegramMessage(msg);
}

// ─── إشعار مخزون ناقص ───────────────────────────────────────
export async function notifyLowStock(product: {
  name: string;
  sku: string;
  stock: number;
  threshold: number;
  productId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";
  const emoji = product.stock === 0 ? "🔴" : "🟡";
  const msg = `
${emoji} <b>تنبيه المخزون</b>
━━━━━━━━━━━━━━━━━━━
📦 <b>المنتج:</b> ${product.name}
🏷️ <b>SKU:</b> <code>${product.sku}</code>
📉 <b>المخزون الحالي:</b> <b>${product.stock} قطعة</b>
⚠️ <b>الحد الأدنى:</b> ${product.threshold} قطعة
━━━━━━━━━━━━━━━━━━━
🔗 <a href="${appUrl}/admin/products/${product.productId}">تحديث المخزون</a>
`.trim();
  return sendTelegramMessage(msg);
}

// ─── تقرير يومي ─────────────────────────────────────────────
export async function sendDailyReport(stats: {
  orders: number;
  revenue: number;
  newUsers: number;
  topProduct?: string;
  date?: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";
  const today = stats.date || new Date().toLocaleDateString("fr-MA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const msg = `
📊 <b>تقرير NexMart اليومي</b>
📅 ${today}
━━━━━━━━━━━━━━━━━━━
📦 <b>الطلبات:</b> ${stats.orders}
💰 <b>الإيرادات:</b> <b>${stats.revenue.toLocaleString("fr-MA")} DH</b>
👥 <b>مستخدمين جدد:</b> ${stats.newUsers}
${stats.topProduct ? `🏆 <b>أفضل منتج:</b> ${stats.topProduct}` : ""}
━━━━━━━━━━━━━━━━━━━
🔗 <a href="${appUrl}/admin">لوحة التحكم الكاملة</a>
`.trim();
  return sendTelegramMessage(msg);
}

// ─── إشعار خطأ في النظام ────────────────────────────────────
export async function notifySystemError(error: {
  message: string;
  path?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}) {
  const severityEmoji = {
    LOW: "🟢", MEDIUM: "🟡", HIGH: "🔴", CRITICAL: "🚨",
  }[error.severity];
  const msg = `
${severityEmoji} <b>خطأ في النظام — ${error.severity}</b>
━━━━━━━━━━━━━━━━━━━
📍 <b>المسار:</b> ${error.path || "غير محدد"}
❌ <b>الخطأ:</b> <code>${error.message.slice(0, 300)}</code>
⏰ <b>الوقت:</b> ${new Date().toLocaleString("fr-MA")}
`.trim();
  return sendTelegramMessage(msg);
}
