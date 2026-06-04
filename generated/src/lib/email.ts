// src/lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: `"NexMart" <${process.env.EMAIL_FROM || "noreply@nexmart.com"}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[Email Error]:", err);
  }
}

// ─── Email templates ──────────────────────────────────────────

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NexMart</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#000;padding:24px 32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">NexMart</h1>
    </div>
    <div style="padding:40px 32px;">
      ${content}
    </div>
    <div style="padding:24px 32px;background:#f9f9f9;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0;color:#999;font-size:13px;">© ${new Date().getFullYear()} NexMart. All rights reserved.</p>
      <p style="margin:8px 0 0;color:#999;font-size:13px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/account" style="color:#f97316;text-decoration:none;">My Account</a>
        · <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="color:#f97316;text-decoration:none;">My Orders</a>
        · <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" style="color:#f97316;text-decoration:none;">Support</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

export async function sendWelcomeEmail(email: string, name: string) {
  await sendEmail({
    to: email,
    subject: "Welcome to NexMart! 🎉",
    html: baseTemplate(`
      <h2 style="font-size:22px;font-weight:700;color:#000;margin:0 0 16px;">Welcome, ${name}! 👋</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 24px;">
        Thank you for joining NexMart. You now have access to thousands of premium products at unbeatable prices.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background:#f97316;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
          Start Shopping
        </a>
      </div>
      <p style="color:#999;font-size:13px;margin:0;">
        If you didn't create this account, please ignore this email.
      </p>
    `),
  });
}

export async function sendOrderConfirmation(
  email: string,
  name: string,
  order: { orderNumber: string; total: number; items: Array<{ name: string; quantity: number; price: number }> }
) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#333;">${item.name}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#333;text-align:center;">${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#333;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  await sendEmail({
    to: email,
    subject: `Order Confirmed - #${order.orderNumber}`,
    html: baseTemplate(`
      <h2 style="font-size:22px;font-weight:700;color:#000;margin:0 0 8px;">Order Confirmed! ✅</h2>
      <p style="color:#555;margin:0 0 24px;">Hi ${name}, your order <strong>#${order.orderNumber}</strong> has been confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #000;">Item</th>
            <th style="text-align:center;padding:8px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #000;">Qty</th>
            <th style="text-align:right;padding:8px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #000;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:16px 0 0;font-weight:700;color:#000;">Total</td>
            <td style="padding:16px 0 0;font-weight:700;color:#000;text-align:right;">$${order.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.orderNumber}" style="background:#000;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
          Track Order
        </a>
      </div>
    `),
  });
}

export async function sendPasswordReset(email: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Reset your NexMart password",
    html: baseTemplate(`
      <h2 style="font-size:22px;font-weight:700;color:#000;margin:0 0 16px;">Reset Your Password</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 24px;">Hi ${name}, we received a request to reset your password. Click the button below to set a new password.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${resetUrl}" style="background:#f97316;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color:#999;font-size:13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `),
  });
}

export async function sendShippingUpdate(
  email: string,
  name: string,
  orderNumber: string,
  trackingNumber: string,
  status: string
) {
  await sendEmail({
    to: email,
    subject: `Order #${orderNumber} - ${status}`,
    html: baseTemplate(`
      <h2 style="font-size:22px;font-weight:700;color:#000;margin:0 0 16px;">📦 Order Update</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 16px;">Hi ${name}, your order <strong>#${orderNumber}</strong> status has been updated to <strong>${status}</strong>.</p>
      ${trackingNumber ? `<p style="color:#555;">Tracking Number: <strong>${trackingNumber}</strong></p>` : ""}
      <div style="text-align:center;margin:32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}" style="background:#000;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
          Track Your Order
        </a>
      </div>
    `),
  });
}
