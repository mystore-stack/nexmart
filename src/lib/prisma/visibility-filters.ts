/**
 * Reusable visibility filter helpers for Prisma queries
 * Prevents hardcoding field names and ensures consistency with schema.prisma
 */

export interface ModelVisibilityConfig {
  visibilityField?: 'isVisible' | 'isActive' | 'enabled' | 'active';
  publishingField?: 'isPublished' | 'published';
  statusField?: 'status';
  displayOrderField?: 'displayOrder' | 'order';
}

// Model-specific visibility configurations based on schema.prisma
export const MODEL_VISIBILITY_CONFIG: Record<string, ModelVisibilityConfig> = {
  // Uses isActive + isPublished + status
  HeroBanner: {
    visibilityField: 'isActive',
    publishingField: 'isPublished',
    statusField: 'status',
    displayOrderField: 'displayOrder',
  },
  
  // Uses isVisible + isPublished + status
  AnnouncementBar: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
    statusField: 'status',
    displayOrderField: 'displayOrder',
  },
  
  // Uses isActive + status
  HomepageConfig: {
    visibilityField: 'isActive',
    statusField: 'status',
  },
  
  // Uses isVisible + isPublished
  FooterConfig: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
    displayOrderField: 'displayOrder',
  },
  
  // Uses isVisible + isPublished
  Testimonial: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
    displayOrderField: 'displayOrder',
  },
  
  // Uses isActive
  NavigationMenu: {
    visibilityField: 'isActive',
  },
  
  // Uses isVisible + isPublished
  NavigationMenuItem: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
    displayOrderField: 'displayOrder',
  },
  
  // Uses isVisible + isPublished
  Brand: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
    displayOrderField: 'displayOrder',
  },
  
  // Uses isVisible + isPublished
  FeaturedCategory: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
  },
  
  // Uses isVisible + isPublished
  SuperDeal: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
    displayOrderField: 'displayOrder',
  },
  
  // Uses isVisible + isPublished
  BundleDeal: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
    displayOrderField: 'displayOrder',
  },
  
  // Uses isVisible + isPublished + status
  FlashDeal: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
    statusField: 'status',
    displayOrderField: 'displayOrder',
  },
  
  // Uses isVisible + isPublished
  SponsoredProduct: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
    displayOrderField: 'displayOrder',
  },
  
  // Uses isVisible + isPublished + status
  FrequentlyBoughtTogether: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
    statusField: 'status',
    displayOrderField: 'displayOrder',
  },
  
  // Uses isVisible + isPublished + status
  BuyMoreSaveMore: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
    statusField: 'status',
    displayOrderField: 'displayOrder',
  },
  
  // Uses isVisible + isPublished + status
  MysteryBox: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
    statusField: 'status',
    displayOrderField: 'displayOrder',
  },
  
  // Uses isVisible + isPublished + status
  BuildYourOwnBundle: {
    visibilityField: 'isVisible',
    publishingField: 'isPublished',
    statusField: 'status',
    displayOrderField: 'displayOrder',
  },
  
  // Uses enabled + status
  PageBuilderPage: {
    visibilityField: 'enabled',
    statusField: 'status',
    displayOrderField: 'displayOrder',
  },
  
  // Uses enabled + isPublished
  PageSection: {
    visibilityField: 'enabled',
    publishingField: 'isPublished',
    displayOrderField: 'displayOrder',
  },
  
  // Uses active
  PageBanner: {
    visibilityField: 'active',
  },
  
  // Uses enabled
  GlobalComponent: {
    visibilityField: 'enabled',
  },
  
  // Uses active
  ProductBundle: {
    visibilityField: 'active',
  },
  
  // Uses published (not isPublished)
  Product: {
    publishingField: 'published',
    visibilityField: 'isVisible',
    displayOrderField: 'displayOrder',
  },
};

/**
 * Generate visibility filter for a model
 * @param modelName - The Prisma model name
 * @param options - Filter options
 * @returns Prisma where clause filter object
 */
export function getVisibilityFilter(
  modelName: string,
  options: {
    visible?: boolean;
    published?: boolean;
    status?: string;
  } = {}
) {
  const config = MODEL_VISIBILITY_CONFIG[modelName];
  if (!config) {
    console.warn(`[VisibilityFilter] No config found for model: ${modelName}`);
    return {};
  }

  const filter: any = {};

  if (options.visible !== undefined && config.visibilityField) {
    filter[config.visibilityField] = options.visible;
  }

  if (options.published !== undefined && config.publishingField) {
    filter[config.publishingField] = options.published;
  }

  if (options.status !== undefined && config.statusField) {
    filter[config.statusField] = options.status;
  }

  return filter;
}

/**
 * Generate standard "active/published" filter for a model
 * This is the most common use case for frontend-facing queries
 */
export function getActiveFilter(modelName: string) {
  const config = MODEL_VISIBILITY_CONFIG[modelName];
  if (!config) {
    return {};
  }

  const filter: any = {};

  // Add visibility field if it exists
  if (config.visibilityField) {
    filter[config.visibilityField] = true;
  }

  // Add publishing field if it exists
  if (config.publishingField) {
    filter[config.publishingField] = true;
  }

  // Add status field if it exists (for CMS models)
  if (config.statusField) {
    filter[config.statusField] = 'PUBLISHED';
  }

  return filter;
}

/**
 * Get the correct display order field name for a model
 */
export function getDisplayOrderField(modelName: string): string {
  const config = MODEL_VISIBILITY_CONFIG[modelName];
  return config?.displayOrderField || 'displayOrder';
}

/**
 * Validate that a field exists in the model's visibility config
 * Useful for runtime validation of query filters
 */
export function isValidVisibilityField(modelName: string, fieldName: string): boolean {
  const config = MODEL_VISIBILITY_CONFIG[modelName];
  if (!config) return false;
  
  return Object.values(config).includes(fieldName as any);
}
