// src/lib/product-deduplication.ts
/**
 * Product Deduplication Utility
 * Ensures no duplicate products appear in the same section
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  [key: string]: any;
}

// Simple memoization cache for deduplication results
const deduplicationCache = new Map<string, any[]>();

/**
 * Remove duplicate products by ID
 * Returns only unique products, keeping the first occurrence
 * Memoized for performance
 */
export function deduplicateProducts<T extends Product>(products: T[]): T[] {
  if (!products || products.length === 0) return [];
  
  // Create cache key from product IDs
  const cacheKey = products.map(p => p.id).join(',');
  
  // Check cache
  if (deduplicationCache.has(cacheKey)) {
    return deduplicationCache.get(cacheKey) as T[];
  }
  
  const seen = new Set<string>();
  const unique: T[] = [];
  
  for (const product of products) {
    if (!product.id) continue;
    if (!seen.has(product.id)) {
      seen.add(product.id);
      unique.push(product);
    }
  }
  
  // Cache result (limit cache size to prevent memory issues)
  if (deduplicationCache.size > 100) {
    const firstKey = deduplicationCache.keys().next().value as string;
    deduplicationCache.delete(firstKey);
  }
  deduplicationCache.set(cacheKey, unique);
  
  return unique;
}

/**
 * Remove duplicate products from multiple arrays
 * Ensures no product appears in any of the provided arrays more than once
 */
export function deduplicateAcrossArrays<T extends Product>(...arrays: T[][]): T[][] {
  const seen = new Set<string>();
  
  return arrays.map((array) => {
    const unique: T[] = [];
    for (const product of array) {
      if (!product.id) continue;
      if (!seen.has(product.id)) {
        seen.add(product.id);
        unique.push(product);
      }
    }
    return unique;
  });
}

/**
 * Fill array with unique fallback products
 * Ensures no duplicates even when using fallback data
 */
export function fillWithUniqueProducts<T extends Product>(
  products: T[],
  fallback: T[],
  count: number
): T[] {
  const unique = deduplicateProducts(products);
  const seen = new Set(unique.map(p => p.id));
  
  if (unique.length >= count) {
    return unique.slice(0, count);
  }
  
  const needed = count - unique.length;
  for (const product of fallback) {
    if (unique.length >= count) break;
    if (product.id && !seen.has(product.id)) {
      seen.add(product.id);
      unique.push(product);
    }
  }
  
  return unique;
}

/**
 * Remove products that are already in an exclusion list
 * Useful for ensuring products from one section don't appear in another
 */
export function excludeProducts<T extends Product>(
  products: T[],
  excludeIds: Set<string>
): T[] {
  return products.filter(product => !excludeIds.has(product.id));
}

/**
 * Validate that an array has no duplicate product IDs
 * Returns true if valid, false if duplicates found
 */
export function validateNoDuplicates<T extends Product>(products: T[]): boolean {
  if (!products || products.length === 0) return true;
  
  const seen = new Set<string>();
  for (const product of products) {
    if (product.id && seen.has(product.id)) {
      return false;
    }
    if (product.id) seen.add(product.id);
  }
  
  return true;
}

/**
 * Find duplicate product IDs in an array
 * Returns array of duplicate IDs for debugging
 */
export function findDuplicateIds<T extends Product>(products: T[]): string[] {
  if (!products || products.length === 0) return [];
  
  const seen = new Set<string>();
  const duplicates: string[] = [];
  
  for (const product of products) {
    if (product.id && seen.has(product.id)) {
      duplicates.push(product.id);
    }
    if (product.id) seen.add(product.id);
  }
  
  return duplicates;
}

/**
 * Clear the deduplication cache
 * Useful for testing or when data changes
 */
export function clearDeduplicationCache(): void {
  deduplicationCache.clear();
}
