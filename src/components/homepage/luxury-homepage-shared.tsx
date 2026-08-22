"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Eye,
  Heart,
  Leaf,
  MoveRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

type ImageSize =
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

const IMAGE_ENDPOINT = "https://coresg-normal.trae.ai/api/ide/v1/text_to_image";

// Use direct Unsplash image URLs
function getDirectUnsplashImage(prompt: string, imageSize: ImageSize) {
  const sizeMap = {
    square_hd: "1600",
    square: "800", 
    portrait_4_3: "800",
    portrait_16_9: "800",
    landscape_4_3: "1200",
    landscape_16_9: "1200"
  };
  
  const width = sizeMap[imageSize] || "1200";
  // Use specific Unsplash image IDs that are reliable
  const imageIds = [
    "photo-1441986300917-64674bd600d8", // luxury shopping
    "photo-1560343090-f0409e92791a", // elegant interior
    "photo-1493663284031-b7e3aefcae8e", // luxury fashion
    "photo-1558618666-fcd25c85cd64", // premium lifestyle
    "photo-1445205170230-053b83016050", // luxury home
  ];
  
  const hash = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageId = imageIds[hash % imageIds.length];
  
  return `https://images.unsplash.com/${imageId}?w=${width}&auto=format&fit=crop&q=80`;
}

export type LuxuryProduct = {
  id: string;
  title: string;
  href: string;
  image: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  stock: number;
  badge: string;
  badgeTone?: "emerald" | "gold" | "dark";
  note: string;
  collection: string;
  discount?: number;
};

export type CategoryHighlight = {
  id: string;
  name: string;
  href: string;
  image: string;
  description: string;
  stats: string;
  accent: string;
};

export type CollectionFeature = {
  id: string;
  title: string;
  href: string;
  image: string;
  description: string;
  kicker: string;
  metrics: string[];
};

export type BrandFeature = {
  id: string;
  name: string;
  href: string;
  image: string;
  story: string;
  specialty: string;
  metric: string;
};

export type TestimonialFeature = {
  id: string;
  name: string;
  city: string;
  quote: string;
  role: string;
  product: string;
  image: string;
};

export type MysteryBoxFeature = {
  id: string;
  title: string;
  href: string;
  image: string;
  price: number;
  reveal: string;
  audience: string;
  value: string;
};

export type BundleFeature = {
  id: string;
  title: string;
  href: string;
  image: string;
  price: number;
  oldPrice: number;
  saving: string;
  pieces: string[];
  note: string;
};

export type SocialFeature = {
  id: string;
  image: string;
  caption: string;
  handle: string;
  likes: string;
  comments: string;
};

export function buildLuxuryImage(prompt: string, imageSize: ImageSize) {
  // Use direct Unsplash image URLs
  return getDirectUnsplashImage(prompt, imageSize);
}

export function formatMad(value: number) {
  return `${new Intl.NumberFormat("fr-MA").format(value)} MAD`;
}

function badgeToneClasses(tone: LuxuryProduct["badgeTone"] = "gold") {
  if (tone === "emerald") {
    return "bg-emerald-900 text-emerald-50 ring-1 ring-emerald-200/20";
  }
  if (tone === "dark") {
    return "bg-stone-950 text-white ring-1 ring-white/10";
  }
  return "bg-[#c89b3c] text-white ring-1 ring-[#c89b3c]/20";
}

export function LuxurySectionHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";

  return (
    <div className={`mb-12 flex flex-col gap-7 ${centered ? "items-center text-center" : "lg:flex-row lg:items-end lg:justify-between"}`}>
      <div className={centered ? "max-w-3xl" : "max-w-3xl"}>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c89b3c]/18 bg-[#c89b3c]/7 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6722]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{eyebrow}</span>
        </div>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-stone-950 sm:text-5xl">
            {title}
          </h2>
        <div className={`mt-5 flex ${centered ? "justify-center" : "justify-start"}`}>
          <span className="gold-divider w-16" />
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
          {description}
        </p>
      </div>

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/92 px-5 py-3 text-sm font-semibold text-stone-900 shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-[#0d7a5e]/30 hover:text-[#0d7a5e]"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function LuxuryFeatureStrip({
  items,
  dark = false,
}: {
  items: Array<{ icon: LucideIcon; title: string; description: string }>;
  dark?: boolean;
}) {
  return (
    <div className={`grid gap-4 sm:grid-cols-3 ${dark ? "text-white" : ""}`}>
      {items.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className={`rounded-[24px] border px-5 py-4 ${
            dark
              ? "border-white/12 bg-white/8 backdrop-blur-xl"
              : "border-stone-200/90 bg-white/82 shadow-[0_16px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl"
          }`}
        >
          <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${dark ? "bg-white/10 text-[#f0d69d]" : "bg-[#0d7a5e]/8 text-[#0d7a5e]"}`}>
            <Icon className="h-4 w-4" />
          </div>
          <p className={`text-sm font-semibold ${dark ? "text-white" : "text-stone-950"}`}>{title}</p>
          <p className={`mt-1 text-sm leading-6 ${dark ? "text-white/70" : "text-stone-500"}`}>{description}</p>
        </div>
      ))}
    </div>
  );
}

export function LuxuryProductCard({
  product,
  emphasis = "light",
  variant = "classic",
}: {
  product: LuxuryProduct;
  emphasis?: "light" | "emerald" | "sand";
  variant?: "classic" | "gallery" | "compact";
}) {
  const emphasisClasses =
    emphasis === "emerald"
      ? "bg-[#f4faf8] border-[#0d7a5e]/12"
      : emphasis === "sand"
        ? "bg-[#fbf8f2] border-[#c89b3c]/18"
        : "bg-white border-stone-200";

  const stockRatio = Math.max(12, Math.min(100, Math.round((product.stock / 20) * 100)));
  const imageAspect =
    variant === "gallery" ? "aspect-[3/4]" : variant === "compact" ? "aspect-[4/5]" : "aspect-[4/5]";
  const showNote = variant === "classic";
  const showStockBar = variant !== "compact";

  return (
    <article className={`group overflow-hidden rounded-[32px] border ${emphasisClasses} shadow-[0_18px_46px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-2 hover:shadow-luxury-lg`}>
      <div className="h-1 w-full bg-gradient-to-r from-[#0d7a5e] via-[#c89b3c] to-transparent opacity-70" />
      <div className="relative overflow-hidden">
        <Link href={product.href} className="block">
          <div className={`relative ${imageAspect} bg-stone-100`}>
            <ImageWithFallback
              src={product.image}
              fallbackSrc="/assets/hero-fallback.svg"
              alt={product.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </Link>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${badgeToneClasses(product.badgeTone)}`}>
            {product.badge}
          </span>
          <button
            type="button"
            aria-label={`Ajouter ${product.title} aux favoris`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/85 text-stone-900 backdrop-blur transition hover:scale-105"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        {variant !== "compact" ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/26 to-transparent p-4 opacity-90">
            <div className="inline-flex rounded-full border border-white/35 bg-white/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-950 backdrop-blur">
              {product.collection}
            </div>
          </div>
        ) : null}

        {product.discount ? (
          <div className="absolute left-4 top-14 rounded-full bg-stone-950/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            -{product.discount}%
          </div>
        ) : null}
      </div>

      <div className={`space-y-4 ${variant === "compact" ? "p-4" : "p-5"}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            {variant !== "compact" ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">Sélection produit</p>
            ) : null}
            <Link href={product.href} className={`block font-semibold leading-snug text-stone-950 transition group-hover:text-[#0d7a5e] ${variant === "compact" ? "text-base" : "mt-2 text-lg"}`}>
              {product.title}
            </Link>
          </div>
          <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500">
            {product.stock} en stock
          </div>
        </div>

        {showNote ? (
          <p className="rounded-[24px] border border-stone-200/80 bg-white/82 px-4 py-3 text-sm leading-6 text-stone-600">
            {product.note}
          </p>
        ) : null}

        <div className="flex items-center gap-2 text-sm text-stone-500">
          <div className="flex items-center gap-1 text-[#c89b3c]">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-semibold text-stone-900">{product.rating.toFixed(1)}</span>
          </div>
          <span>{product.reviews} avis</span>
        </div>

        {showStockBar ? (
          <div className="rounded-[22px] border border-stone-200/70 bg-white/76 px-4 py-3">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              <span>Disponibilité</span>
              <span>{product.stock} pièces</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0d7a5e] to-[#c89b3c]"
                style={{ width: `${stockRatio}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-[-0.02em] text-stone-950">{formatMad(product.price)}</div>
            {product.oldPrice ? (
              <div className="text-sm text-stone-400 line-through">{formatMad(product.oldPrice)}</div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {variant === "classic" ? (
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-900 transition hover:border-[#0d7a5e]/30 hover:text-[#0d7a5e]"
                aria-label={`Aperçu rapide de ${product.title}`}
              >
                <Eye className="h-4 w-4" />
              </button>
            ) : null}
            <button
              type="button"
              className={`inline-flex items-center gap-2 rounded-full bg-[#0d7a5e] text-sm font-semibold text-white transition hover:bg-[#0b6a51] ${
                variant === "compact" ? "h-10 px-3.5" : "px-4 py-3"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              {variant === "compact" ? null : <span>Ajouter</span>}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export const homeLuxuryBenefits = [
  {
    icon: Truck,
    title: "Livraison premium",
    description: "Express au Maroc avec suivi concierge sur chaque commande.",
  },
  {
    icon: ShieldCheck,
    title: "Paiement securise",
    description: "Protection renforcée, paiements flexibles et achats en confiance.",
  },
  {
    icon: Leaf,
    title: "Selection responsable",
    description: "Pieces choisies pour leur savoir-faire, leur durabilite et leur provenance.",
  },
];

export const heroMetrics = [
  { value: "1 200+", label: "pièces curatées" },
  { value: "48 h", label: "livraison dans les grandes villes" },
  { value: "4,9/5", label: "satisfaction clients" },
];

export const luxuryCategories: CategoryHighlight[] = [
  {
    id: "cat-fashion",
    name: "Caftans & couture",
    href: "/collections/mode",
    image: buildLuxuryImage("luxury Moroccan fashion editorial, elegant caftan on refined woman, boutique daylight, premium ecommerce photography, crisp fabric details, natural skin tones", "portrait_4_3"),
    description: "Silhouettes signature, broderies fines et pieces de ceremonie contemporaines.",
    stats: "286 pièces selectionnées",
    accent: "from-[#0d7a5e] to-[#0a5a45]",
  },
  {
    id: "cat-home",
    name: "Maison & riad",
    href: "/collections/maison",
    image: buildLuxuryImage("luxury Moroccan riad living room, artisan rug, brass lanterns, travertine table, soft natural light, premium interior photography", "portrait_4_3"),
    description: "Textiles, tables et objets qui donnent une allure hotel particulier.",
    stats: "192 objets pour l'interieur",
    accent: "from-[#c89b3c] to-[#8b6920]",
  },
  {
    id: "cat-jewelry",
    name: "Bijoux d'atelier",
    href: "/collections/bijoux",
    image: buildLuxuryImage("premium Moroccan jewelry close-up, handmade gold and silver pieces on limestone surface, luxury fashion photography, warm sunlight", "portrait_4_3"),
    description: "Ornements sculpturaux, editions atelier et finitions precieuses.",
    stats: "134 bijoux signature",
    accent: "from-stone-900 to-stone-700",
  },
  {
    id: "cat-beauty",
    name: "Rituels bien-etre",
    href: "/collections/beaute",
    image: buildLuxuryImage("luxury Moroccan wellness still life, argan oil, rose water, ceramic bowls, spa setting, refined ecommerce styling", "portrait_4_3"),
    description: "Argan, rose et soins sensoriels inspires des hammams prives.",
    stats: "97 essentials sensoriels",
    accent: "from-[#9c6f54] to-[#6f4a36]",
  },
];

export const flashDealProducts: LuxuryProduct[] = [
  {
    id: "flash-1",
    title: "Tapis Beni Ouarain Atelier Atlas",
    href: "/products/tapis-beni-ouarain-atelier-atlas",
    image: buildLuxuryImage("luxury Moroccan rug product photography, beni ouarain carpet in elegant white living room, premium ecommerce, high detail texture", "portrait_4_3"),
    price: 2890,
    oldPrice: 3790,
    rating: 4.9,
    reviews: 148,
    stock: 6,
    badge: "Flash deal",
    badgeTone: "gold",
    note: "Edition limitée curatée ce matin pour les acheteurs deco haut de gamme.",
    collection: "Riad selection",
    discount: 24,
  },
  {
    id: "flash-2",
    title: "Caftan Noura Soie Sable",
    href: "/products/caftan-noura-soie-sable",
    image: buildLuxuryImage("premium Moroccan caftan ecommerce photo, elegant model in silk caftan, soft beige tones, luxury studio lighting", "portrait_4_3"),
    price: 4290,
    oldPrice: 5190,
    rating: 4.8,
    reviews: 92,
    stock: 4,
    badge: "Runway pick",
    badgeTone: "emerald",
    note: "La silhouette la plus ajoutée au panier par les clientes VIP cette semaine.",
    collection: "Evening edit",
    discount: 17,
  },
  {
    id: "flash-3",
    title: "Service a thé Majorelle",
    href: "/products/service-the-majorelle",
    image: buildLuxuryImage("luxury Moroccan tea set on marble table, brass tea pot, handcrafted glasses, premium ecommerce still life", "portrait_4_3"),
    price: 1190,
    oldPrice: 1590,
    rating: 4.7,
    reviews: 211,
    stock: 11,
    badge: "Gift ready",
    badgeTone: "dark",
    note: "Le cadeau signature pour mariages, pendaisons de cremailere et tables d'hotes.",
    collection: "Hosting atelier",
    discount: 25,
  },
];

export const featuredProducts: LuxuryProduct[] = [
  {
    id: "featured-1",
    title: "Suspension zellige ivoire",
    href: "/products/suspension-zellige-ivoire",
    image: buildLuxuryImage("luxury Moroccan pendant lamp product shot, zellige tiles, ivory tones, premium retail photography", "portrait_4_3"),
    price: 890,
    oldPrice: 1190,
    rating: 4.8,
    reviews: 73,
    stock: 12,
    badge: "Editor's pick",
    badgeTone: "emerald",
    note: "Parfaite pour une salle a manger minimaliste avec une touche artisanale.",
    collection: "Lighting atelier",
    discount: 25,
  },
  {
    id: "featured-2",
    title: "Babouches cuir caramel",
    href: "/products/babouches-cuir-caramel",
    image: buildLuxuryImage("premium Moroccan leather babouches on travertine floor, fashion ecommerce photography, warm caramel tones", "portrait_4_3"),
    price: 490,
    rating: 4.7,
    reviews: 128,
    stock: 18,
    badge: "Best seller",
    badgeTone: "gold",
    note: "Un essentiel lifestyle qui transforme instantanement une routine maison.",
    collection: "Daily luxury",
  },
  {
    id: "featured-3",
    title: "Miroir arch Casablanca",
    href: "/products/miroir-arch-casablanca",
    image: buildLuxuryImage("luxury Moroccan mirror product photography, arched brass mirror in refined hallway, natural light", "portrait_4_3"),
    price: 1690,
    oldPrice: 1990,
    rating: 4.9,
    reviews: 64,
    stock: 8,
    badge: "New gallery",
    badgeTone: "dark",
    note: "La piece statement qui donne une presence architecturale a l'entree.",
    collection: "Hallway icons",
    discount: 15,
  },
  {
    id: "featured-4",
    title: "Plateau marbre Taznakht",
    href: "/products/plateau-marbre-taznakht",
    image: buildLuxuryImage("luxury marble serving tray with Moroccan brass details, ecommerce still life, premium styling", "portrait_4_3"),
    price: 740,
    rating: 4.8,
    reviews: 117,
    stock: 15,
    badge: "Concierge pick",
    badgeTone: "emerald",
    note: "Ideal pour dresser un cafe d'accueil ou un rituel apéritif raffine.",
    collection: "Hosting atelier",
  },
  {
    id: "featured-5",
    title: "Coussin brodé Atlas",
    href: "/products/coussin-brode-atlas",
    image: buildLuxuryImage("luxury Moroccan embroidered cushion on linen sofa, premium interior photography, sand tones", "portrait_4_3"),
    price: 580,
    oldPrice: 720,
    rating: 4.9,
    reviews: 89,
    stock: 22,
    badge: "Coup de coeur",
    badgeTone: "gold",
    note: "Broderie artisanale et texture douce pour un salon d'exception.",
    collection: "Textile layer",
    discount: 19,
  },
  {
    id: "featured-6",
    title: "Bracelet filigrane Fès",
    href: "/products/bracelet-filigrane-fes",
    image: buildLuxuryImage("luxury Moroccan filigree bracelet on velvet, jewelry ecommerce photography, warm gold light", "portrait_4_3"),
    price: 1290,
    rating: 4.8,
    reviews: 56,
    stock: 9,
    badge: "Atelier",
    badgeTone: "dark",
    note: "Filigrane d'orfèvre, pièce unique pour les amateurs de bijoux d'exception.",
    collection: "Jewelry atelier",
  },
  {
    id: "featured-7",
    title: "Table basse zellige",
    href: "/products/table-basse-zellige",
    image: buildLuxuryImage("luxury Moroccan zellige tile coffee table in modern living room, premium furniture photo", "portrait_4_3"),
    price: 3490,
    oldPrice: 3990,
    rating: 4.9,
    reviews: 34,
    stock: 4,
    badge: "Statement",
    badgeTone: "emerald",
    note: "Zellige artisanal sur base travertine — pièce architecturale pour le salon.",
    collection: "Interior icons",
    discount: 13,
  },
  {
    id: "featured-8",
    title: "Huile d'argan prestige",
    href: "/products/huile-argan-prestige",
    image: buildLuxuryImage("luxury Moroccan argan oil bottles in ceramic dish, wellness ecommerce still life, golden light", "portrait_4_3"),
    price: 290,
    rating: 4.7,
    reviews: 203,
    stock: 31,
    badge: "Best seller",
    badgeTone: "gold",
    note: "Pression à froid, origine Essaouira — rituel bien-être quotidien.",
    collection: "Scented moments",
  },
];

export const trendingProducts: LuxuryProduct[] = [
  {
    id: "trending-1",
    title: "Canapé modulable Riad Line",
    href: "/products/canape-modulable-riad-line",
    image: buildLuxuryImage("luxury Moroccan modular sofa in modern riad interior, premium furniture photography, creamy palette", "portrait_4_3"),
    price: 6890,
    oldPrice: 7590,
    rating: 4.9,
    reviews: 59,
    stock: 5,
    badge: "Trending now",
    badgeTone: "emerald",
    note: "Repéré dans les wishlists design et chez les architectes d'interieur.",
    collection: "Interior icons",
    discount: 9,
  },
  {
    id: "trending-2",
    title: "Parure Mina vert emeraude",
    href: "/products/parure-mina-vert-emeraude",
    image: buildLuxuryImage("luxury Moroccan jewelry set emerald green, editorial ecommerce photography, elegant gold details", "portrait_4_3"),
    price: 2190,
    rating: 4.8,
    reviews: 104,
    stock: 9,
    badge: "Social favorite",
    badgeTone: "gold",
    note: "Une palette emeraude qui revient dans les paniers mode et mariage.",
    collection: "Jewelry atelier",
  },
  {
    id: "trending-3",
    title: "Plaid en laine Chefchaouen",
    href: "/products/plaid-laine-chefchaouen",
    image: buildLuxuryImage("premium Moroccan wool throw blanket, cozy luxury interior photography, blue and ivory tones", "portrait_4_3"),
    price: 990,
    oldPrice: 1240,
    rating: 4.7,
    reviews: 142,
    stock: 14,
    badge: "Winter edit",
    badgeTone: "dark",
    note: "Le textile le plus partage dans nos inspirations deco de saison.",
    collection: "Textile layer",
    discount: 20,
  },
];

export const newArrivalProducts: LuxuryProduct[] = [
  {
    id: "new-1",
    title: "Vase travertin Essaouira",
    href: "/products/vase-travertin-essaouira",
    image: buildLuxuryImage("luxury travertine vase in Moroccan styled interior, premium ecommerce still life, minimalist composition", "portrait_4_3"),
    price: 620,
    rating: 4.9,
    reviews: 24,
    stock: 13,
    badge: "Just dropped",
    badgeTone: "gold",
    note: "Arrive dans une serie courte pour composer une table basse couture.",
    collection: "New arrivals",
  },
  {
    id: "new-2",
    title: "Kimono lounge Atlas cream",
    href: "/products/kimono-lounge-atlas-cream",
    image: buildLuxuryImage("luxury Moroccan inspired lounge kimono, elegant woman in premium interior, soft cream palette", "portrait_4_3"),
    price: 790,
    rating: 4.8,
    reviews: 31,
    stock: 7,
    badge: "Fresh studio",
    badgeTone: "emerald",
    note: "Une allure maison-hotel pour des mornings tres soignes.",
    collection: "Resort lounge",
  },
  {
    id: "new-3",
    title: "Encensoir cuivre Kasbah",
    href: "/products/encensoir-cuivre-kasbah",
    image: buildLuxuryImage("luxury Moroccan incense burner in hammered copper, moody premium ecommerce photography", "portrait_4_3"),
    price: 360,
    rating: 4.7,
    reviews: 18,
    stock: 19,
    badge: "New ritual",
    badgeTone: "dark",
    note: "La nouvelle piece sensorielle qui accompagne nos coffrets bien-etre.",
    collection: "Scented moments",
  },
];

export const aiRecommendationProducts: LuxuryProduct[] = [
  {
    id: "ai-1",
    title: "Fauteuil cuir cognac Medina",
    href: "/products/fauteuil-cuir-cognac-medina",
    image: buildLuxuryImage("luxury Moroccan leather armchair in premium living room, cognac tones, designer ecommerce photography", "portrait_4_3"),
    price: 4590,
    oldPrice: 5190,
    rating: 4.9,
    reviews: 41,
    stock: 3,
    badge: "98% match",
    badgeTone: "emerald",
    note: "Recommande si vous aimez les matières naturelles, les volumes sculptés et le calme visuel.",
    collection: "AI concierge",
    discount: 12,
  },
  {
    id: "ai-2",
    title: "Set table cannage Sahara",
    href: "/products/set-table-cannage-sahara",
    image: buildLuxuryImage("premium Moroccan dining set with caned chairs and travertine table, bright editorial interior", "portrait_4_3"),
    price: 3890,
    rating: 4.8,
    reviews: 53,
    stock: 6,
    badge: "For your home",
    badgeTone: "gold",
    note: "Selectionnee a partir de vos paniers deco, de vos consultations riad et de vos favoris beige.",
    collection: "AI concierge",
  },
  {
    id: "ai-3",
    title: "Parfum d'interieur Fleur d'oranger",
    href: "/products/parfum-interieur-fleur-oranger",
    image: buildLuxuryImage("luxury home fragrance bottle with orange blossom styling, premium ecommerce still life", "portrait_4_3"),
    price: 340,
    rating: 4.7,
    reviews: 76,
    stock: 17,
    badge: "High affinity",
    badgeTone: "dark",
    note: "Le format ideal pour prolonger l'univers sensoriel que vous consultez le plus souvent.",
    collection: "AI concierge",
  },
];

export const luxuryCollections: CollectionFeature[] = [
  {
    id: "collection-1",
    title: "The Riad Reset",
    href: "/collections/riad",
    image: buildLuxuryImage("luxury Moroccan riad suite interior, serene beige palette, artisan furniture, premium editorial photography", "landscape_4_3"),
    description: "Une selection pour habiller un interieur avec douceur minérale, cuivre et tissage noble.",
    kicker: "Interiors curated like boutique hotels",
    metrics: ["19 pièces icones", "Palette sable & emeraude", "Livraison white-glove"],
  },
  {
    id: "collection-2",
    title: "Ceremony Dressing",
    href: "/collections/ceremony",
    image: buildLuxuryImage("luxury Moroccan ceremony fashion editorial, elegant woman in refined caftan, premium ecommerce banner", "landscape_4_3"),
    description: "Looks de fete, silhouettes couture et accessoires prets a faire sensation.",
    kicker: "Designed for weddings, Eid and elevated evenings",
    metrics: ["34 tenues signature", "Essayage guide", "Retouches conseillees"],
  },
  {
    id: "collection-3",
    title: "Golden Hosting",
    href: "/collections/hosting",
    image: buildLuxuryImage("luxury Moroccan hosting table, brass tea set, artisan ceramics, evening ambient light, premium lifestyle photo", "landscape_4_3"),
    description: "Tout pour recevoir comme un riad prive, du plateau marbre au verre soufflé.",
    kicker: "A hosting collection with ceremony and warmth",
    metrics: ["Service de table premium", "Gift-ready pieces", "Top rated by hosts"],
  },
];

export const bundleDeals: BundleFeature[] = [
  {
    id: "bundle-1",
    title: "Salon Signature",
    href: "/bundles/salon-signature",
    image: buildLuxuryImage("luxury Moroccan living room bundle, rug, lantern, side table, premium ecommerce banner", "landscape_4_3"),
    price: 5290,
    oldPrice: 6490,
    saving: "Economisez 1 200 MAD",
    pieces: ["Tapis texturé", "Lanternes martelées", "Plateau travertin"],
    note: "Pensé pour transformer un coin salon en scène d'accueil luxueuse.",
  },
  {
    id: "bundle-2",
    title: "Morning Ritual",
    href: "/bundles/morning-ritual",
    image: buildLuxuryImage("premium Moroccan morning ritual bundle, ceramics, tea set, wellness objects, elegant sunlight", "landscape_4_3"),
    price: 1890,
    oldPrice: 2410,
    saving: "Economisez 520 MAD",
    pieces: ["Service a cafe", "Plateau laiton", "Parfum d'ambiance"],
    note: "Le set qui donne une allure boutique-hotel a vos matins a la maison.",
  },
];

export const mysteryBoxes: MysteryBoxFeature[] = [
  {
    id: "mystery-1",
    title: "Coffret Maison d'hote",
    href: "/mystery/maison-d-hote",
    image: buildLuxuryImage("luxury gift box with Moroccan home decor objects, premium unboxing photography, warm neutral palette", "landscape_4_3"),
    price: 1290,
    reveal: "Valeur moyenne 2 000 MAD",
    audience: "Pour les amateurs d'interieurs apaises",
    value: "4 à 6 objets premium",
  },
  {
    id: "mystery-2",
    title: "Coffret Couture Privée",
    href: "/mystery/couture-privee",
    image: buildLuxuryImage("luxury mystery fashion box with Moroccan couture accessories, elegant packaging, premium ecommerce photography", "landscape_4_3"),
    price: 1890,
    reveal: "Valeur moyenne 2 850 MAD",
    audience: "Pour les clientes ceremonies et dressing couture",
    value: "3 à 5 pièces exclusives",
  },
  {
    id: "mystery-3",
    title: "Coffret Sensoriel",
    href: "/mystery/sensoriel",
    image: buildLuxuryImage("luxury Moroccan wellness gift box with oils, candles and ceramics, premium still life photo", "landscape_4_3"),
    price: 890,
    reveal: "Valeur moyenne 1 450 MAD",
    audience: "Pour les rituels bien-etre et cadeaux attentionnes",
    value: "5 essentiels sensoriels",
  },
];

export const superDeals: LuxuryProduct[] = [
  {
    id: "super-1",
    title: "Banquette cuir Tamesloht",
    href: "/products/banquette-cuir-tamesloht",
    image: buildLuxuryImage("luxury Moroccan leather bench product photography, premium interior styling, earthy tones", "portrait_4_3"),
    price: 2390,
    oldPrice: 3290,
    rating: 4.8,
    reviews: 39,
    stock: 2,
    badge: "Last units",
    badgeTone: "dark",
    note: "Le pricing engine anticipe une hausse sur cette reference tres demandee.",
    collection: "Urgent edit",
    discount: 27,
  },
  {
    id: "super-2",
    title: "Lanterne facettes Rabat",
    href: "/products/lanterne-facettes-rabat",
    image: buildLuxuryImage("premium Moroccan lantern product shot, faceted brass lantern glowing warmly, luxury ecommerce", "portrait_4_3"),
    price: 540,
    oldPrice: 790,
    rating: 4.7,
    reviews: 98,
    stock: 5,
    badge: "High demand",
    badgeTone: "gold",
    note: "L'une des meilleures opportunites prix avant le prochain restock atelier.",
    collection: "Urgent edit",
    discount: 32,
  },
  {
    id: "super-3",
    title: "Pouf tissé monochrome",
    href: "/products/pouf-tisse-monochrome",
    image: buildLuxuryImage("luxury woven Moroccan pouf in modern interior, monochrome palette, premium product photography", "portrait_4_3"),
    price: 690,
    oldPrice: 980,
    rating: 4.8,
    reviews: 67,
    stock: 7,
    badge: "Price alert",
    badgeTone: "emerald",
    note: "Notre moteur detecte ici le meilleur rapport desirabilité/prix du moment.",
    collection: "Urgent edit",
    discount: 30,
  },
];

export const featuredBrands: BrandFeature[] = [
  {
    id: "brand-1",
    name: "Maison Atlas",
    href: "/brands/maison-atlas",
    image: buildLuxuryImage("luxury Moroccan atelier portrait, artisan arranging premium rugs, refined workshop photography", "landscape_4_3"),
    story: "Une maison reconnue pour ses tapis texturés et sa palette minérale.",
    specialty: "Textiles d'interieur",
    metric: "4,9/5 satisfaction",
  },
  {
    id: "brand-2",
    name: "Atelier Naya",
    href: "/brands/atelier-naya",
    image: buildLuxuryImage("luxury Moroccan fashion atelier, designer fitting elegant caftan, premium editorial brand photography", "landscape_4_3"),
    story: "Studio couture qui marie lignes pures, broderies légères et allure contemporaine.",
    specialty: "Mode ceremonie",
    metric: "Top panier mariage",
  },
  {
    id: "brand-3",
    name: "Riad Objects",
    href: "/brands/riad-objects",
    image: buildLuxuryImage("premium Moroccan home decor brand photography, curated objects on stone shelves, luxury ecommerce lookbook", "landscape_4_3"),
    story: "Objets sculpturaux pour riads modernes et maisons a la mise en scene soignee.",
    specialty: "Decor architecture",
    metric: "Nouvelle marque montante",
  },
];

export const testimonials: TestimonialFeature[] = [
  {
    id: "testimonial-1",
    name: "Sara B.",
    city: "Casablanca",
    quote: "Enfin une homepage qui donne envie de tout explorer. Les sélections sont cohérentes, luxueuses et vraiment utiles pour décider vite.",
    role: "Architecte d'interieur",
    product: "Riad Reset",
    image: buildLuxuryImage("elegant Moroccan woman portrait, natural luxury styling, warm light, premium customer portrait photography", "square_hd"),
  },
  {
    id: "testimonial-2",
    name: "Mehdi A.",
    city: "Rabat",
    quote: "Chaque produit paraît mieux présenté que dans un concept store physique. Le niveau de détail sur les matières met immédiatement en confiance.",
    role: "Entrepreneur",
    product: "Salon Signature",
    image: buildLuxuryImage("refined Moroccan man portrait, premium lifestyle photography, neutral background, soft light", "square_hd"),
  },
  {
    id: "testimonial-3",
    name: "Nadia E.",
    city: "Marrakech",
    quote: "J'ai adoré la sensation d'un ecommerce éditorial, pas d'un simple catalogue. On sent une vraie direction artistique derrière chaque section.",
    role: "Creative consultant",
    product: "Ceremony Dressing",
    image: buildLuxuryImage("luxury Moroccan woman portrait, editorial beauty lighting, sophisticated styling", "square_hd"),
  },
];

export const instagramMoments: SocialFeature[] = [
  {
    id: "social-1",
    image: buildLuxuryImage("luxury Moroccan breakfast table on terrace, artisan ceramics, golden hour, social media style premium photo", "square_hd"),
    caption: "Morning ritual in Marrakech light.",
    handle: "@nexmart.ma",
    likes: "2,4k",
    comments: "86",
  },
  {
    id: "social-2",
    image: buildLuxuryImage("premium Moroccan fashion editorial with caftan in riad courtyard, luxury social content", "square_hd"),
    caption: "Ceremony dressing, refined.",
    handle: "@nexmart.ma",
    likes: "3,1k",
    comments: "112",
  },
  {
    id: "social-3",
    image: buildLuxuryImage("luxury Moroccan home decor vignette, rug, lantern and travertine table, premium social photography", "square_hd"),
    caption: "A corner styled like a boutique hotel.",
    handle: "@nexmart.ma",
    likes: "1,8k",
    comments: "64",
  },
  {
    id: "social-4",
    image: buildLuxuryImage("luxury Moroccan gift wrapping and artisan products, elegant ecommerce lifestyle shot", "square_hd"),
    caption: "Gift-ready pieces for elevated hosting.",
    handle: "@nexmart.ma",
    likes: "2,9k",
    comments: "91",
  },
];

export const homeHeaderLinks = [
  { label: "Collections", href: "/collections" },
  { label: "Nouveautés", href: "/collections/new" },
  { label: "Marques", href: "/brands" },
  { label: "Journal", href: "/blog" },
];

export const footerConciergeLinks = [
  { label: "Service client", href: "/help" },
  { label: "Livraison", href: "/shipping" },
  { label: "Retours", href: "/returns" },
  { label: "WhatsApp", href: "/contact" },
];

export function LuxuryEditorialCallout({
  title,
  description,
  href,
  label,
  image,
  overline,
}: {
  title: string;
  description: string;
  href: string;
  label: string;
  image: string;
  overline: string;
}) {
  return (
    <div className="grid overflow-hidden rounded-[38px] border border-stone-200/90 bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f2_100%)] shadow-luxury lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex flex-col justify-between p-8 sm:p-10">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0d7a5e]/12 bg-[#0d7a5e]/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0d7a5e]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{overline}</span>
          </div>
          <h3 className="font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-stone-950 sm:text-4xl">
            {title}
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600 sm:text-base">
            {description}
          </p>
        </div>
        <Link
          href={href}
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-stone-950 transition hover:text-[#0d7a5e]"
        >
          <span>{label}</span>
          <MoveRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="relative min-h-[320px] bg-stone-100">
        <ImageWithFallback
          src={image}
          fallbackSrc="/assets/hero-fallback.svg"
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/72 via-stone-950/8 to-transparent p-6">
          <div className="inline-flex rounded-full border border-white/18 bg-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0d69d] backdrop-blur">
            Merchandising de luxe
          </div>
        </div>
      </div>
    </div>
  );
}
