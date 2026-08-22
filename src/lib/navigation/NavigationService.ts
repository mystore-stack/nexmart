/**
 * Centralized Navigation Service
 * 
 * Single source of truth for all application routing.
 * Generates URLs based on item type and database ID/slug.
 * 
 * Supported item types:
 * - PRODUCT
 * - CATEGORY
 * - BRAND
 * - BUNDLE_DEAL
 * - MYSTERY_BOX
 * - FLASH_DEAL
 * - SUPER_DEAL
 * - PROMOTION
 * - SEARCH
 * - CHECKOUT
 * - CART
 */

export type NavigationItemType =
  | "PRODUCT"
  | "CATEGORY"
  | "BRAND"
  | "BUNDLE_DEAL"
  | "MYSTERY_BOX"
  | "FLASH_DEAL"
  | "SUPER_DEAL"
  | "PROMOTION"
  | "SEARCH"
  | "CHECKOUT"
  | "CART"
  | "ACCOUNT"
  | "HOME";

export interface NavigationItem {
  type: NavigationItemType;
  id?: string;
  slug?: string;
  query?: Record<string, string>;
  fragment?: string;
}

/**
 * Route configuration
 * Centralized route patterns for each item type
 */
const ROUTES: Record<NavigationItemType, string> = {
  PRODUCT: "/products",
  CATEGORY: "/categories",
  BRAND: "/brands",
  BUNDLE_DEAL: "/bundles",
  MYSTERY_BOX: "/mystery-box",
  FLASH_DEAL: "/flash-deals",
  SUPER_DEAL: "/super-deals",
  PROMOTION: "/promotions",
  SEARCH: "/search",
  CHECKOUT: "/checkout",
  CART: "/cart",
  ACCOUNT: "/account",
  HOME: "/",
};

/**
 * Generate URL for a navigation item
 * 
 * @param item - Navigation item with type, id/slug, and optional query params
 * @returns Full URL path
 */
export function generateUrl(item: NavigationItem): string {
  const { type, id, slug, query, fragment } = item;
  
  // Get base route for item type
  const baseRoute = ROUTES[type];
  
  // Determine identifier (prefer slug over id for SEO)
  const identifier = slug || id;
  
  // Build path
  let path: string;
  
  if (type === "HOME") {
    path = baseRoute;
  } else if (type === "SEARCH" && query?.q) {
    path = `${baseRoute}?q=${encodeURIComponent(query.q)}`;
  } else if (type === "CHECKOUT" || type === "CART" || type === "ACCOUNT") {
    path = baseRoute;
    if (id) {
      path += `/${id}`;
    }
  } else if (identifier) {
    path = `${baseRoute}/${identifier}`;
  } else {
    path = baseRoute;
  }
  
  // Add query parameters
  if (query && Object.keys(query).length > 0 && type !== "SEARCH") {
    const queryString = new URLSearchParams(query).toString();
    path += `?${queryString}`;
  }
  
  // Add fragment
  if (fragment) {
    path += `#${fragment}`;
  }
  
  return path;
}

/**
 * Generate URL for a product
 */
export function productUrl(slug: string, query?: Record<string, string>): string {
  return generateUrl({ type: "PRODUCT", slug, query });
}

/**
 * Generate URL for a category
 */
export function categoryUrl(slug: string, query?: Record<string, string>): string {
  return generateUrl({ type: "CATEGORY", slug, query });
}

/**
 * Generate URL for a brand
 */
export function brandUrl(slug: string, query?: Record<string, string>): string {
  return generateUrl({ type: "BRAND", slug, query });
}

/**
 * Generate URL for a bundle deal
 */
export function bundleDealUrl(id: string, slug?: string): string {
  return generateUrl({ type: "BUNDLE_DEAL", id, slug });
}

/**
 * Generate URL for bundle deals listing page
 */
export function bundleDealsListingUrl(): string {
  return ROUTES.BUNDLE_DEAL;
}

/**
 * Generate URL for a mystery box
 */
export function mysteryBoxUrl(id: string, slug?: string): string {
  return generateUrl({ type: "MYSTERY_BOX", id, slug });
}

/**
 * Generate URL for mystery boxes listing page
 */
export function mysteryBoxesListingUrl(): string {
  return ROUTES.MYSTERY_BOX;
}

/**
 * Generate URL for a flash deal
 */
export function flashDealUrl(id: string, slug?: string): string {
  return generateUrl({ type: "FLASH_DEAL", id, slug });
}

/**
 * Generate URL for flash deals listing page
 */
export function flashDealsListingUrl(): string {
  return ROUTES.FLASH_DEAL;
}

/**
 * Generate URL for a super deal
 */
export function superDealUrl(id: string, slug?: string): string {
  return generateUrl({ type: "SUPER_DEAL", id, slug });
}

/**
 * Generate URL for super deals listing page
 */
export function superDealsListingUrl(): string {
  return ROUTES.SUPER_DEAL;
}

/**
 * Generate URL for a promotion
 */
export function promotionUrl(id: string, slug?: string): string {
  return generateUrl({ type: "PROMOTION", id, slug });
}

/**
 * Generate URL for search
 */
export function searchUrl(query: string): string {
  return generateUrl({ type: "SEARCH", query: { q: query } });
}

/**
 * Generate URL for checkout
 */
export function checkoutUrl(step?: string): string {
  return generateUrl({ type: "CHECKOUT", id: step });
}

/**
 * Generate URL for cart
 */
export function cartUrl(): string {
  return generateUrl({ type: "CART" });
}

/**
 * Generate URL for account section
 */
export function accountUrl(section?: string): string {
  return generateUrl({ type: "ACCOUNT", id: section });
}

/**
 * Navigation hook for React components
 * Provides navigation functions for all item types
 */
export function useNavigation() {
  return {
    productUrl,
    categoryUrl,
    brandUrl,
    bundleDealUrl,
    bundleDealsListingUrl,
    mysteryBoxUrl,
    mysteryBoxesListingUrl,
    flashDealUrl,
    flashDealsListingUrl,
    superDealUrl,
    superDealsListingUrl,
    promotionUrl,
    searchUrl,
    checkoutUrl,
    cartUrl,
    accountUrl,
    generateUrl,
  };
}

/**
 * Navigation Service Class
 * For server-side usage or non-React contexts
 */
export class NavigationService {
  static generateUrl = generateUrl;
  static productUrl = productUrl;
  static categoryUrl = categoryUrl;
  static brandUrl = brandUrl;
  static bundleDealUrl = bundleDealUrl;
  static bundleDealsListingUrl = bundleDealsListingUrl;
  static mysteryBoxUrl = mysteryBoxUrl;
  static mysteryBoxesListingUrl = mysteryBoxesListingUrl;
  static flashDealUrl = flashDealUrl;
  static flashDealsListingUrl = flashDealsListingUrl;
  static superDealUrl = superDealUrl;
  static superDealsListingUrl = superDealsListingUrl;
  static promotionUrl = promotionUrl;
  static searchUrl = searchUrl;
  static checkoutUrl = checkoutUrl;
  static cartUrl = cartUrl;
  static accountUrl = accountUrl;
}
