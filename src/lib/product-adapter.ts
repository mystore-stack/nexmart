// lib/product-adapter.ts
// Central function to normalize products for mobile app contract
// Matches mockServer.js slim() function format

// Simple emoji mapping for categories (fallback)
const CATEGORY_EMOJIS: Record<string, string> = {
  'mode': '👗',
  'beaute': '💄',
  'high-tech': '📱',
  'maison': '🏠',
  'sport': '⚽',
  'alimentation': '🍎',
  'livres': '📚',
  'jouets': '🧸',
  'auto': '🚗',
  'default': '📦',
};

function getCategoryEmoji(slug?: string): string {
  if (!slug) return CATEGORY_EMOJIS.default;
  const key = slug.toLowerCase();
  return CATEGORY_EMOJIS[key] || CATEGORY_EMOJIS.default;
}

export interface AppProduct {
  id: string;
  title: string;            // Texte simple (jamais un objet {fr,ar})
  name: string;             // même valeur que title (compatibilité)
  description: string;
  price: number;            // nombre, pas une chaîne
  oldPrice: number | null;
  images: string[];         // URLs https absolues ; image principale en premier
  image: string;            // = images[0]
  rating: number;           // moyenne réelle des avis vérifiés, 0 si aucun
  reviewsCount: number;
  stock: number;
  categoryId: string;
  category: { id: string; name: string };
  brand: string | null;
  tags: string[];
  discount?: number;
  currency?: string;
  emoji?: string;
}

export interface AppCategory {
  id: string;
  name: string;
  image?: string;
  productsCount?: number;
}

/**
 * Normalize a database product to mobile app format
 * @param row - Product from database (Prisma Product model)
 * @param reviews - Array of reviews for this product (optional, for real rating calculation)
 * @param lang - Language code ('fr' | 'ar'), defaults to 'fr'
 * @returns Normalized product matching mobile app contract
 */
export function toAppProduct(
  row: any,
  reviews: any[] = [],
  lang: 'fr' | 'ar' = 'fr'
): AppProduct {
  if (!row) {
    throw new Error('toAppProduct: row is required');
  }

  // Calculate real rating from reviews
  let rating = 0;
  let reviewsCount = 0;
  if (reviews && reviews.length > 0) {
    const verifiedReviews = reviews.filter((r: any) => r.verifiedPurchase);
    if (verifiedReviews.length > 0) {
      const sum = verifiedReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
      rating = sum / verifiedReviews.length;
      reviewsCount = verifiedReviews.length;
    }
  }

  // Calculate discount from comparePrice
  const oldPrice = row.comparePrice || null;
  const discount = oldPrice && oldPrice > row.price
    ? Math.round((1 - row.price / oldPrice) * 100)
    : 0;

  // Extract brand from brand object or tags
  const brand = row.brand?.name || (row.tags?.find((t: string) => t.match(/^[A-Z]/)) || null);

  // Ensure images array is valid
  const images = Array.isArray(row.images) ? row.images : [];
  const image = images.length > 0 ? images[0] : '';

  // Get category emoji
  const emoji = getCategoryEmoji(row.category?.slug);

  // Normalize category name (should be string, not object)
  const categoryName = typeof row.category?.name === 'string'
    ? row.category.name
    : (row.category?.name?.[lang] || row.category?.name?.fr || row.category?.name?.ar || row.category?.slug || 'Catégorie');

  return {
    id: row.id,
    title: row.name || row.slug || 'Produit sans nom',
    name: row.name || row.slug || 'Produit sans nom',
    description: row.description || '',
    price: Number(row.price) || 0,
    oldPrice: oldPrice ? Number(oldPrice) : null,
    images,
    image,
    rating: Math.round(rating * 10) / 10, // Round to 1 decimal
    reviewsCount,
    stock: Number(row.stock) || 0,
    categoryId: row.categoryId || '',
    category: {
      id: row.category?.id || '',
      name: categoryName,
    },
    brand,
    tags: Array.isArray(row.tags) ? row.tags : [],
    discount,
    currency: 'MAD',
    emoji,
  };
}

/**
 * Normalize a category to mobile app format
 * @param row - Category from database
 * @param productsCount - Optional count of products in this category
 * @returns Normalized category
 */
export function toAppCategory(row: any, productsCount?: number): AppCategory {
  if (!row) {
    throw new Error('toAppCategory: row is required');
  }

  const name = typeof row.name === 'string'
    ? row.name
    : (row.name?.fr || row.name?.ar || row.slug || 'Catégorie');

  return {
    id: row.id,
    name,
    image: row.image || undefined,
    productsCount,
  };
}

/**
 * Batch normalize products with reviews
 * @param products - Array of products from database
 * @param reviewsMap - Map of productId -> reviews array
 * @param lang - Language code
 * @returns Array of normalized products
 */
export function toAppProducts(
  products: any[],
  reviewsMap: Map<string, any[]> = new Map(),
  lang: 'fr' | 'ar' = 'fr'
): AppProduct[] {
  return products.map(p => toAppProduct(p, reviewsMap.get(p.id) || [], lang));
}
