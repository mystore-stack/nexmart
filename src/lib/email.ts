// src/lib/email.ts — NexMart Maroc · Premium Email Templates
import nodemailer from "nodemailer";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";
const BRAND_GREEN = "#0F766E";
const BRAND_GOLD = "#D4AF37";
const BRAND_NAVY = "#0F172A";

// ─── Transporter ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions { to: string; subject: string; html: string; }

async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"NexMart Maroc" <noreply@nexmart.ma>`,
      to, subject, html,
    });
  } catch (err) {
    console.error("[Email Error]:", err);
  }
}

// ─── Template de base — Design Marocain Premium ──────────────
const baseTemplate = (content: string, preheader = "") => `
<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>NexMart Maroc</title>
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:#F5F1E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','DM Sans',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1E8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(15,23,42,0.12);">

        <!-- HEADER -->
        <tr>
          <td style="background:${BRAND_NAVY};padding:0;">
            <!-- Moroccan gold top line -->
            <div style="height:3px;background:linear-gradient(90deg,transparent,${BRAND_GOLD},transparent);"></div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:28px 40px;">
                  <!-- Logo + Brand -->
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:48px;height:48px;background:${BRAND_GREEN};border-radius:12px;text-align:center;vertical-align:middle;">
                        <span style="color:${BRAND_GOLD};font-size:22px;font-weight:900;line-height:48px;">N</span>
                      </td>
                      <td style="padding-left:12px;vertical-align:middle;">
                        <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;line-height:1.2;">NexMart</div>
                        <div style="color:${BRAND_GOLD};font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-top:2px;">MAROC · PREMIUM</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <!-- Moroccan pattern divider -->
            <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.4),transparent);"></div>
          </td>
        </tr>

        <!-- CONTENT -->
        <tr>
          <td style="padding:48px 40px;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#F5F1E8;padding:28px 40px;border-top:1px solid rgba(212,175,55,0.2);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:0 12px;">
                        <a href="${APP_URL}/account" style="color:${BRAND_GREEN};text-decoration:none;font-size:13px;font-weight:600;">Mon Compte</a>
                      </td>
                      <td style="color:${BRAND_GOLD};font-size:13px;">·</td>
                      <td style="padding:0 12px;">
                        <a href="${APP_URL}/orders" style="color:${BRAND_GREEN};text-decoration:none;font-size:13px;font-weight:600;">Mes Commandes</a>
                      </td>
                      <td style="color:${BRAND_GOLD};font-size:13px;">·</td>
                      <td style="padding:0 12px;">
                        <a href="${APP_URL}/help" style="color:${BRAND_GREEN};text-decoration:none;font-size:13px;font-weight:600;">Support</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:16px 0 0;color:#94a3b8;font-size:12px;">
                    © ${new Date().getFullYear()} NexMart Maroc · Casablanca, Maroc 🇲🇦
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Bottom gold line -->
        <tr>
          <td style="height:3px;background:linear-gradient(90deg,transparent,${BRAND_GOLD},transparent);"></td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// ─── Bouton CTA ───────────────────────────────────────────────
const ctaButton = (text: string, url: string, color = BRAND_GREEN) => `
<div style="text-align:center;margin:32px 0;">
  <a href="${url}"
     style="background:${color};color:#ffffff;padding:16px 36px;border-radius:12px;
            text-decoration:none;font-weight:700;font-size:15px;display:inline-block;
            box-shadow:0 4px 20px rgba(15,118,110,0.35);">
    ${text}
  </a>
</div>
`;

// ─── Divider doré ─────────────────────────────────────────────
const goldDivider = `
<div style="margin:28px 0;height:1px;background:linear-gradient(90deg,transparent,${BRAND_GOLD},transparent);"></div>
`;

// ═══════════════════════════════════════════════════════════════
// 1. Email de bienvenue
// ═══════════════════════════════════════════════════════════════
export async function sendWelcomeEmail(email: string, name: string) {
  await sendEmail({
    to: email,
    subject: `🎉 Bienvenue sur NexMart, ${name.split(" ")[0]} !`,
    html: baseTemplate(`
      <h1 style="font-size:28px;font-weight:700;color:${BRAND_NAVY};margin:0 0 8px;line-height:1.2;">
        Marhaba, ${name.split(" ")[0]}! 👋
      </h1>
      <p style="color:#64748b;font-size:15px;margin:0 0 4px;">Bienvenue sur la marketplace premium du Maroc.</p>
      ${goldDivider}
      <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Votre compte NexMart est maintenant actif. Profitez d'une sélection de milliers de produits premium, 
        de recommandations par IA et d'une livraison express partout au Maroc.
      </p>

      <!-- Benefits -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        ${[
          ["🤖", "Recommandations IA", "Produits adaptés à votre style"],
          ["🚚", "Livraison express", "Partout au Maroc en 24-48h"],
          ["🔒", "Paiement sécurisé", "CMI · Stripe · SSL"],
          ["⭐", "Qualité garantie", "Produits certifiés et authentiques"],
        ].map(([icon, title, desc]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;width:44px;">
            <div style="width:36px;height:36px;background:#f0fdfa;border-radius:8px;text-align:center;line-height:36px;font-size:18px;">${icon}</div>
          </td>
          <td style="padding:10px 0 10px 14px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
            <div style="font-weight:700;color:${BRAND_NAVY};font-size:14px;">${title}</div>
            <div style="color:#64748b;font-size:13px;margin-top:2px;">${desc}</div>
          </td>
        </tr>`).join("")}
      </table>

      ${ctaButton("🛍️ Découvrir la boutique", APP_URL + "/products")}

      <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
        Si vous n'avez pas créé ce compte, ignorez cet email.
      </p>
    `, `Bienvenue sur NexMart Maroc — votre marketplace premium 🇲🇦`),
  });
}

// ═══════════════════════════════════════════════════════════════
// 2. Confirmation de commande
// ═══════════════════════════════════════════════════════════════
export async function sendOrderConfirmation(
  email: string,
  name: string,
  order: {
    orderNumber: string;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress?: { city?: string; address?: string };
  }
) {
  const itemsRows = order.items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#334155;font-size:14px;">${item.name}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:14px;text-align:center;">×${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:${BRAND_GREEN};font-size:14px;font-weight:700;text-align:right;">
        ${(item.price * item.quantity).toLocaleString("fr-MA")} DH
      </td>
    </tr>
  `).join("");

  await sendEmail({
    to: email,
    subject: `✅ Commande confirmée — #${order.orderNumber}`,
    html: baseTemplate(`
      <!-- Status badge -->
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;background:#f0fdfa;border:2px solid ${BRAND_GREEN};border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">✅</div>
        <h1 style="font-size:26px;font-weight:700;color:${BRAND_NAVY};margin:16px 0 6px;">Commande confirmée !</h1>
        <p style="color:#64748b;font-size:14px;margin:0;">Merci pour votre achat, ${name.split(" ")[0]} !</p>
      </div>

      <!-- Order number -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:0 0 24px;text-align:center;">
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Numéro de commande</p>
        <p style="color:${BRAND_NAVY};font-size:20px;font-weight:900;margin:0;letter-spacing:1px;">#${order.orderNumber}</p>
      </div>

      ${goldDivider}

      <!-- Items table -->
      <h3 style="font-size:14px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">Détail de la commande</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${BRAND_NAVY};">Produit</th>
            <th style="text-align:center;padding:8px 0;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${BRAND_NAVY};">Qté</th>
            <th style="text-align:right;padding:8px 0;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${BRAND_NAVY};">Prix</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:16px 0 0;font-weight:700;color:${BRAND_NAVY};font-size:16px;">Total</td>
            <td style="padding:16px 0 0;font-weight:900;color:${BRAND_GREEN};font-size:20px;text-align:right;">
              ${order.total.toLocaleString("fr-MA")} DH
            </td>
          </tr>
        </tfoot>
      </table>

      ${order.shippingAddress?.city ? `
      <div style="background:#f0fdfa;border-left:3px solid ${BRAND_GREEN};border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 24px;">
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Livraison à</p>
        <p style="color:${BRAND_NAVY};font-weight:700;font-size:14px;margin:0;">${order.shippingAddress.city}</p>
        ${order.shippingAddress.address ? `<p style="color:#64748b;font-size:13px;margin:4px 0 0;">${order.shippingAddress.address}</p>` : ""}
      </div>` : ""}

      ${ctaButton("📦 Suivre ma commande", `${APP_URL}/orders/${order.orderNumber}`)}
    `, `Commande #${order.orderNumber} confirmée — ${order.total.toLocaleString("fr-MA")} DH`),
  });
}

// ═══════════════════════════════════════════════════════════════
// 3. Réinitialisation mot de passe
// ═══════════════════════════════════════════════════════════════
export async function sendPasswordReset(email: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: "🔐 Réinitialiser votre mot de passe NexMart",
    html: baseTemplate(`
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;background:#fef3c7;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">🔐</div>
        <h1 style="font-size:24px;font-weight:700;color:${BRAND_NAVY};margin:16px 0 6px;">Réinitialisation du mot de passe</h1>
        <p style="color:#64748b;font-size:14px;margin:0;">Bonjour ${name.split(" ")[0]}, nous avons reçu votre demande.</p>
      </div>
      ${goldDivider}
      <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 8px;">
        Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien expire dans <strong>1 heure</strong>.
      </p>
      ${ctaButton("🔑 Réinitialiser le mot de passe", resetUrl, BRAND_GOLD.replace("#D4AF37", "#b8930a"))}
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 18px;margin:0 0 8px;">
        <p style="color:#dc2626;font-size:13px;margin:0;">
          ⚠️ Si vous n'avez pas fait cette demande, ignorez cet email. Votre compte est en sécurité.
        </p>
      </div>
    `, "Réinitialisez votre mot de passe NexMart"),
  });
}

// ═══════════════════════════════════════════════════════════════
// 4. Mise à jour de livraison
// ═══════════════════════════════════════════════════════════════
export async function sendShippingUpdate(
  email: string,
  name: string,
  orderNumber: string,
  trackingNumber: string,
  status: string
) {
  const statusConfig: Record<string, { emoji: string; color: string; message: string }> = {
    CONFIRMED:  { emoji: "✅", color: "#0F766E", message: "Votre commande a été confirmée et est en cours de préparation." },
    PROCESSING: { emoji: "⚙️", color: "#0F766E", message: "Votre commande est en cours de traitement par notre équipe." },
    SHIPPED:    { emoji: "🚚", color: "#7c3aed", message: "Votre commande est en route ! Elle vous sera livrée prochainement." },
    DELIVERED:  { emoji: "📦", color: "#059669", message: "Votre commande a été livrée. Nous espérons qu'elle vous satisfait !" },
    CANCELLED:  { emoji: "❌", color: "#dc2626", message: "Votre commande a été annulée. Contactez-nous pour plus d'informations." },
  };

  const cfg = statusConfig[status] || { emoji: "📋", color: BRAND_GREEN, message: "Votre commande a été mise à jour." };

  await sendEmail({
    to: email,
    subject: `${cfg.emoji} Commande #${orderNumber} — ${status}`,
    html: baseTemplate(`
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;background:#f0fdfa;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">${cfg.emoji}</div>
        <h1 style="font-size:24px;font-weight:700;color:${BRAND_NAVY};margin:16px 0 6px;">Mise à jour de commande</h1>
        <div style="display:inline-block;background:${cfg.color};color:#fff;padding:6px 18px;border-radius:99px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${status}</div>
      </div>
      ${goldDivider}
      <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Bonjour ${name.split(" ")[0]}, <br/>${cfg.message}
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#64748b;font-size:13px;padding:6px 0;">Numéro de commande</td>
            <td style="color:${BRAND_NAVY};font-size:13px;font-weight:700;text-align:right;padding:6px 0;">#${orderNumber}</td>
          </tr>
          ${trackingNumber ? `
          <tr>
            <td style="color:#64748b;font-size:13px;padding:6px 0;">Numéro de suivi</td>
            <td style="color:${BRAND_GREEN};font-size:13px;font-weight:700;text-align:right;padding:6px 0;">${trackingNumber}</td>
          </tr>` : ""}
        </table>
      </div>
      ${ctaButton("📦 Suivre ma commande", `${APP_URL}/orders/${orderNumber}`)}
    `, `Commande #${orderNumber} — ${status}`),
  });
}

// ═══════════════════════════════════════════════════════════════
// 5. Email Newsletter / Promo
// ═══════════════════════════════════════════════════════════════
export async function sendPromoEmail(
  email: string,
  name: string,
  promo: { title: string; description: string; code?: string; discount?: string; ctaUrl?: string }
) {
  await sendEmail({
    to: email,
    subject: `🎁 ${promo.title} — NexMart Maroc`,
    html: baseTemplate(`
      <!-- Hero promo -->
      <div style="background:${BRAND_NAVY};border-radius:16px;padding:40px 32px;text-align:center;margin:0 0 32px;position:relative;overflow:hidden;">
        <p style="color:${BRAND_GOLD};font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">Offre Exclusive</p>
        <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0 0 12px;line-height:1.2;">${promo.title}</h1>
        ${promo.discount ? `
        <div style="display:inline-block;background:${BRAND_GOLD};color:${BRAND_NAVY};padding:10px 28px;border-radius:99px;font-size:24px;font-weight:900;margin:16px 0;">
          ${promo.discount}
        </div>` : ""}
      </div>

      <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Bonjour ${name.split(" ")[0]}, ${promo.description}
      </p>

      ${promo.code ? `
      <div style="background:#f0fdfa;border:2px dashed ${BRAND_GREEN};border-radius:12px;padding:20px;text-align:center;margin:0 0 28px;">
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Code promo</p>
        <p style="color:${BRAND_GREEN};font-size:28px;font-weight:900;margin:0;letter-spacing:4px;">${promo.code}</p>
      </div>` : ""}

      ${ctaButton("🛍️ Profiter de l'offre", promo.ctaUrl || `${APP_URL}/deals`)}

      <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
        Pour vous désinscrire, <a href="${APP_URL}/unsubscribe" style="color:${BRAND_GREEN};">cliquez ici</a>.
      </p>
    `, promo.title),
  });
}
