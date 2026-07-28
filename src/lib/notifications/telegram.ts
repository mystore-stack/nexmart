// src/lib/notifications/telegram.ts â€” NexStore Ã— Telegram
// Ø¥Ø±Ø³Ø§Ù„ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Telegram Ù…Ù† Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ù…Ø¨Ø§Ø´Ø±Ø©

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// â”€â”€â”€ Ø¥Ø±Ø³Ø§Ù„ Ø±Ø³Ø§Ù„Ø© Ù†ØµÙŠØ© â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Ø¥Ø´Ø¹Ø§Ø± Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function notifyNewOrder(order: {
  orderNumber: string;
  customerName: string;
  total: number;
  city?: string;
  itemCount: number;
  orderId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexstore.ma";
  const msg = `
ðŸ›’ <b>Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯ â€” NexStore</b>
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ“¦ <b>Ø±Ù‚Ù… Ø§Ù„Ø·Ù„Ø¨:</b> <code>${order.orderNumber}</code>
ðŸ‘¤ <b>Ø§Ù„Ø¹Ù…ÙŠÙ„:</b> ${order.customerName}
ðŸ›ï¸ <b>Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª:</b> ${order.itemCount} Ø¹Ù†ØµØ±
ðŸ’° <b>Ø§Ù„Ù…Ø¨Ù„Øº:</b> <b>${order.total.toLocaleString("fr-MA")} DH</b>
ðŸ“ <b>Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©:</b> ${order.city || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯"}
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ”— <a href="${appUrl}/admin/orders/${order.orderId}">ÙØªØ­ ÙÙŠ Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…</a>
`.trim();
  return sendTelegramMessage(msg);
}

// â”€â”€â”€ Ø¥Ø´Ø¹Ø§Ø± Ø¯ÙØ¹ Ù†Ø§Ø¬Ø­ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function notifyPaymentSuccess(payment: {
  orderNumber: string;
  amount: number;
  customerName: string;
  method: string;
}) {
  const msg = `
âœ… <b>Ø¯ÙØ¹ Ù†Ø§Ø¬Ø­!</b>
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ“‹ <b>Ø§Ù„Ø·Ù„Ø¨:</b> <code>${payment.orderNumber}</code>
ðŸ‘¤ <b>Ø§Ù„Ø¹Ù…ÙŠÙ„:</b> ${payment.customerName}
ðŸ’³ <b>Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø¯ÙØ¹:</b> ${payment.method}
ðŸ’° <b>Ø§Ù„Ù…Ø¨Ù„Øº:</b> <b>${payment.amount.toLocaleString("fr-MA")} DH</b>
`.trim();
  return sendTelegramMessage(msg);
}

// â”€â”€â”€ Ø¥Ø´Ø¹Ø§Ø± ØªØ³Ø¬ÙŠÙ„ Ù…Ø³ØªØ®Ø¯Ù… Ø¬Ø¯ÙŠØ¯ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function notifyNewUser(user: {
  name: string;
  email: string;
  userId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexstore.ma";
  const msg = `
ðŸ‘¤ <b>Ù…Ø³ØªØ®Ø¯Ù… Ø¬Ø¯ÙŠØ¯!</b>
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ™‹ <b>Ø§Ù„Ø§Ø³Ù…:</b> ${user.name}
ðŸ“§ <b>Ø§Ù„Ø¥ÙŠÙ…ÙŠÙ„:</b> ${user.email}
ðŸ”— <a href="${appUrl}/admin/users/${user.userId}">Ø¹Ø±Ø¶ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ</a>
`.trim();
  return sendTelegramMessage(msg);
}

// â”€â”€â”€ Ø¥Ø´Ø¹Ø§Ø± Ù…Ø®Ø²ÙˆÙ† Ù†Ø§Ù‚Øµ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function notifyLowStock(product: {
  name: string;
  sku: string;
  stock: number;
  threshold: number;
  productId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexstore.ma";
  const emoji = product.stock === 0 ? "ðŸ”´" : "ðŸŸ¡";
  const msg = `
${emoji} <b>ØªÙ†Ø¨ÙŠÙ‡ Ø§Ù„Ù…Ø®Ø²ÙˆÙ†</b>
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ“¦ <b>Ø§Ù„Ù…Ù†ØªØ¬:</b> ${product.name}
ðŸ·ï¸ <b>SKU:</b> <code>${product.sku}</code>
ðŸ“‰ <b>Ø§Ù„Ù…Ø®Ø²ÙˆÙ† Ø§Ù„Ø­Ø§Ù„ÙŠ:</b> <b>${product.stock} Ù‚Ø·Ø¹Ø©</b>
âš ï¸ <b>Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰:</b> ${product.threshold} Ù‚Ø·Ø¹Ø©
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ”— <a href="${appUrl}/admin/products/${product.productId}">ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ø®Ø²ÙˆÙ†</a>
`.trim();
  return sendTelegramMessage(msg);
}

// â”€â”€â”€ ØªÙ‚Ø±ÙŠØ± ÙŠÙˆÙ…ÙŠ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function sendDailyReport(stats: {
  orders: number;
  revenue: number;
  newUsers: number;
  topProduct?: string;
  date?: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexstore.ma";
  const today = stats.date || new Date().toLocaleDateString("fr-MA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const msg = `
ðŸ“Š <b>ØªÙ‚Ø±ÙŠØ± NexStore Ø§Ù„ÙŠÙˆÙ…ÙŠ</b>
ðŸ“… ${today}
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ“¦ <b>Ø§Ù„Ø·Ù„Ø¨Ø§Øª:</b> ${stats.orders}
ðŸ’° <b>Ø§Ù„Ø¥ÙŠØ±Ø§Ø¯Ø§Øª:</b> <b>${stats.revenue.toLocaleString("fr-MA")} DH</b>
ðŸ‘¥ <b>Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø¬Ø¯Ø¯:</b> ${stats.newUsers}
${stats.topProduct ? `ðŸ† <b>Ø£ÙØ¶Ù„ Ù…Ù†ØªØ¬:</b> ${stats.topProduct}` : ""}
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ”— <a href="${appUrl}/admin">Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„ÙƒØ§Ù…Ù„Ø©</a>
`.trim();
  return sendTelegramMessage(msg);
}

// â”€â”€â”€ Ø¥Ø´Ø¹Ø§Ø± Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù… â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function notifySystemError(error: {
  message: string;
  path?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}) {
  const severityEmoji = {
    LOW: "ðŸŸ¢", MEDIUM: "ðŸŸ¡", HIGH: "ðŸ”´", CRITICAL: "ðŸš¨",
  }[error.severity];
  const msg = `
${severityEmoji} <b>Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù… â€” ${error.severity}</b>
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ“ <b>Ø§Ù„Ù…Ø³Ø§Ø±:</b> ${error.path || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯"}
âŒ <b>Ø§Ù„Ø®Ø·Ø£:</b> <code>${error.message.slice(0, 300)}</code>
â° <b>Ø§Ù„ÙˆÙ‚Øª:</b> ${new Date().toLocaleString("fr-MA")}
`.trim();
  return sendTelegramMessage(msg);
}

