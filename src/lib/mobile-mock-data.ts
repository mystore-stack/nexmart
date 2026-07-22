// src/lib/mobile-mock-data.ts
// Seed data used by mobile pages in development / when DB is empty.
// In production, replace these with real Prisma/API calls.

import type { Product, Category, Deal, Bundle, MysteryBox } from "@/types";

const NOW = new Date();
const inHours = (h: number) => new Date(NOW.getTime() + h * 3_600_000).toISOString();
const ago = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();

// ─── Shared category stubs ────────────────────────────────────────────────────

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Electronics",  slug: "electronics", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75", _count: { products: 124 } },
  { id: "cat-2", name: "Fashion",      slug: "fashion",     image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=75", _count: { products: 98 } },
  { id: "cat-3", name: "Home & Living",slug: "home",        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=75", _count: { products: 76 } },
  { id: "cat-4", name: "Beauty",       slug: "beauty",      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=75", _count: { products: 54 } },
  { id: "cat-5", name: "Sports",       slug: "sports",      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=75", _count: { products: 67 } },
  { id: "cat-6", name: "Books",        slug: "books",       image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=75", _count: { products: 210 } },
];

// ─── Shared product stubs ─────────────────────────────────────────────────────

const CAT_FASHION = MOCK_CATEGORIES[1];
const CAT_ELEC    = MOCK_CATEGORIES[0];
const CAT_HOME    = MOCK_CATEGORIES[2];
const CAT_BEAUTY  = MOCK_CATEGORIES[3];

function makeProduct(overrides: Partial<Product> & { id: string; name: string; slug: string; images: string[]; price: number; category: Category }): Product {
  return {
    description: "Premium quality product, handpicked by our team.",
    comparePrice: undefined,
    categoryId: overrides.category.id,
    tags: [],
    sku: `SKU-${overrides.id}`,
    stock: 50,
    lowStockAt: 5,
    published: true,
    featured: false,
    rating: 4.5,
    reviewCount: 80,
    soldCount: 200,
    variants: [],
    createdAt: ago(10),
    updatedAt: ago(2),
    ...overrides,
  };
}

export const MOCK_PRODUCTS: Product[] = [
  makeProduct({ id: "p1", name: "Linen Blazer",    slug: "linen-blazer",    price: 899,  comparePrice: 1199, images: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600&q=75"], category: CAT_FASHION, featured: true, rating: 4.8, reviewCount: 214 }),
  makeProduct({ id: "p2", name: "Silk Scarf",       slug: "silk-scarf",      price: 349,  images: ["https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=600&q=75"], category: CAT_FASHION, rating: 4.9, reviewCount: 87 }),
  makeProduct({ id: "p3", name: "Leather Tote",     slug: "leather-tote",    price: 1299, comparePrice: 1599, images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=75"], category: CAT_FASHION, featured: true, rating: 4.7, reviewCount: 156 }),
  makeProduct({ id: "p4", name: "Suede Loafers",    slug: "suede-loafers",   price: 749,  images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=75"], category: CAT_FASHION, rating: 4.6, reviewCount: 93 }),
  makeProduct({ id: "p5", name: "AirPods Pro",      slug: "airpods-pro",     price: 1079, comparePrice: 1799, images: ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&q=75"], category: CAT_ELEC, featured: true, rating: 4.9, reviewCount: 320 }),
  makeProduct({ id: "p6", name: "Smart Watch S9",   slug: "smart-watch-s9",  price: 1499, comparePrice: 2499, images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=75"], category: CAT_ELEC, rating: 4.7, reviewCount: 187, stock: 8 }),
  makeProduct({ id: "p7", name: "Wireless Speaker", slug: "wireless-speaker",price: 539,  comparePrice: 899, images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=75"], category: CAT_ELEC, rating: 4.5, reviewCount: 142 }),
  makeProduct({ id: "p8", name: "Mech Keyboard",    slug: "mech-keyboard",   price: 720,  comparePrice: 1200, images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=75"], category: CAT_ELEC, rating: 4.6, reviewCount: 98, stock: 5 }),
  makeProduct({ id: "p9", name: "Scented Candle",   slug: "scented-candle",  price: 189,  images: ["https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&q=75"], category: CAT_HOME, rating: 4.8, reviewCount: 64 }),
  makeProduct({ id: "p10",name: "Face Serum",       slug: "face-serum",      price: 299,  comparePrice: 399, images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=75"], category: CAT_BEAUTY, rating: 4.9, reviewCount: 201 }),
];

// ─── Deals ────────────────────────────────────────────────────────────────────

export const MOCK_DEALS: Deal[] = [
  { id: "d1", productId: "p5", product: MOCK_PRODUCTS[4], discountPercentage: 40, startTime: ago(1), endTime: inHours(3),  stockLimit: 50, stockRemaining: 12, active: true, createdAt: ago(1) },
  { id: "d2", productId: "p6", product: MOCK_PRODUCTS[5], discountPercentage: 40, startTime: ago(1), endTime: inHours(5),  stockLimit: 30, stockRemaining: 8,  active: true, createdAt: ago(1) },
  { id: "d3", productId: "p7", product: MOCK_PRODUCTS[6], discountPercentage: 40, startTime: ago(1), endTime: inHours(2),  stockLimit: 60, stockRemaining: 21, active: true, createdAt: ago(1) },
  { id: "d4", productId: "p8", product: MOCK_PRODUCTS[7], discountPercentage: 40, startTime: ago(1), endTime: inHours(4),  stockLimit: 25, stockRemaining: 5,  active: true, createdAt: ago(1) },
  { id: "d5", productId: "p10",product: MOCK_PRODUCTS[9], discountPercentage: 25, startTime: ago(1), endTime: inHours(6),  stockLimit: 40, stockRemaining: 18, active: true, createdAt: ago(1) },
];

// ─── Bundles ──────────────────────────────────────────────────────────────────

const BUNDLE_ITEMS_A = [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1], MOCK_PRODUCTS[3]];
const BUNDLE_TOTAL_A = BUNDLE_ITEMS_A.reduce((s, p) => s + p.price, 0);

const BUNDLE_ITEMS_B = [MOCK_PRODUCTS[4], MOCK_PRODUCTS[6]];
const BUNDLE_TOTAL_B = BUNDLE_ITEMS_B.reduce((s, p) => s + p.price, 0);

export const MOCK_BUNDLES: Bundle[] = [
  {
    id: "b1", name: "Style Starter Kit", slug: "style-starter-kit",
    description: "Everything you need to elevate your daily look.",
    products: BUNDLE_ITEMS_A, productIds: BUNDLE_ITEMS_A.map(p => p.id),
    totalPrice: BUNDLE_TOTAL_A,
    bundlePrice: Math.round(BUNDLE_TOTAL_A * 0.7),
    discount: Math.round(BUNDLE_TOTAL_A * 0.3),
    discountPercentage: 30,
    active: true, createdAt: ago(3),
  },
  {
    id: "b2", name: "Tech Essentials", slug: "tech-essentials",
    description: "Audio + wireless combo for the modern professional.",
    products: BUNDLE_ITEMS_B, productIds: BUNDLE_ITEMS_B.map(p => p.id),
    totalPrice: BUNDLE_TOTAL_B,
    bundlePrice: Math.round(BUNDLE_TOTAL_B * 0.75),
    discount: Math.round(BUNDLE_TOTAL_B * 0.25),
    discountPercentage: 25,
    active: true, createdAt: ago(5),
  },
];

// ─── Mystery Boxes ────────────────────────────────────────────────────────────

export const MOCK_MYSTERY_BOXES: MysteryBox[] = [
  {
    id: "mb1", name: "Mystery Box", slug: "mystery-box",
    description: "A curated selection of premium products handpicked by our team. Every box is a surprise.",
    price: 299,
    valueLabel: "Worth up to 500 MAD",
    possibleRewards: MOCK_PRODUCTS.slice(0, 6),
    stock: 20,
    active: true, createdAt: ago(7),
  },
  {
    id: "mb2", name: "Luxury Box", slug: "luxury-box",
    description: "Our most exclusive mystery box — ultra-premium items only.",
    price: 599,
    valueLabel: "Worth up to 1200 MAD",
    possibleRewards: MOCK_PRODUCTS.slice(4),
    stock: 8,
    active: true, createdAt: ago(4),
  },
];
