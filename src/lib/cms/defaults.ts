export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface SiteSettingsData {
  id?: string;
  organizationId?: string;
  storeName: string;
  storeTagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  businessHours: string | null;
  supportEmail: string | null;
  socialLinks: SocialLink[];
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  siteUrl: string | null;
  twitterHandle: string | null;
  locale: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string | null;
  themeColorLight: string;
  themeColorDark: string;
  currency: string;
  freeShippingThreshold: number | null;
  freeShippingMessage: string | null;
  searchPlaceholder: string | null;
  copyrightText: string | null;
}

/** Server-only bootstrap defaults — never import in client components */
export function createDefaultSiteSettings(organizationId: string): SiteSettingsData {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";
  return {
    organizationId,
    storeName: "NexMart",
    storeTagline: "Maroc · Premium",
    logoUrl: null,
    faviconUrl: "/favicon.ico",
    ogImageUrl: "/og-image.jpg",
    email: "contact@nexmart.ma",
    phone: "+212 5XX-XXXXXX",
    whatsapp: null,
    address: "Casablanca, Maroc",
    businessHours: "Lun–Sam 9h–20h",
    supportEmail: "support@nexmart.ma",
    socialLinks: [],
    seoTitle: "NexMart Maroc — Marketplace Premium",
    seoDescription:
      "NexMart est la marketplace premium du Maroc — shopping intelligent par IA, artisanat authentique, paiement sécurisé et livraison express.",
    seoKeywords: ["marketplace maroc", "shopping premium maroc", "artisanat marocain", "ecommerce maroc", "nexmart"],
    siteUrl: baseUrl,
    twitterHandle: "@nexmart_ma",
    locale: "fr_MA",
    primaryColor: "#0F766E",
    secondaryColor: "#D4AF37",
    accentColor: "#14b8a6",
    themeColorLight: "#F5F1E8",
    themeColorDark: "#0F172A",
    currency: "MAD",
    freeShippingThreshold: 500,
    freeShippingMessage: "Livraison gratuite au Maroc dès 500 MAD",
    searchPlaceholder: "Rechercher un produit...",
    copyrightText: null,
  };
}

export function mapSiteSettings(row: any): SiteSettingsData {
  return {
    id: row.id,
    organizationId: row.organizationId,
    storeName: row.storeName || "NexMart",
    storeTagline: row.storeTagline || null,
    logoUrl: row.logoUrl || null,
    faviconUrl: row.faviconUrl || null,
    ogImageUrl: row.ogImageUrl || null,
    email: row.email || null,
    phone: row.phone || null,
    whatsapp: row.whatsapp || null,
    address: row.address || null,
    businessHours: row.businessHours || null,
    supportEmail: row.supportEmail || null,
    socialLinks: (row.socialLinks as SocialLink[]) ?? [],
    seoTitle: row.seoTitle || null,
    seoDescription: row.seoDescription || null,
    seoKeywords: row.seoKeywords ?? [],
    siteUrl: row.siteUrl || null,
    twitterHandle: row.twitterHandle || null,
    locale: row.locale || "fr_MA",
    primaryColor: row.primaryColor || "#0F766E",
    secondaryColor: row.secondaryColor || "#D4AF37",
    accentColor: row.accentColor || null,
    themeColorLight: row.themeColorLight || "#F5F1E8",
    themeColorDark: row.themeColorDark || "#0F172A",
    currency: row.currency || "MAD",
    freeShippingThreshold: row.freeShippingThreshold || null,
    freeShippingMessage: row.freeShippingMessage || null,
    searchPlaceholder: row.searchPlaceholder || null,
    copyrightText: row.copyrightText || null,
  };
}
