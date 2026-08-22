import type { LuxuryProduct } from "@/components/homepage/luxury-homepage-shared";

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  price: number | { toNumber?: () => number };
  comparePrice?: number | { toNumber?: () => number } | null;
  rating?: number | null;
  reviewCount?: number | null;
  stock?: number | null;
  images?: string[] | null;
  category?: { name: string } | null;
};

type DbCategory = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  _count?: { products: number };
};

function toNumber(value: number | { toNumber?: () => number } | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value) || 0;
}

export function mapDbProductToLuxury(product: DbProduct, index = 0): LuxuryProduct {
  const price = toNumber(product.price);
  const comparePrice = product.comparePrice ? toNumber(product.comparePrice) : undefined;
  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : undefined;

  const badges = ["Nouveau", "Sélection", "Premium", "Tendance"];
  const tones: LuxuryProduct["badgeTone"][] = ["emerald", "gold", "dark"];

  return {
    id: product.id,
    title: product.name,
    href: `/products/${product.slug}`,
    image: product.images?.[0] || "/assets/hero-fallback.svg",
    price,
    oldPrice: comparePrice && comparePrice > price ? comparePrice : undefined,
    rating: product.rating ?? 4.5,
    reviews: product.reviewCount ?? 0,
    stock: product.stock ?? 0,
    badge: badges[index % badges.length],
    badgeTone: tones[index % tones.length],
    note: product.category?.name
      ? `Sélection ${product.category.name} — qualité premium vérifiée.`
      : "Produit sélectionné par notre équipe curatricielle.",
    collection: product.category?.name ?? "Collection",
    discount,
  };
}

export type CategoryCardData = {
  id: string;
  name: string;
  href: string;
  icon: string;
  count: number;
};

const CATEGORY_ICONS: Record<string, string> = {
  home: "Home",
  fashion: "Shirt",
  jewelry: "Gem",
  decor: "Lamp",
  tech: "Smartphone",
  beauty: "Sparkles",
};

export function mapDbCategoryToCard(category: DbCategory, index = 0): CategoryCardData {
  const slug = category.slug.toLowerCase();
  const iconKey = Object.keys(CATEGORY_ICONS).find((k) => slug.includes(k)) ?? "home";
  const icon = CATEGORY_ICONS[iconKey] ?? "Package";

  return {
    id: category.id,
    name: category.name,
    href: `/collections/${category.slug}`,
    icon,
    count: category._count?.products ?? 0,
  };
}
