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

// ─── Password Reset Template ───────────────────────────────────
export const passwordResetTemplate = (name: string, token: string) => baseTemplate(`
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;background:#fef3c7;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">🔐</div>
    <h1 style="font-size:26px;font-weight:700;color:${BRAND_NAVY};margin:16px 0 6px;">Réinitialisation du mot de passe</h1>
    <p style="color:#64748b;font-size:14px;margin:0;">Demande reçue pour votre compte NexMart</p>
  </div>

  <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
    Bonjour ${name.split(' ')[0]}, nous avons reçu une demande de réinitialisation de votre mot de passe.
    Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
  </p>

  ${ctaButton('🔑 Réinitialiser le mot de passe', `${APP_URL}/auth/reset-password?token=${token}`)}

  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:24px 0 0;">
    Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
  </p>
`, `🔐 Réinitialisation du mot de passe — NexMart`);

// ─── Shipping Update Template ───────────────────────────────────
export const shippingUpdateTemplate = (
  name: string,
  orderNumber: string,
  trackingNumber: string,
  status: string
) => {
  const statusEmoji = status === 'SHIPPED' ? '🚚' : status === 'DELIVERED' ? '✅' : '📦';
  const statusText = status === 'SHIPPED' ? 'Expédiée' : status === 'DELIVERED' ? 'Livrée' : status;
  const statusColor = status === 'SHIPPED' ? BRAND_GREEN : status === 'DELIVERED' ? BRAND_GOLD : BRAND_NAVY;

  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#f0fdfa;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">${statusEmoji}</div>
      <h1 style="font-size:26px;font-weight:700;color:${BRAND_NAVY};margin:16px 0 6px;">Commande ${statusText}</h1>
      <p style="color:#64748b;font-size:14px;margin:0;">Votre commande #${orderNumber} a été mise à jour</p>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:0 0 24px;text-align:center;">
      <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Numéro de suivi</p>
      <p style="color:${statusColor};font-size:20px;font-weight:900;margin:0;letter-spacing:1px;">${trackingNumber || 'En attente'}</p>
    </div>

    ${status === 'SHIPPED' ? `
    <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Bonne nouvelle, ${name.split(' ')[0]} ! Votre commande a été expédiée et est en route vers vous.
      Vous recevrez une notification dès qu'elle sera livrée.
    </p>` : status === 'DELIVERED' ? `
    <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Félicitations, ${name.split(' ')[0]} ! Votre commande a été livrée avec succès.
      Merci de votre confiance !
    </p>` : `
    <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Votre commande #${orderNumber} a été mise à jour : ${statusText}.
    </p>`}

    ${ctaButton('📦 Suivre ma commande', `${APP_URL}/orders/${orderNumber}`)}
  `, `Commande ${statusText} — #${orderNumber}`);
};

// ─── Welcome Email 2 Template (24 hours after registration) ───────────────────────────────────
export const welcomeEmail2Template = (name: string) => baseTemplate(`
  <h1 style="font-size:28px;font-weight:700;color:${BRAND_NAVY};margin:0 0 8px;line-height:1.2;">
    Découvrez nos meilleures offres, ${name.split(' ')[0]} ! 🛍️
  </h1>
  <p style="color:#64748b;font-size:15px;margin:0 0 4px;">Des promotions exclusives vous attendent.</p>
  ${goldDivider}
  <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
    Maintenant que vous êtes inscrit, profitez de nos offres spéciales sur une sélection de produits premium.
    De la mode à la décoration, trouvez tout ce dont vous avez besoin à des prix imbattables.
  </p>

  <div style="background:#f0fdfa;border:1px solid ${BRAND_GREEN};border-radius:12px;padding:20px;margin:0 0 24px;">
    <p style="color:${BRAND_GREEN};font-size:16px;font-weight:700;margin:0 0 8px;">🎁 Offre du moment</p>
    <p style="color:#334155;font-size:14px;margin:0;">Jusqu'à <strong>30% de réduction</strong> sur toute la boutique</p>
  </div>

  ${ctaButton('🛍️ Voir les offres', APP_URL + '/deals')}

  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
    Offre valable pour une durée limitée.
  </p>
`, `🛍️ Découvrez nos meilleures offres — NexMart`);

// ─── Welcome Email 3 Template (72 hours after registration) ───────────────────────────────────
export const welcomeEmail3Template = (name: string) => baseTemplate(`
  <h1 style="font-size:28px;font-weight:700;color:${BRAND_NAVY};margin:0 0 8px;line-height:1.2;">
    5 astuces pour profiter au maximum de NexMart ⭐
  </h1>
  <p style="color:#64748b;font-size:15px;margin:0 0 4px;">Guide d'initiation pour ${name.split(' ')[0]}</p>
  ${goldDivider}
  <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
    Voici nos conseils pour tirer le meilleur de votre expérience shopping sur NexMart :
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
    ${[
      ['🔍', 'Recherche intelligente', 'Utilisez la recherche IA pour trouver des produits adaptés à votre style'],
      ['📱', 'Application mobile', 'Téléchargez notre app pour une expérience optimale'],
      ['💳', 'Paiement sécurisé', 'Vos données sont protégées avec CMI et Stripe'],
      ['🚚', 'Livraison express', 'Recevez vos commandes en 24-48h partout au Maroc'],
      ['⭐', 'Programme fidélité', 'Gagnez des points à chaque achat'],
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

  ${ctaButton('🎯 Explorer la boutique', APP_URL + '/products')}
`, `⭐ 5 astuces pour profiter au maximum — NexMart`);

// ─── Welcome Email 4 Template (7 days after registration) ───────────────────────────────────
export const welcomeEmail4Template = (name: string) => baseTemplate(`
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;background:#fef3c7;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">🎁</div>
    <h1 style="font-size:26px;font-weight:700;color:${BRAND_NAVY};margin:16px 0 6px;">Une offre exclusive pour vous !</h1>
    <p style="color:#64748b;font-size:14px;margin:0;">Code promo spécial pour ${name.split(' ')[0]}</p>
  </div>

  <div style="background:#f0fdfa;border:2px solid ${BRAND_GREEN};border-radius:12px;padding:24px;margin:0 0 24px;text-align:center;">
    <p style="color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Votre code promo</p>
    <p style="color:${BRAND_GREEN};font-size:32px;font-weight:900;margin:0;letter-spacing:2px;">BIENVENUE15</p>
    <p style="color:#64748b;font-size:14px;margin:8px 0 0;">15% de réduction sur votre prochaine commande</p>
  </div>

  <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
    En tant que nouveau membre, nous vous offrons ce code promo pour vous remercier de votre confiance.
    Utilisez-le lors de votre prochain achat pour bénéficier d'une réduction exclusive.
  </p>

  ${ctaButton('🛍️ Utiliser le code promo', APP_URL + '/products')}

  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
    Code valable 7 jours. Minimum d'achat : 100 DH.
  </p>
`, `🎁 Une offre exclusive pour vous — NexMart`);

// ─── Welcome Email 5 Template (14 days after registration) ───────────────────────────────────
export const welcomeEmail5Template = (name: string) => baseTemplate(`
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;background:#f0fdfa;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">🚀</div>
    <h1 style="font-size:26px;font-weight:700;color:${BRAND_NAVY};margin:16px 0 6px;">Votre avis compte !</h1>
    <p style="color:#64748b;font-size:14px;margin:0;">Aidez-nous à améliorer NexMart</p>
  </div>

  <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
    Bonjour ${name.split(' ')[0]}, cela fait maintenant deux semaines que vous avez rejoint NexMart.
    Nous aimerions connaître votre expérience pour nous aider à améliorer nos services.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
    ${[
      ['⭐', 'Noter votre expérience', 'Partagez votre avis sur nos produits et services'],
      ['💬', 'Suggérer des améliorations', 'Dites-nous ce que vous aimeriez voir sur NexMart'],
      ['📧', 'Contacter le support', 'Notre équipe est là pour vous aider 7j/7'],
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

  ${ctaButton('📝 Donner mon avis', APP_URL + '/help')}

  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
    Merci de faire partie de la communauté NexMart !
  </p>
`, `🚀 Votre avis compte — NexMart`);

// ─── Newsletter Template ───────────────────────────────────
export const newsletterTemplate = (data: {
  organizationName: string;
  subject: string;
  topProducts: any[];
  newProducts: any[];
  totalSales: number;
  totalOrders: number;
  promoBanner?: string;
}) => baseTemplate(`
  <h1 style="font-size:28px;font-weight:700;color:${BRAND_NAVY};margin:0 0 8px;line-height:1.2;">
    ${data.subject}
  </h1>
  <p style="color:#64748b;font-size:15px;margin:0 0 4px;">Newsletter hebdomadaire de ${data.organizationName}</p>
  ${goldDivider}

  ${data.promoBanner ? `
  <div style="background:linear-gradient(135deg,${BRAND_GOLD} 0%,#f59e0b 100%);border-radius:12px;padding:24px;margin:0 0 24px;text-align:center;">
    <p style="color:#fff;font-size:18px;font-weight:700;margin:0;">${data.promoBanner}</p>
  </div>` : ''}

  <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:0 0 24px;">
    <h3 style="color:${BRAND_NAVY};font-size:16px;font-weight:700;margin:0 0 12px;">📊 Statistiques de la semaine</h3>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
          <span style="color:#64748b;font-size:14px;">Ventes totales</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
          <span style="color:${BRAND_NAVY};font-weight:700;font-size:14px;">${data.totalSales.toFixed(2)} DH</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <span style="color:#64748b;font-size:14px;">Commandes</span>
        </td>
        <td style="padding:8px 0;text-align:right;">
          <span style="color:${BRAND_NAVY};font-weight:700;font-size:14px;">${data.totalOrders}</span>
        </td>
      </tr>
    </table>
  </div>

  ${data.topProducts.length > 0 ? `
  <h3 style="color:${BRAND_NAVY};font-size:18px;font-weight:700;margin:0 0 16px;">🔥 Produits populaires</h3>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    ${data.topProducts.slice(0, 3).map((product, index) => `
    <tr>
      <td style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;vertical-align:top;width:60px;">
        <img src="${product.images[0] || ''}" alt="${product.name}" style="width:100%;height:60px;object-fit:cover;border-radius:6px;">
      </td>
      <td style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;vertical-align:top;">
        <div style="font-weight:700;color:${BRAND_NAVY};font-size:14px;">${index + 1}. ${product.name}</div>
        <div style="color:${BRAND_GREEN};font-weight:700;font-size:15px;margin-top:4px;">${product.price.toFixed(2)} DH</div>
      </td>
    </tr>`).join('')}
  </table>` : ''}

  ${data.newProducts.length > 0 ? `
  <h3 style="color:${BRAND_NAVY};font-size:18px;font-weight:700;margin:0 0 16px;">✨ Nouveautés</h3>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    ${data.newProducts.slice(0, 3).map((product) => `
    <tr>
      <td style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;vertical-align:top;width:60px;">
        <img src="${product.images[0] || ''}" alt="${product.name}" style="width:100%;height:60px;object-fit:cover;border-radius:6px;">
      </td>
      <td style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;vertical-align:top;">
        <div style="font-weight:700;color:${BRAND_NAVY};font-size:14px;">${product.name}</div>
        <div style="color:${BRAND_GREEN};font-weight:700;font-size:15px;margin-top:4px;">${product.price.toFixed(2)} DH</div>
      </td>
    </tr>`).join('')}
  </table>` : ''}

  ${ctaButton('🛍️ Découvrir la boutique', APP_URL + '/products')}
`, `📬 Newsletter — ${data.organizationName}`);

// ─── Product Recommendation Template ───────────────────────────────────
export const productRecommendationTemplate = (userName: string, recommendations: any[]) => baseTemplate(`
  <h1 style="font-size:28px;font-weight:700;color:${BRAND_NAVY};margin:0 0 8px;line-height:1.2;">
    Des produits qui pourraient vous plaire ! 🎯
  </h1>
  <p style="color:#64748b;font-size:15px;margin:0 0 4px;">Sélection personnalisée pour ${userName.split(' ')[0]}</p>
  ${goldDivider}

  <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
    Basé sur vos préférences et votre historique d'achat, nous avons sélectionné ces produits spécialement pour vous.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
    ${recommendations.map((product, index) => `
    <tr>
      <td style="padding:16px;border:1px solid #e2e8f0;border-radius:12px;vertical-align:top;width:80px;">
        <img src="${product.images[0] || ''}" alt="${product.name}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;">
      </td>
      <td style="padding:16px;border:1px solid #e2e8f0;border-radius:12px;vertical-align:top;">
        <div style="font-weight:700;color:${BRAND_NAVY};font-size:15px;">${product.name}</div>
        <div style="color:#64748b;font-size:13px;margin-top:4px;">${product.category?.name || ''}</div>
        <div style="color:${BRAND_GREEN};font-weight:700;font-size:18px;margin-top:8px;">${product.price.toFixed(2)} DH</div>
      </td>
    </tr>`).join('')}
  </table>

  ${ctaButton('🛍️ Voir ces produits', APP_URL + '/products')}

  <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
    Ces recommandations sont basées sur vos préférences personnelles.
  </p>
`, `🎯 Recommandations personnalisées — NexMart`);

export default {
  welcomeEmailTemplate,
  orderConfirmationTemplate,
  stockAlertTemplate,
  cartAbandonmentTemplate,
  dailySalesReportTemplate,
  passwordResetTemplate,
  shippingUpdateTemplate,
  welcomeEmail2Template,
  welcomeEmail3Template,
  welcomeEmail4Template,
  welcomeEmail5Template,
  newsletterTemplate,
  productRecommendationTemplate,
};
