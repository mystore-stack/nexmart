// src/lib/image-optimization.ts - Image optimization utilities
/**
 * Image optimization strategy:
 * 1. Use Next.js Image component for automatic optimization
 * 2. Specify sizes for responsive images
 * 3. Use priority for above-the-fold images
 * 4. Lazy load for below-the-fold images
 * 5. Provide alt text for accessibility
 * 6. Use WebP formats when available
 */

export const imageSizes = {
  // Mobile cards (2 columns)
  mobileCard: "(max-width: 640px) 50vw, 25vw",

  // Tablet cards (2-3 columns)
  tabletCard: "(max-width: 1024px) 50vw, 33vw",

  // Desktop cards (4+ columns)
  desktopCard: "(max-width: 1280px) 33vw, 25vw",

  // Hero images
  hero: "100vw",

  // Full width
  fullWidth: "100vw",

  // Thumbnail
  thumbnail: "80px",

  // Avatar
  avatar: "40px",

  // Background
  background: "100vw",
};

export const imageFormats = {
  webp: "image/webp",
  avif: "image/avif",
  jpeg: "image/jpeg",
  png: "image/png",
};

/**
 * Get optimized image alt text
 */
export function getImageAltText(
  productName: string,
  type: "product" | "category" | "hero" | "collection" = "product"
): string {
  switch (type) {
    case "product":
      return `${productName} product image`;
    case "category":
      return `${productName} category image`;
    case "hero":
      return `${productName} hero banner`;
    case "collection":
      return `${productName} collection image`;
    default:
      return productName;
  }
}

/**
 * Image optimization presets
 */
export const imagePresets = {
  // Product cards - optimized for ecommerce
  productCard: {
    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
    quality: 80, // Good balance of quality and size
    priority: false, // Lazy load by default
  },

  // Hero images - high quality
  hero: {
    sizes: "100vw",
    quality: 85, // Slightly higher quality
    priority: true, // Load immediately
  },

  // Thumbnails - smaller
  thumbnail: {
    sizes: "100px",
    quality: 75,
    priority: false,
  },

  // Category images
  category: {
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    quality: 80,
    priority: false,
  },
};

/**
 * Image loading strategy
 */
export const imageLoadingStrategy = {
  // Above-the-fold images
  hero: "eager",
  featured: "eager",

  // Below-the-fold images
  grid: "lazy",
  carousel: "lazy",
  related: "lazy",
} as const;

export type ImageLoadingStrategy = typeof imageLoadingStrategy;
