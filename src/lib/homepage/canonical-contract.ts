// CANONICAL HOMEPAGE DATA CONTRACT
// This is the source of truth for homepage sections
// Derived from actual homepage implementation in src/lib/homepage/registry.tsx

export interface CanonicalHomepageSection {
  // Canonical section key - used throughout the system
  key: string;
  // Section type for database/API compatibility
  sectionType: string;
  // Display title
  title: string;
  // Subtitle/description
  subtitle?: string;
  // Full description
  description?: string;
  // Component that renders this section
  component: string;
  // Default order in homepage
  order: number;
  // Default visibility state
  active: boolean;
  // Max products to display (if applicable)
  maxProducts?: number;
  // Hide if no data available
  hideIfEmpty?: boolean;
  // Destination URL for view all button
  destinationUrl?: string;
  // View all button text
  viewAllButton?: string;
  // Banner image URL
  bannerImage?: string;
  // Theme settings
  themeSettings?: Record<string, unknown>;
  // Required data source from home-data.ts
  requiredDataSource?: string;
}

/**
 * CANONICAL HOMEPAGE SECTIONS
 * This is the single source of truth for all homepage sections
 * All other layers (CMS, Builder, API, Database) must conform to this contract
 */
export const CANONICAL_HOMEPAGE_SECTIONS: CanonicalHomepageSection[] = [
  {
    key: "hero",
    sectionType: "HERO",
    title: "Hero",
    subtitle: "Featured banner carousel",
    description: "Main hero banner with slides and CTAs",
    component: "HeroSection",
    order: 0,
    active: true,
    hideIfEmpty: false,
    requiredDataSource: "cms.heroSlides",
  },
  {
    key: "categories",
    sectionType: "CATEGORIES",
    title: "Categories",
    subtitle: "Browse by category",
    description: "Category navigation with icons",
    component: "CategoriesSection",
    order: 1,
    active: false,
    hideIfEmpty: false,
    requiredDataSource: "categories",
  },
  {
    key: "showcaseGrid",
    sectionType: "SHOWCASE_GRID",
    title: "Showcase Grid",
    subtitle: "Featured collections",
    description: "Grid displaying sponsored products, bestsellers, new arrivals, and mystery boxes",
    component: "ShowcaseGridSection",
    order: 2,
    active: true,
    maxProducts: 4,
    hideIfEmpty: false,
    requiredDataSource: "cms.sponsored, cms.bestsellers, cms.newArrivals, cms.mysteryBoxes",
  },
  {
    key: "flashSale",
    sectionType: "FLASH_DEALS",
    title: "Flash Sale",
    subtitle: "Limited time offers",
    description: "Flash sale products with countdown timer",
    component: "FlashSaleSection",
    order: 3,
    active: true,
    maxProducts: 8,
    hideIfEmpty: true,
    requiredDataSource: "flashSale",
  },
  {
    key: "megaPromo",
    sectionType: "BANNER",
    title: "Mega Promo Banner",
    subtitle: "Special promotion",
    description: "Large promotional banner with products",
    component: "MegaPromoBannerSection",
    order: 4,
    active: true,
    hideIfEmpty: false,
    requiredDataSource: "cms.promos",
  },
  {
    key: "serviceBanners",
    sectionType: "SERVICE_BANNERS",
    title: "Service Banners",
    subtitle: "Trust indicators",
    description: "Service trust badges (delivery, payment, returns, etc.)",
    component: "ServiceBannersSection",
    order: 5,
    active: true,
    hideIfEmpty: false,
    requiredDataSource: "cms.serviceBanners",
  },
  {
    key: "seasonalCollection",
    sectionType: "SEASONAL_COLLECTION",
    title: "Seasonal Collection",
    subtitle: "Latest trends",
    description: "Seasonal product collection with hero image",
    component: "SeasonalCollectionSection",
    order: 6,
    active: true,
    maxProducts: 3,
    hideIfEmpty: false,
    requiredDataSource: "featured",
  },
  {
    key: "bundleBuilder",
    sectionType: "BUNDLE_DEALS",
    title: "Bundle Builder",
    subtitle: "Create your bundle",
    description: "Interactive bundle builder with discount calculator",
    component: "BundleBuilderSection",
    order: 7,
    active: true,
    maxProducts: 4,
    hideIfEmpty: false,
    requiredDataSource: "featured",
  },
  {
    key: "recommended",
    sectionType: "AI_RECOMMENDATIONS",
    title: "Recommended For You",
    subtitle: "Personalized picks",
    description: "AI-recommended products based on user behavior",
    component: "RecommendedForYouSection",
    order: 8,
    active: true,
    maxProducts: 6,
    hideIfEmpty: false,
    requiredDataSource: "API: /api/homepage/sections/recommended/products",
  },
  {
    key: "brandCarousel",
    sectionType: "BRANDS",
    title: "Brand Carousel",
    subtitle: "Top brands",
    description: "Scrolling brand carousel",
    component: "BrandCarouselSection",
    order: 9,
    active: true,
    hideIfEmpty: false,
    requiredDataSource: "cms.brands",
  },
  {
    key: "featuredProducts",
    sectionType: "FEATURED_PRODUCTS",
    title: "Featured Products",
    subtitle: "Discover our products",
    description: "Featured product grid with filters",
    component: "FeaturedProducts",
    order: 10,
    active: true,
    maxProducts: 18,
    hideIfEmpty: false,
    requiredDataSource: "discovery or featured",
  },
  {
    key: "trendingProducts",
    sectionType: "TRENDING_PRODUCTS",
    title: "Trending Products",
    subtitle: "Most popular",
    description: "Trending product grid",
    component: "TrendingSection",
    order: 11,
    active: true,
    maxProducts: 8,
    hideIfEmpty: true,
    requiredDataSource: "trending or featured",
  },
  {
    key: "mobileAppBanner",
    sectionType: "MOBILE_APP",
    title: "Mobile App Banner",
    subtitle: "Download our app",
    description: "Mobile app promotion banner with phone mockup",
    component: "MobileAppBannerSection",
    order: 12,
    active: true,
    hideIfEmpty: false,
    requiredDataSource: "cms.mobileAppBanner",
  },
  {
    key: "newsletter",
    sectionType: "NEWSLETTER",
    title: "Newsletter",
    subtitle: "Join our community",
    description: "Newsletter subscription section",
    component: "NewsletterSection",
    order: 13,
    active: true,
    hideIfEmpty: false,
    requiredDataSource: "cms.newsletter",
  },
  {
    key: "recentlyViewed",
    sectionType: "RECENTLY_VIEWED",
    title: "Recently Viewed",
    subtitle: "History",
    description: "Recently viewed products from localStorage",
    component: "RecentlyViewedSection",
    order: 14,
    active: true,
    maxProducts: 6,
    hideIfEmpty: true,
    requiredDataSource: "localStorage",
  },
  {
    key: "promotionalCards",
    sectionType: "PROMOTIONAL_CARDS",
    title: "Promotional Cards",
    subtitle: "Special offers",
    description: "Horizontal promotional card banner",
    component: "PromotionalCardsSection",
    order: 15,
    active: true,
    hideIfEmpty: false,
    requiredDataSource: "cms.promos",
  },
  {
    key: "editorsChoice",
    sectionType: "EDITORS_CHOICE",
    title: "Editor's Choice",
    subtitle: "Curated selection",
    description: "Editor's choice promotional cards (same component as promotionalCards)",
    component: "PromotionalCardsSection",
    order: 16,
    active: true,
    maxProducts: 6,
    hideIfEmpty: false,
    requiredDataSource: "API: /api/homepage/sections/editorsChoice/products",
  },
  {
    key: "bestSellers",
    sectionType: "BEST_SELLERS",
    title: "Best Sellers",
    subtitle: "Top ranking products",
    description: "Best selling products collection",
    component: "TrendingSection",
    order: 17,
    active: true,
    maxProducts: 8,
    hideIfEmpty: false,
    requiredDataSource: "cms.bestsellers",
  },
  {
    key: "newArrivals",
    sectionType: "NEW_ARRIVALS",
    title: "New Arrivals",
    subtitle: "Latest products",
    description: "Newest additions collection",
    component: "TrendingSection",
    order: 18,
    active: true,
    maxProducts: 8,
    hideIfEmpty: false,
    requiredDataSource: "cms.newArrivals",
  },
  {
    key: "superDeals",
    sectionType: "FLASH_DEALS",
    title: "Super Deals",
    subtitle: "Special promotions",
    description: "Flash sales and super deals",
    component: "FlashSaleSection",
    order: 19,
    active: true,
    maxProducts: 8,
    hideIfEmpty: false,
    requiredDataSource: "cms.superDeals",
  },
  {
    key: "bundleProducts",
    sectionType: "BUNDLE_DEALS",
    title: "Bundle Products",
    subtitle: "Create a bundle",
    description: "Interactive bundle creator",
    component: "BundleBuilderSection",
    order: 20,
    active: true,
    maxProducts: 6,
    hideIfEmpty: false,
    requiredDataSource: "cms.bundleProducts",
  },
  {
    key: "relatedProducts",
    sectionType: "AI_RECOMMENDATIONS",
    title: "Related Products",
    subtitle: "You might also like",
    description: "Related or recommended products",
    component: "RecommendedForYouSection",
    order: 21,
    active: true,
    maxProducts: 8,
    hideIfEmpty: false,
    requiredDataSource: "cms.relatedProducts",
  },
];

/**
 * Legacy key mapping for backward compatibility
 * Maps old/legacy keys to canonical keys
 */
export const LEGACY_KEY_MAPPING: Record<string, string> = {
  // Old CMS keys -> Canonical keys
  "superDeals": "superDeals",
  "super-deals": "superDeals",
  "bestSellers": "bestSellers",
  "best-sellers": "bestSellers",
  "newArrivals": "newArrivals",
  "new-arrivals": "newArrivals",
  "bundleProducts": "bundleProducts",
  "bundle-products": "bundleProducts",
  "relatedProducts": "relatedProducts",
  "related-products": "relatedProducts",
  "sponsoredProducts": "showcaseGrid",
  "popularProducts": "featuredProducts",
  "featuredBrands": "brandCarousel",
  "ourAdvantages": "serviceBanners",
  "testimonials": "serviceBanners",
  "promoBanner": "megaPromo",
  "mysteryBoxes": "showcaseGrid",
  "footer": "newsletter",
  
  // Case variations
  "hero": "hero",
  "categories": "categories",
  "flashsale": "flashSale",
  "flashDeals": "flashSale",
  "flash_deals": "flashSale",
  "flash-deals": "flashSale",
  "flash_sale": "flashSale",
  "flash-sale": "flashSale",
  "megapromo": "megaPromo",
  "servicebanners": "serviceBanners",
  "showcasegrid": "showcaseGrid",
  "showcase_grid": "showcaseGrid",
  "seasonalcollection": "seasonalCollection",
  "seasonal_collection": "seasonalCollection",
  "bundlebuilder": "bundleBuilder",
  "bundle_builder": "bundleBuilder",
  "recommended": "recommended",
  "recommendedforyou": "recommended",
  "brandcarousel": "brandCarousel",
  "brand_carousel": "brandCarousel",
  "featuredproducts": "featuredProducts",
  "featured_products": "featuredProducts",
  "featured-products": "featuredProducts",
  "trendingproducts": "trendingProducts",
  "trending_products": "trendingProducts",
  "trending": "trendingProducts",
  "mobileappbanner": "mobileAppBanner",
  "mobile_app_banner": "mobileAppBanner",
  "newsletter": "newsletter",
  "recentlyviewed": "recentlyViewed",
  "recently_viewed": "recentlyViewed",
  "promotionalcards": "promotionalCards",
  "promotional_cards": "promotionalCards",
  "editorschoice": "editorsChoice",
  "editors_choice": "editorsChoice",
  "editors-choice": "editorsChoice",
};

/**
 * Normalize any section key to canonical form
 */
export function normalizeToCanonicalKey(rawKey?: string | null): string | null {
  if (!rawKey) return null;
  
  const key = String(rawKey).trim();
  
  // Check if already canonical
  const canonical = CANONICAL_HOMEPAGE_SECTIONS.find(s => s.key === key);
  if (canonical) return key;
  
  // Check legacy mapping
  if (LEGACY_KEY_MAPPING[key]) {
    return LEGACY_KEY_MAPPING[key];
  }
  
  // Try case-insensitive match
  const lowerKey = key.toLowerCase();
  const caseMatch = CANONICAL_HOMEPAGE_SECTIONS.find(s => s.key.toLowerCase() === lowerKey);
  if (caseMatch) return caseMatch.key;
  
  // Try legacy mapping with case-insensitive
  if (LEGACY_KEY_MAPPING[lowerKey]) {
    return LEGACY_KEY_MAPPING[lowerKey];
  }
  
  return null;
}

/**
 * Get canonical section by key
 */
export function getCanonicalSection(key: string): CanonicalHomepageSection | undefined {
  const canonicalKey = normalizeToCanonicalKey(key);
  if (!canonicalKey) return undefined;
  return CANONICAL_HOMEPAGE_SECTIONS.find(s => s.key === canonicalKey);
}

/**
 * Get all canonical section keys in order
 */
export function getCanonicalSectionKeys(): string[] {
  return CANONICAL_HOMEPAGE_SECTIONS.map(s => s.key);
}

/**
 * Get canonical sections in order
 */
export function getCanonicalSections(): CanonicalHomepageSection[] {
  return [...CANONICAL_HOMEPAGE_SECTIONS];
}

/**
 * SECTION TYPE NORMALIZATION LAYER
 * Converts between camelCase (frontend) and UPPER_SNAKE_CASE (canonical/schema)
 */

/**
 * Mapping from camelCase to canonical UPPER_SNAKE_CASE section types
 * This is the single source of truth for section type normalization
 */
const CAMEL_CASE_TO_UPPER_SNAKE_CASE: Record<string, string> = {
  featuredProducts: "FEATURED_PRODUCTS",
  aiRecommendations: "AI_RECOMMENDATIONS",
  bestSellers: "BEST_SELLERS",
  brands: "BRANDS",
  whyNexmart: "WHY_NEXMART",
  testimonials: "TESTIMONIALS",
  seasonalCollection: "SEASONAL_COLLECTION",
  mobileApp: "MOBILE_APP",
  newsletter: "NEWSLETTER",
  footer: "FOOTER",
  recentlyViewed: "RECENTLY_VIEWED",
  editorsChoice: "EDITORS_CHOICE",
  promotionalCards: "PROMOTIONAL_CARDS",
  trendingProducts: "TRENDING_PRODUCTS",
  hero: "HERO",
  categories: "CATEGORIES",
  flashDeals: "FLASH_DEALS",
  bundleDeals: "BUNDLE_DEALS",
  mysteryBoxes: "MYSTERY_BOXES",
  showcaseGrid: "SHOWCASE_GRID",
  megaPromo: "BANNER",
  serviceBanners: "SERVICE_BANNERS",
  bundleBuilder: "BUNDLE_DEALS",
  recommended: "AI_RECOMMENDATIONS",
  brandCarousel: "BRANDS",
  mobileAppBanner: "MOBILE_APP",
  mysteryBox: "MYSTERY_BOXES",
  superDeals: "FLASH_DEALS",
  newArrivals: "NEW_ARRIVALS",
  sponsoredProducts: "SPONSORED_PRODUCTS",
  popularCategories: "POPULAR_CATEGORIES",
  featuredBrands: "BRANDS",
  ourAdvantages: "SERVICE_BANNERS",
  promoBanner: "BANNER",
  bundleProducts: "BUNDLE_DEALS",
  relatedProducts: "AI_RECOMMENDATIONS",
};

/**
 * Reverse mapping from UPPER_SNAKE_CASE to camelCase
 * Used for frontend rendering
 * Manually defined to ensure correct priority when multiple camelCase keys map to the same UPPER_SNAKE_CASE
 */
const UPPER_SNAKE_CASE_TO_CAMEL_CASE: Record<string, string> = {
  FEATURED_PRODUCTS: "featuredProducts",
  AI_RECOMMENDATIONS: "aiRecommendations",
  BEST_SELLERS: "bestSellers",
  BRANDS: "brands",
  WHY_NEXMART: "whyNexmart",
  TESTIMONIALS: "testimonials",
  SEASONAL_COLLECTION: "seasonalCollection",
  MOBILE_APP: "mobileApp",
  NEWSLETTER: "newsletter",
  FOOTER: "footer",
  RECENTLY_VIEWED: "recentlyViewed",
  EDITORS_CHOICE: "editorsChoice",
  PROMOTIONAL_CARDS: "promotionalCards",
  TRENDING_PRODUCTS: "trendingProducts",
  HERO: "hero",
  CATEGORIES: "categories",
  FLASH_DEALS: "flashDeals",
  BUNDLE_DEALS: "bundleDeals",
  MYSTERY_BOXES: "mysteryBoxes",
  SHOWCASE_GRID: "showcaseGrid",
  BANNER: "megaPromo",
  SERVICE_BANNERS: "serviceBanners",
  NEW_ARRIVALS: "newArrivals",
  SPONSORED_PRODUCTS: "sponsoredProducts",
  POPULAR_CATEGORIES: "popularCategories",
};

/**
 * Normalize a section type from camelCase to canonical UPPER_SNAKE_CASE
 * This should be called BEFORE Zod/schema validation
 */
export function normalizeSectionType(sectionType: string | null | undefined): string | null {
  if (!sectionType) return null;
  
  const normalized = String(sectionType).trim();
  
  // If already UPPER_SNAKE_CASE, return as-is
  if (normalized === normalized.toUpperCase() && normalized.includes("_")) {
    return normalized;
  }
  
  // Try direct mapping
  if (CAMEL_CASE_TO_UPPER_SNAKE_CASE[normalized]) {
    return CAMEL_CASE_TO_UPPER_SNAKE_CASE[normalized];
  }
  
  // Try case-insensitive mapping
  const lowerKey = normalized.toLowerCase();
  for (const [camel, upper] of Object.entries(CAMEL_CASE_TO_UPPER_SNAKE_CASE)) {
    if (camel.toLowerCase() === lowerKey) {
      return upper;
    }
  }
  
  // Try to convert camelCase to UPPER_SNAKE_CASE as fallback
  const upperSnake = normalized
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toUpperCase();
  
  return upperSnake;
}

/**
 * Denormalize a section type from UPPER_SNAKE_CASE to camelCase
 * This should be called AFTER database retrieval for frontend rendering
 */
export function denormalizeSectionType(sectionType: string | null | undefined): string | null {
  if (!sectionType) return null;
  
  const normalized = String(sectionType).trim();
  
  // If already camelCase (no underscores or not all caps), return as-is
  if (!normalized.includes("_") || normalized !== normalized.toUpperCase()) {
    return normalized;
  }
  
  // Try direct reverse mapping
  if (UPPER_SNAKE_CASE_TO_CAMEL_CASE[normalized]) {
    return UPPER_SNAKE_CASE_TO_CAMEL_CASE[normalized];
  }
  
  // Try case-insensitive reverse mapping
  const upperKey = normalized.toUpperCase();
  for (const [upper, camel] of Object.entries(UPPER_SNAKE_CASE_TO_CAMEL_CASE)) {
    if (upper.toUpperCase() === upperKey) {
      return camel;
    }
  }
  
  // Fallback: convert UPPER_SNAKE_CASE to camelCase
  return normalized
    .toLowerCase()
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Normalize an entire section object for validation/storage
 * Converts camelCase sectionType to UPPER_SNAKE_CASE
 */
export function normalizeSectionForValidation<T extends { type?: string; sectionType?: string; sectionKey?: string }>(
  section: T
): T {
  const normalized = { ...section };
  
  // Normalize type field
  if (normalized.type) {
    (normalized as any).type = normalizeSectionType(normalized.type);
  }
  
  // Normalize sectionType field
  if (normalized.sectionType) {
    normalized.sectionType = normalizeSectionType(normalized.sectionType) as any;
  }
  
  // Normalize sectionKey field (if it contains a type)
  if (normalized.sectionKey) {
    const canonical = getCanonicalSection(normalized.sectionKey);
    if (canonical) {
      (normalized as any).sectionKey = canonical.key;
      (normalized as any).sectionType = canonical.sectionType;
    }
  }
  
  return normalized;
}

/**
 * Denormalize an entire section object for frontend rendering
 * Converts UPPER_SNAKE_CASE sectionType to camelCase
 */
export function denormalizeSectionForRendering<T extends { type?: string; sectionType?: string; sectionKey?: string }>(
  section: T
): T {
  const denormalized = { ...section };
  
  // Denormalize type field
  if (denormalized.type) {
    (denormalized as any).type = denormalizeSectionType(denormalized.type);
  }
  
  // Denormalize sectionType field
  if (denormalized.sectionType) {
    (denormalized as any).sectionType = denormalizeSectionType(denormalized.sectionType) as any;
  }
  
  return denormalized;
}

/**
 * Normalize an array of sections for validation/storage
 */
export function normalizeSectionsForValidation<T extends { type?: string; sectionType?: string; sectionKey?: string }>(
  sections: T[]
): T[] {
  return sections.map(normalizeSectionForValidation);
}

/**
 * Denormalize an array of sections for frontend rendering
 */
export function denormalizeSectionsForRendering<T extends { type?: string; sectionType?: string; sectionKey?: string }>(
  sections: T[]
): T[] {
  return sections.map(denormalizeSectionForRendering);
}
