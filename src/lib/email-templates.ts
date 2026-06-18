// src/lib/email-templates.ts — NexMart Email Templates
import { EmailType } from '@prisma/client';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nexmart.ma';
const BRAND_GREEN = '#0F766E';
const BRAND_GOLD = '#D4AF37';
const BRAND_NAVY = '#0F172A';

// ─── Base Template ─────────────────────────────────────────────
const baseTemplate = (content: string, preheader = '') => `
<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>NexMart Maroc</title>
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin:0;padding:0;background:#F5F1E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','DM Sans',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1E8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(15,23,42,0.12);">

        <!-- HEADER -->
        <tr>
          <td style="background:${BRAND_NAVY};padding:0;">
            <div style="height:3px;background:linear-gradient(90deg,transparent,${BRAND_GOLD},transparent);"></div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:28px 40px;">
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

        <tr>
          <td style="height:3px;background:linear-gradient(90deg,transparent,${BRAND_GOLD},transparent);"></td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// ─── CTA Button ───────────────────────────────────────────────
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

// ─── Gold Divider ─────────────────────────────────────────────
const goldDivider = `
<div style="margin:28px 0;height:1px;background:linear-gradient(90deg,transparent,${BRAND_GOLD},transparent);"></div>
`;

// ─── Welcome Email Template ────────────────────────────────────
export const welcomeEmailTemplate = (name: string) => baseTemplate(`
  <h1 style="font-size:28px;font-weight:700;color:${BRAND_NAVY};margin:0 0 8px;line-height:1.2;">
    Marhaba, ${name.split(' ')[0]}! 👋
  </h1>
  <p style="color:#64748b;font-size:15px;margin:0 0 4px;">Bienvenue sur la marketplace premium du Maroc.</p>
  ${goldDivider}
  <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
    Votre compte NexMart est maintenant actif. Profitez d'une sélection de milliers de produits premium, 
    de recommandations par IA et d'une livraison express partout au Maroc.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
    ${[
      ['🤖', 'Recommandations IA', 'Produits adaptés à votre style'],
      ['🚚', 'Livraison express', 'Partout au Maroc en 24-48h'],
      ['🔒', 'Paiement sécurisé', 'CMI · Stripe · SSL'],
      ['⭐', 'Qualité garantie', 'Produits certifiés et authentiques'],
    ].map(([icon, title, desc]) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;width:44px;">
        <div style="width:36px;height:36px;background:#f0fdfa;border-radius:8px;text-align:center;line-height:36px;font-size:18px;">${icon}</div>
      </td>
      <td style="padding:10px 0 10px 14px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
        <div style="font-weight:700;color:${BRAND_NAVY};font-size:14px;">${title}</div>
        <div style="color:#64748b;font-size:13px;margin-top:2px;">${desc}</div>
      </td>
    </tr>`).join('')}
  </table>

  ${ctaButton('🛍️ Découvrir la boutique', APP_URL + '/products')}

  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
    Si vous n'avez pas créé ce compte, ignorez cet email.
  </p>
`, `Bienvenue sur NexMart Maroc — votre marketplace premium 🇲🇦`);

// ─── Order Confirmation Template ───────────────────────────────
export const orderConfirmationTemplate = (
  name: string,
  orderNumber: string,
  total: number,
  items: Array<{ name: string; quantity: number; price: number }>,
  shippingAddress?: { city?: string; address?: string }
) => {
  const itemsRows = items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#334155;font-size:14px;">${item.name}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:14px;text-align:center;">×${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;color:${BRAND_GREEN};font-size:14px;font-weight:700;text-align:right;">
        ${(item.price * item.quantity).toLocaleString('fr-MA')} DH
      </td>
    </tr>
  `).join('');

  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#f0fdfa;border:2px solid ${BRAND_GREEN};border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">✅</div>
      <h1 style="font-size:26px;font-weight:700;color:${BRAND_NAVY};margin:16px 0 6px;">Commande confirmée !</h1>
      <p style="color:#64748b;font-size:14px;margin:0;">Merci pour votre achat, ${name.split(' ')[0]} !</p>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:0 0 24px;text-align:center;">
      <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Numéro de commande</p>
      <p style="color:${BRAND_NAVY};font-size:20px;font-weight:900;margin:0;letter-spacing:1px;">#${orderNumber}</p>
    </div>

    ${goldDivider}

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
            ${total.toLocaleString('fr-MA')} DH
          </td>
        </tr>
      </tfoot>
    </table>

    ${shippingAddress?.city ? `
    <div style="background:#f0fdfa;border-left:3px solid ${BRAND_GREEN};border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 24px;">
      <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Livraison à</p>
      <p style="color:${BRAND_NAVY};font-weight:700;font-size:14px;margin:0;">${shippingAddress.city}</p>
      ${shippingAddress.address ? `<p style="color:#64748b;font-size:13px;margin:4px 0 0;">${shippingAddress.address}</p>` : ''}
    </div>` : ''}

    ${ctaButton('📦 Suivre ma commande', `${APP_URL}/orders/${orderNumber}`)}
  `, `Commande #${orderNumber} confirmée — ${total.toLocaleString('fr-MA')} DH`);
};

// ─── Stock Alert Template ──────────────────────────────────────
export const stockAlertTemplate = (
  productName: string,
  currentStock: number,
  threshold: number
) => baseTemplate(`
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;background:#fef3c7;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">⚠️</div>
    <h1 style="font-size:26px;font-weight:700;color:${BRAND_NAVY};margin:16px 0 6px;">Alerte Stock Faible</h1>
    <p style="color:#64748b;font-size:14px;margin:0;">Un produit nécessite votre attention</p>
  </div>

  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin:0 0 24px;">
    <p style="color:#334155;font-size:15px;margin:0 0 8px;"><strong>Produit:</strong> ${productName}</p>
    <p style="color:#334155;font-size:15px;margin:0 0 8px;"><strong>Stock actuel:</strong> ${currentStock} unités</p>
    <p style="color:#dc2626;font-size:15px;margin:0;"><strong>Seuil d'alerte:</strong> ${threshold} unités</p>
  </div>

  ${ctaButton('📦 Gérer le stock', APP_URL + '/admin/inventory')}

  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
    Veuillez reconstituer le stock dès que possible pour éviter les ruptures.
  </p>
`, `⚠️ Alerte Stock Faible — ${productName}`);

// ─── Cart Abandonment Template ─────────────────────────────────
export const cartAbandonmentTemplate = (
  name: string,
  cartValue: number,
  itemCount: number
) => baseTemplate(`
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;background:#fef3c7;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">🛒</div>
    <h1 style="font-size:26px;font-weight:700;color:${BRAND_NAVY};margin:16px 0 6px;">Vous avez oublié quelque chose...</h1>
    <p style="color:#64748b;font-size:14px;margin:0;">Votre panier vous attend, ${name.split(' ')[0]} !</p>
  </div>

  <div style="background:#f0fdfa;border:1px solid ${BRAND_GREEN};border-radius:12px;padding:20px;margin:0 0 24px;text-align:center;">
    <p style="color:#64748b;font-size:13px;margin:0 0 8px;">Valeur de votre panier</p>
    <p style="color:${BRAND_GREEN};font-size:32px;font-weight:900;margin:0;">${cartValue.toLocaleString('fr-MA')} DH</p>
    <p style="color:#64748b;font-size:13px;margin:8px 0 0;">${itemCount} article${itemCount > 1 ? 's' : ''}</p>
  </div>

  ${ctaButton('🛍️ Finaliser ma commande', APP_URL + '/cart')}

  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
    Offre limitée — Profitez-en maintenant !
  </p>
`, `🛒 Votre panier vous attend — ${cartValue.toLocaleString('fr-MA')} DH`);

// ─── Daily Sales Report Template ───────────────────────────────
export const dailySalesReportTemplate = (
  totalSales: number,
  totalOrders: number,
  newCustomers: number,
  topProducts: Array<{ name: string; sold: number }>
) => {
  const productsRows = topProducts.slice(0, 5).map((product) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#334155;font-size:13px;">${product.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:${BRAND_GREEN};font-size:13px;font-weight:700;text-align:right;">${product.sold} vendus</td>
    </tr>
  `).join('');

  return baseTemplate(`
    <h1 style="font-size:26px;font-weight:700;color:${BRAND_NAVY};margin:0 0 8px;">Rapport Quotidien</h1>
    <p style="color:#64748b;font-size:15px;margin:0 0 24px;">Performance du ${new Date().toLocaleDateString('fr-MA')}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:16px;background:#f0fdfa;border-radius:12px;text-align:center;">
          <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Ventes Totales</p>
          <p style="color:${BRAND_GREEN};font-size:28px;font-weight:900;margin:0;">${totalSales.toLocaleString('fr-MA')} DH</p>
        </td>
        <td style="width:12px;"></td>
        <td style="padding:16px;background:#f0fdfa;border-radius:12px;text-align:center;">
          <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Commandes</p>
          <p style="color:${BRAND_NAVY};font-size:28px;font-weight:900;margin:0;">${totalOrders}</p>
        </td>
        <td style="width:12px;"></td>
        <td style="padding:16px;background:#f0fdfa;border-radius:12px;text-align:center;">
          <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Nouveaux Clients</p>
          <p style="color:${BRAND_GOLD};font-size:28px;font-weight:900;margin:0;">${newCustomers}</p>
        </td>
      </tr>
    </table>

    ${goldDivider}

    <h3 style="font-size:14px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">Top Produits</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${productsRows}
    </table>

    ${ctaButton('📊 Voir le dashboard', APP_URL + '/admin/analytics')}
  `, `📊 Rapport Quotidien — ${totalSales.toLocaleString('fr-MA')} DH`);
};

export default {
  welcomeEmailTemplate,
  orderConfirmationTemplate,
  stockAlertTemplate,
  cartAbandonmentTemplate,
  dailySalesReportTemplate,
};
