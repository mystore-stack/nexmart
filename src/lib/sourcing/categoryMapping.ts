/**
 * Category mapping utility for product imports
 * Maps external category names to existing NexMart categories
 */

export interface CategoryMapping {
  externalName: string;
  internalCategoryId: string;
}

/**
 * Default category mappings for common marketplace categories
 * These should be customized based on actual categories in the database
 */
const DEFAULT_MAPPINGS: Record<string, string[]> = {
  // Tech & Electronics
  "tech": ["electronics", "smartphones", "laptops", "tablets", "computers", "gaming", "audio", "cameras", "tv", "smart home"],
  "electronics": ["electronics", "smartphones", "laptops", "tablets", "computers", "gaming", "audio", "cameras", "tv"],
  
  // Beauty & Personal Care
  "beauty": ["beauty", "skincare", "makeup", "fragrance", "hair care", "personal care"],
  "fragrance": ["beauty", "fragrance", "perfume"],
  "skincare": ["beauty", "skincare"],
  "makeup": ["beauty", "makeup", "cosmetics"],
  
  // Home & Living
  "home": ["home", "home & living", "furniture", "decor", "kitchen", "bedding", "bathroom"],
  "home & living": ["home", "home & living", "furniture", "decor"],
  "furniture": ["home", "furniture"],
  "kitchen": ["home", "kitchen", "appliances"],
  
  // Fashion & Accessories
  "fashion": ["fashion", "clothing", "men's fashion", "women's fashion", "accessories", "shoes", "jewelry"],
  "clothing": ["fashion", "clothing", "men's fashion", "women's fashion"],
  "accessories": ["fashion", "accessories", "bags", "jewelry", "watches"],
  "jewelry": ["fashion", "jewelry", "accessories"],
  "watches": ["fashion", "accessories", "watches"],
  
  // Sports & Outdoors
  "sports": ["sports", "outdoors", "fitness", "exercise", "camping", "hiking"],
  "outdoors": ["sports", "outdoors", "camping", "hiking"],
  "fitness": ["sports", "fitness", "exercise"],
  
  // Automotive
  "automotive": ["automotive", "car accessories", "motorcycle"],
  "car": ["automotive", "car accessories"],
  
  // Books & Media
  "books": ["books", "media", "education"],
  "media": ["books", "media", "entertainment"],
  
  // Lifestyle
  "lifestyle": ["lifestyle", "gadgets", "wellness", "pets"],
  "gadgets": ["tech", "electronics", "lifestyle", "gadgets"],
  "pets": ["lifestyle", "pets", "pet supplies"],
};

/**
 * Find the best matching category ID for an external category name
 * @param externalCategoryName - The category name from external source
 * @param availableCategories - Array of available categories in the database
 * @returns The matching category ID or null if no match found
 */
export function mapCategory(
  externalCategoryName: string | undefined,
  availableCategories: { id: string; name: string }[]
): string | null {
  if (!externalCategoryName) {
    return null;
  }

  const normalizedExternal = externalCategoryName.toLowerCase().trim();
  
  // Direct match first
  const directMatch = availableCategories.find(
    cat => cat.name.toLowerCase() === normalizedExternal
  );
  if (directMatch) {
    return directMatch.id;
  }

  // Check default mappings
  for (const [key, possibleMatches] of Object.entries(DEFAULT_MAPPINGS)) {
    if (possibleMatches.includes(normalizedExternal)) {
      // Find a category in our database that matches this group
      const mappedCategory = availableCategories.find(
        cat => possibleMatches.includes(cat.name.toLowerCase())
      );
      if (mappedCategory) {
        return mappedCategory.id;
      }
    }
  }

  // Partial match (contains)
  const partialMatch = availableCategories.find(
    cat => 
      normalizedExternal.includes(cat.name.toLowerCase()) ||
      cat.name.toLowerCase().includes(normalizedExternal)
  );
  if (partialMatch) {
    return partialMatch.id;
  }

  // No match found
  return null;
}

/**
 * Create category mappings from existing database categories
 * @param categories - Categories from the database
 * @returns Array of category mapping suggestions
 */
export function suggestCategoryMappings(
  categories: { id: string; name: string }[]
): CategoryMapping[] {
  const mappings: CategoryMapping[] = [];
  
  // This would typically be built from historical import data
  // For now, return empty - admin can configure mappings in UI
  
  return mappings;
}

/**
 * Get a default category for imports when no mapping is found
 * @param availableCategories - Available categories in database
 * @returns The first available category ID or null
 */
export function getDefaultCategory(
  availableCategories: { id: string; name: string }[]
): string | null {
  if (availableCategories.length === 0) {
    return null;
  }
  
  // Prefer "General" or "Miscellaneous" if available
  const generalCategory = availableCategories.find(
    cat => ["general", "miscellaneous", "other"].includes(cat.name.toLowerCase())
  );
  
  return generalCategory?.id || availableCategories[0].id;
}