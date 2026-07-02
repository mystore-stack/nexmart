/**
 * Dynamic Home Page Builder Section Configurations
 * 
 * This file defines TypeScript interfaces for all section types
 * that can be used in the dynamic home page builder.
 */

import { PageSectionType } from "@prisma/client";

// Base section configuration
export interface BaseSectionConfig {
  title?: string;
  subtitle?: string;
  description?: string;
  showTitle?: boolean;
}

// Hero Banner Slider
export interface HeroSliderConfig extends BaseSectionConfig {
  slides: Array<{
    id: string;
    image: string;
    mobileImage?: string;
    title: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    openInNewTab?: boolean;
    overlayColor?: string;
    overlayOpacity?: number;
  }>;
  autoplay?: boolean;
  autoplaySpeed?: number;
  showArrows?: boolean;
  showDots?: boolean;
  height?: string;
  fullHeight?: boolean;
}

// Categories Grid
export interface CategoriesGridConfig extends BaseSectionConfig {
  layout: "grid" | "carousel" | "masonry";
  columns: number;
  showImage: boolean;
  showProductCount: boolean;
  limit?: number;
  categoryIds?: string[];
}

// Flash Deals
export interface FlashDealsConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  showCountdown?: boolean;
  showDiscount?: boolean;
  limit?: number;
}

// Campaign Banner
export interface CampaignBannerConfig extends BaseSectionConfig {
  image: string;
  mobileImage?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  openInNewTab?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  fullWidth?: boolean;
}

// Sponsored Products
export interface SponsoredProductsConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  productIds?: string[];
  limit?: number;
  sortBy?: "manual" | "newest" | "price_asc" | "price_desc";
}

// Featured Products
export interface FeaturedProductsConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  limit?: number;
  showAddToCart?: boolean;
  showQuickView?: boolean;
}

// New Arrivals
export interface NewArrivalsConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  limit?: number;
  showDate?: boolean;
}

// Best Sellers
export interface BestSellersConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  limit?: number;
  showSalesCount?: boolean;
}

// Mystery Boxes
export interface MysteryBoxesConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  limit?: number;
  showStock?: boolean;
}

// Buy More Save More
export interface BuyMoreSaveMoreConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  limit?: number;
  showRules?: boolean;
}

// Frequently Bought Together
export interface FrequentlyBoughtTogetherConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  limit?: number;
  showDiscount?: boolean;
}

// Build Your Own Bundle
export interface BuildYourOwnBundleConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  limit?: number;
  showDiscountTiers?: boolean;
}

// Brand Showcase
export interface BrandShowcaseConfig extends BaseSectionConfig {
  layout: "grid" | "carousel" | "logo_wall";
  columns: number;
  brandIds?: string[];
  limit?: number;
  showDescription?: boolean;
}

// Customer Testimonials
export interface TestimonialsConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  testimonials: Array<{
    id: string;
    name: string;
    role?: string;
    avatar?: string;
    rating: number;
    content: string;
    date?: string;
  }>;
  showRating?: boolean;
  autoplay?: boolean;
}

// Newsletter
export interface NewsletterConfig extends BaseSectionConfig {
  layout: "default" | "minimal" | "full_width";
  backgroundColor?: string;
  backgroundImage?: string;
  placeholderText?: string;
  buttonText?: string;
  successMessage?: string;
  showSocialLinks?: boolean;
}

// Promotional Banner
export interface PromotionalBannerConfig extends BaseSectionConfig {
  backgroundColor?: string;
  textColor?: string;
  text: string;
  link?: string;
  openInNewTab?: boolean;
  dismissible?: boolean;
  fullWidth?: boolean;
}

// Video Banner
export interface VideoBannerConfig extends BaseSectionConfig {
  videoUrl: string;
  posterImage?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  overlayText?: string;
  overlayLink?: string;
}

// Collection Grid
export interface CollectionGridConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  collectionIds?: string[];
  limit?: number;
  showProductCount?: boolean;
}

// Trending Products
export interface TrendingProductsConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  limit?: number;
  showTrendingScore?: boolean;
}

// Recommended Products
export interface RecommendedProductsConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  limit?: number;
  showRecommendationReason?: boolean;
}

// Recently Viewed
export interface RecentlyViewedConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  limit?: number;
}

// Recently Added
export interface RecentlyAddedConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  limit?: number;
  showDate?: boolean;
}

// Popular Searches
export interface PopularSearchesConfig extends BaseSectionConfig {
  layout: "grid" | "list" | "cloud";
  limit?: number;
  searchTerms?: string[];
}

// Instagram Feed
export interface InstagramFeedConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  limit?: number;
  username?: string;
  showCaption?: boolean;
}

// Blog Posts
export interface BlogPostsConfig extends BaseSectionConfig {
  layout: "grid" | "carousel" | "list";
  columns: number;
  limit?: number;
  categoryIds?: string[];
  showDate?: boolean;
  showAuthor?: boolean;
  showExcerpt?: boolean;
}

// FAQ
export interface FAQConfig extends BaseSectionConfig {
  layout: "accordion" | "grid";
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    category?: string;
  }>;
  collapsible?: boolean;
  defaultOpen?: string[];
}

// Trust Badges
export interface TrustBadgesConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  badges: Array<{
    id: string;
    icon: string;
    title: string;
    description?: string;
  }>;
}

// Shipping Benefits
export interface ShippingBenefitsConfig extends BaseSectionConfig {
  layout: "grid" | "carousel";
  columns: number;
  benefits: Array<{
    id: string;
    icon: string;
    title: string;
    description?: string;
  }>;
}

// Countdown Offer
export interface CountdownOfferConfig extends BaseSectionConfig {
  endDate: string;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
}

// Footer Banner
export interface FooterBannerConfig extends BaseSectionConfig {
  image: string;
  mobileImage?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  openInNewTab?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}

// Union type for all section configs
export type SectionConfig =
  | HeroSliderConfig
  | CategoriesGridConfig
  | FlashDealsConfig
  | CampaignBannerConfig
  | SponsoredProductsConfig
  | FeaturedProductsConfig
  | NewArrivalsConfig
  | BestSellersConfig
  | MysteryBoxesConfig
  | BuyMoreSaveMoreConfig
  | FrequentlyBoughtTogetherConfig
  | BuildYourOwnBundleConfig
  | BrandShowcaseConfig
  | TestimonialsConfig
  | NewsletterConfig
  | PromotionalBannerConfig
  | VideoBannerConfig
  | CollectionGridConfig
  | TrendingProductsConfig
  | RecommendedProductsConfig
  | RecentlyViewedConfig
  | RecentlyAddedConfig
  | PopularSearchesConfig
  | InstagramFeedConfig
  | BlogPostsConfig
  | FAQConfig
  | TrustBadgesConfig
  | ShippingBenefitsConfig
  | CountdownOfferConfig
  | FooterBannerConfig;

// Section metadata for the library
export interface SectionMetadata {
  type: PageSectionType;
  name: string;
  description: string;
  icon: string;
  category: "hero" | "products" | "marketing" | "content" | "social" | "trust";
  defaultConfig: SectionConfig;
}

// Section library registry
export const SECTION_LIBRARY: SectionMetadata[] = [
  // Hero Sections
  {
    type: "HERO_SLIDER" as any,
    name: "Hero Banner Slider",
    description: "Multiple hero banners with auto-sliding",
    icon: "Image",
    category: "hero",
    defaultConfig: {
      slides: [],
      autoplay: true,
      autoplaySpeed: 5000,
      showArrows: true,
      showDots: true,
      height: "600px",
      fullHeight: false,
    } as HeroSliderConfig,
  },
  {
    type: "CAMPAIGN_BANNER" as any,
    name: "Campaign Banner",
    description: "Full-width promotional banner",
    icon: "Megaphone",
    category: "hero",
    defaultConfig: {
      image: "",
      fullWidth: true,
      overlayColor: "rgba(0,0,0,0.3)",
      overlayOpacity: 0.3,
    } as CampaignBannerConfig,
  },

  // Product Sections
  {
    type: "FEATURED_PRODUCTS" as any,
    name: "Featured Products",
    description: "Showcase featured products",
    icon: "Star",
    category: "products",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      limit: 8,
      showAddToCart: true,
      showQuickView: true,
    } as FeaturedProductsConfig,
  },
  {
    type: "SPONSORED_PRODUCTS" as any,
    name: "Sponsored Products",
    description: "Manually selected sponsored products",
    icon: "Tag",
    category: "products",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      limit: 8,
      sortBy: "manual",
    } as SponsoredProductsConfig,
  },
  {
    type: "NEW_ARRIVALS" as any,
    name: "New Arrivals",
    description: "Latest products added to store",
    icon: "Sparkles",
    category: "products",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      limit: 8,
      showDate: true,
    } as NewArrivalsConfig,
  },
  {
    type: "BEST_SELLERS" as any,
    name: "Best Sellers",
    description: "Top-selling products",
    icon: "TrendingUp",
    category: "products",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      limit: 8,
      showSalesCount: true,
    } as BestSellersConfig,
  },
  {
    type: "TRENDING_PRODUCTS" as any,
    name: "Trending Products",
    description: "Currently trending products",
    icon: "Flame",
    category: "products",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      limit: 8,
      showTrendingScore: true,
    } as TrendingProductsConfig,
  },
  {
    type: "RECOMMENDED_PRODUCTS" as any,
    name: "Recommended Products",
    description: "AI-recommended products",
    icon: "Brain",
    category: "products",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      limit: 8,
      showRecommendationReason: true,
    } as RecommendedProductsConfig,
  },

  // Marketing Sections
  {
    type: "FLASH_DEALS" as any,
    name: "Flash Deals",
    description: "Limited-time flash deals",
    icon: "Zap",
    category: "marketing",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showCountdown: true,
      showDiscount: true,
    } as FlashDealsConfig,
  },
  {
    type: "MYSTERY_BOXES" as any,
    name: "Mystery Boxes",
    description: "Surprise bundle boxes",
    icon: "Gift",
    category: "marketing",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showStock: true,
    } as MysteryBoxesConfig,
  },
  {
    type: "BUY_MORE_SAVE_MORE" as any,
    name: "Buy More Save More",
    description: "Volume discount bundles",
    icon: "Percent",
    category: "marketing",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showRules: true,
    } as BuyMoreSaveMoreConfig,
  },
  {
    type: "FREQUENTLY_BOUGHT_TOGETHER" as any,
    name: "Frequently Bought Together",
    description: "Product bundles",
    icon: "Package",
    category: "marketing",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showDiscount: true,
    } as FrequentlyBoughtTogetherConfig,
  },
  {
    type: "BUILD_YOUR_OWN_BUNDLE" as any,
    name: "Build Your Own Bundle",
    description: "Custom bundle builder",
    icon: "Layers",
    category: "marketing",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showDiscountTiers: true,
    } as BuildYourOwnBundleConfig,
  },
  {
    type: "COUNTDOWN_OFFER" as any,
    name: "Countdown Offer",
    description: "Limited-time countdown timer",
    icon: "Timer",
    category: "marketing",
    defaultConfig: {
      endDate: "",
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
    } as CountdownOfferConfig,
  },
  {
    type: "PROMOTIONAL_BANNER" as any,
    name: "Promotional Banner",
    description: "Text-based promotional banner",
    icon: "Megaphone",
    category: "marketing",
    defaultConfig: {
      text: "",
      dismissible: true,
      fullWidth: true,
    } as PromotionalBannerConfig,
  },

  // Content Sections
  {
    type: "CATEGORIES" as any,
    name: "Categories Grid",
    description: "Product categories display",
    icon: "Grid",
    category: "content",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showImage: true,
      showProductCount: true,
    } as CategoriesGridConfig,
  },
  {
    type: "CATEGORY_GRID" as any,
    name: "Category Grid",
    description: "Alternative category layout",
    icon: "LayoutGrid",
    category: "content",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showImage: true,
      showProductCount: true,
    } as CategoriesGridConfig,
  },
  {
    type: "COLLECTION_GRID" as any,
    name: "Collection Grid",
    description: "Product collections",
    icon: "Folder",
    category: "content",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      showProductCount: true,
    } as CollectionGridConfig,
  },
  {
    type: "BRAND_SHOWCASE" as any,
    name: "Brand Showcase",
    description: "Featured brands",
    icon: "Badge",
    category: "content",
    defaultConfig: {
      layout: "carousel",
      columns: 6,
      showDescription: true,
    } as BrandShowcaseConfig,
  },
  {
    type: "TESTIMONIALS" as any,
    name: "Customer Testimonials",
    description: "Customer reviews",
    icon: "MessageSquare",
    category: "content",
    defaultConfig: {
      layout: "carousel",
      columns: 3,
      testimonials: [],
      showRating: true,
      autoplay: true,
    } as TestimonialsConfig,
  },
  {
    type: "FAQ" as any,
    name: "FAQ",
    description: "Frequently asked questions",
    icon: "HelpCircle",
    category: "content",
    defaultConfig: {
      layout: "accordion",
      faqs: [],
      collapsible: true,
    } as FAQConfig,
  },
  {
    type: "BLOG_POSTS" as any,
    name: "Blog Posts",
    description: "Latest blog articles",
    icon: "FileText",
    category: "content",
    defaultConfig: {
      layout: "grid",
      columns: 3,
      showDate: true,
      showAuthor: true,
      showExcerpt: true,
    } as BlogPostsConfig,
  },
  {
    type: "VIDEO_BANNER" as any,
    name: "Video Banner",
    description: "Video background section",
    icon: "Video",
    category: "content",
    defaultConfig: {
      videoUrl: "",
      autoplay: true,
      muted: true,
      loop: true,
      controls: false,
    } as VideoBannerConfig,
  },

  // Social Sections
  {
    type: "INSTAGRAM_FEED" as any,
    name: "Instagram Feed",
    description: "Instagram posts integration",
    icon: "Instagram",
    category: "social",
    defaultConfig: {
      layout: "grid",
      columns: 6,
      limit: 12,
      showCaption: true,
    } as InstagramFeedConfig,
  },
  {
    type: "NEWSLETTER" as any,
    name: "Newsletter",
    description: "Email signup section",
    icon: "Mail",
    category: "social",
    defaultConfig: {
      layout: "default",
      placeholderText: "Enter your email",
      buttonText: "Subscribe",
      showSocialLinks: true,
    } as NewsletterConfig,
  },

  // Trust Sections
  {
    type: "TRUST_BADGES" as any,
    name: "Trust Badges",
    description: "Trust indicators",
    icon: "Shield",
    category: "trust",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      badges: [],
    } as TrustBadgesConfig,
  },
  {
    type: "SHIPPING_BENEFITS" as any,
    name: "Shipping Benefits",
    description: "Shipping information",
    icon: "Truck",
    category: "trust",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      benefits: [],
    } as ShippingBenefitsConfig,
  },

  // Utility Sections
  {
    type: "RECENTLY_VIEWED" as any,
    name: "Recently Viewed",
    description: "User's recently viewed products",
    icon: "Clock",
    category: "products",
    defaultConfig: {
      layout: "carousel",
      columns: 4,
      limit: 8,
    } as RecentlyViewedConfig,
  },
  {
    type: "RECENTLY_ADDED" as any,
    name: "Recently Added",
    description: "Recently added to store",
    icon: "PlusCircle",
    category: "products",
    defaultConfig: {
      layout: "grid",
      columns: 4,
      limit: 8,
      showDate: true,
    } as RecentlyAddedConfig,
  },
  {
    type: "POPULAR_SEARCHES" as any,
    name: "Popular Searches",
    description: "Trending search terms",
    icon: "Search",
    category: "content",
    defaultConfig: {
      layout: "cloud",
      limit: 10,
    } as PopularSearchesConfig,
  },
  {
    type: "FOOTER_BANNER" as any,
    name: "Footer Banner",
    description: "Bottom promotional banner",
    icon: "Layout",
    category: "marketing",
    defaultConfig: {
      image: "",
      overlayColor: "rgba(0,0,0,0.3)",
      overlayOpacity: 0.3,
    } as FooterBannerConfig,
  },
];

// Helper function to get default config for a section type
export function getDefaultSectionConfig(type: PageSectionType): SectionConfig {
  const section = SECTION_LIBRARY.find(s => s.type === type);
  return section?.defaultConfig || {};
}

// Helper function to get section metadata
export function getSectionMetadata(type: PageSectionType): SectionMetadata | undefined {
  return SECTION_LIBRARY.find(s => s.type === type);
}

// Helper function to get sections by category
export function getSectionsByCategory(category: SectionMetadata["category"]): SectionMetadata[] {
  return SECTION_LIBRARY.filter(s => s.category === category);
}
