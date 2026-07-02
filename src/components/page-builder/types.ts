export type SectionConfig = {
  title?: string;
  subtitle?: string;
  description?: string;
  textAlign?: "left" | "center" | "right";
  backgroundColor?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  spacing?: "small" | "medium" | "large";
  padding?: string;
  margin?: string;
  borderRadius?: string;
  shadow?: string;
  animation?: string;
  visibility?: "all" | "desktop" | "mobile" | "tablet";
  customCssClasses?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
} & Record<string, any>;

export interface HeroSectionConfig extends SectionConfig {
  badge?: string;
  primaryCta?: string;
  primaryCtaLink?: string;
  secondaryCta?: string;
  secondaryCtaLink?: string;
}

export interface ProductSectionConfig extends SectionConfig {
  columns?: 2 | 3 | 4;
  manualProducts?: Product[];
  sortBy?: "newest" | "featured" | "bestSelling" | "highestDiscount" | "highestRating" | "random";
  filterBy?: {
    category?: string;
    brand?: string;
    collection?: string;
    priceRange?: { min: number; max: number };
  };
}

export interface Product {
  id: string;
  name: string;
  price?: number;
  image?: string | null;
  category?: string;
}

export interface ButtonConfig {
  text: string;
  link?: string;
  bgColor?: string;
  textColor?: string;
  showArrow?: boolean;
}

export interface Category {
  name: string;
  image?: string;
  link?: string;
}

export interface Testimonial {
  name: string;
  role?: string;
  avatar?: string;
  content: string;
  rating?: number;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface IconItem {
  icon?: string;
  title: string;
  description?: string;
}

export interface Brand {
  name: string;
  logo?: string;
  link?: string;
}

export interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
}

export interface PageSection {
  id: string;
  sectionType: string;
  enabled: boolean;
  displayOrder: number;
  config: any;
  backgroundColor ?: string | null;
  backgroundImage ?: string | null;
  overlayColor ?: string | null;
  overlayOpacity ?: number | null;
  layoutStyle ?: string | null;
  themeVariant ?: string | null;
  spacing ?: string | null;
  visibility ?: string | null;
}
