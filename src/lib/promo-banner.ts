import type { Product } from "@/types";

export type PromoThemeColors = {
  background: string;
  surface: string;
  accent: string;
  text: string;
  cta: string;
};

export type PromoBannerPayload = {
  promo: {
    id: string;
    title: string;
    subtitle?: string | null;
    image?: string | null;
    link?: string | null;
    ctaText?: string | null;
    badgeText?: string | null;
    discountPills?: unknown;
    startDate?: string | Date | null;
    endDate?: string | Date | null;
    active?: boolean | null;
    order?: number | null;
  };
  section: {
    id: string;
    sectionKey?: string | null;
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    bannerImage?: string | null;
    destinationUrl?: string | null;
    viewAllButton?: string | null;
    maxProducts?: number | null;
    active?: boolean | null;
    order?: number | null;
  };
  products: Array<{
    id: string;
    name: string;
    slug: string;
    image: string;
    oldPrice?: number | null;
    currentPrice: number;
    rating: number;
    reviewCount: number;
    discountBadge?: string | null;
  }>;
  theme: PromoThemeColors;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  };
  isDemo: boolean;
};

export function normalizeThemeColors(input?: string | null): PromoThemeColors {
  const defaults: PromoThemeColors = {
    background: "linear-gradient(135deg, #020617 0%, #111827 50%, #1f2937 100%)",
    surface: "rgba(255,255,255,0.14)",
    accent: "#f59e0b",
    text: "#f8fafc",
    cta: "#111827",
  };

  if (!input) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(input);
    if (typeof parsed === "object" && parsed !== null) {
      return {
        background: parsed.background || defaults.background,
        surface: parsed.surface || defaults.surface,
        accent: parsed.accent || defaults.accent,
        text: parsed.text || defaults.text,
        cta: parsed.cta || defaults.cta,
      };
    }
  } catch {
    // fall through to defaults
  }

  return {
    ...defaults,
    background: input,
  };
}

export function buildPromoBannerPayload(
  promo: PromoBannerPayload["promo"] | null,
  section: PromoBannerPayload["section"] | null,
  products: PromoBannerPayload["products"] = [],
  overrides: Partial<PromoBannerPayload> = {}
): PromoBannerPayload {
  const fallbackPromo = {
    id: "fallback",
    title: "Édition premium à prix fort",
    subtitle: "Une sélection premium pensée pour les meilleures offres de la semaine.",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80",
    link: "/products",
    ctaText: "Explorer l’offre",
    badgeText: "Mega promo",
    discountPills: ["Jusqu’à -45%", "Livraison express"],
    active: true,
  };

  const fallbackSection = {
    id: "fallback-section",
    sectionKey: "megaPromo",
    title: "Mega Promo Banner",
    subtitle: "Un coup de cœur premium pour la semaine.",
    description: JSON.stringify({
      background: "linear-gradient(135deg, #020617 0%, #111827 50%, #1f2937 100%)",
      surface: "rgba(255,255,255,0.14)",
      accent: "#f59e0b",
      text: "#f8fafc",
      cta: "#111827",
    }),
    bannerImage: fallbackPromo.image,
    destinationUrl: "/products",
    viewAllButton: "Voir l’offre",
    maxProducts: 6,
    active: true,
  };

  const resolvedPromo = promo ?? fallbackPromo;
  const resolvedSection = section ?? fallbackSection;
  const resolvedProducts = products;
  const countdown = getCountdownParts(resolvedPromo.startDate, resolvedPromo.endDate);

  return {
    promo: resolvedPromo,
    section: resolvedSection,
    products: resolvedProducts,
    theme: normalizeThemeColors(resolvedSection.description || null),
    countdown,
    isDemo: !promo || !section,
    ...overrides,
  };
}

export function getCountdownParts(startDate?: Date | string | null, endDate?: Date | string | null) {
  const now = Date.now();
  const end = endDate ? new Date(endDate).getTime() : now + 1000 * 60 * 60 * 24 * 3;
  const remaining = Math.max(0, end - now);
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: remaining <= 0,
  };
}

export function getProductImage(product: Partial<Product> & { image?: string | null }, fallbackIndex = 0) {
  const candidateImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  if (candidateImages.length > 0) return candidateImages[0];
  if (product.image) return product.image;

  const fallbackImages = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  ];

  return fallbackImages[fallbackIndex % fallbackImages.length] || fallbackImages[0];
}

export function formatCurrency(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getPromoFallbackData() {
  return {
    title: "Édition premium à prix fort",
    subtitle: "Un coup de cœur de la semaine avec jusqu’à 45 % de réduction sur les indispensables du moment.",
    ctaText: "Explorer l’offre",
    link: "/products",
    badgeText: "Mega promo",
    discountPills: ["Jusqu’à -45%", "Livraison express"],
    backgroundImage: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80",
    themeColors: JSON.stringify({
      background: "from-slate-950 via-slate-900 to-stone-800",
      surface: "rgba(255,255,255,0.12)",
      accent: "#f59e0b",
      text: "#f8fafc",
      cta: "#111827",
    }),
  };
}
