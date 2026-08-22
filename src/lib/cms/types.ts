// Extended CMS types for enterprise architecture

// Basic content status types (defined locally since they're not in Prisma enum)
export type CMSContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type DeviceTarget = "ALL" | "DESKTOP" | "MOBILE" | "TABLET";
export type NavigationMenuLocation = "HEADER" | "FOOTER" | "MOBILE";
export type CmsAuditAction = "CREATE" | "UPDATE" | "DELETE" | "PUBLISH" | "ARCHIVE" | "ROLLBACK" | "REORDER" | "DUPLICATE";

// Homepage section type - uses string to match canonical contract
// The canonical contract uses strings for sectionType to support legacy keys and normalization
export type HomepageSectionType = string;

export type CMSDomain =
  | "homepage"
  | "footer"
  | "announcement"
  | "media"
  | "hero"
  | "navigation";

export interface CMSResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  timestamp: string;
}

export interface CtaButtonConfig {
  id?: string;
  text: string;
  link: string;
  style?: "primary" | "secondary" | "outline" | "ghost";
  color?: string;
  openInNewTab?: boolean;
}

export interface HeroAnimationConfig {
  preset: "fade" | "slide-up" | "slide-left" | "zoom" | "none";
  duration: number;
  delay: number;
  easing: string;
}

export interface FooterColumnConfig {
  id: string;
  type: "company" | "shop" | "support" | "legal" | "social";
  title: string;
  links: Array<{ id?: string; title: string; url: string; openInNewTab?: boolean }>;
  displayOrder: number;
}

export interface HomepageSectionConfig {
  id: string;
  type: HomepageSectionType;
  title?: string;
  subtitle?: string;
  config: Record<string, unknown>;
  isVisible: boolean;
  displayOrder: number;
}

// Legacy schemas (backward compatible)
export interface AnnouncementBarSchema {
  id: string;
  text: string;
  icon?: string | null;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  displayOrder: number;
  startDate: Date | null;
  endDate: Date | null;
  status?: CMSContentStatus;
}

export interface HomepageConfigSchema {
  id: string;
  featuredCategories: string[];
  featuredProducts: string[];
  featuredBrands: string[];
  testimonials: unknown[];
  newsletterEnabled: boolean;
  newsletterTitle?: string | null;
  newsletterSubtitle?: string | null;
  isActive: boolean;
  status?: CMSContentStatus;
  version?: number;
}

export interface FooterConfigSchema {
  id: string;
  logoUrl?: string | null;
  description?: string | null;
  socialLinks: unknown[];
  contactInfo: unknown;
  quickLinks: unknown[];
  legalLinks: unknown[];
  columns?: FooterColumnConfig[];
  isActive: boolean;
}

export interface TestimonialSchema {
  id: string;
  name: string;
  role?: string;
  avatarUrl?: string;
  rating: number;
  content: string;
  isActive: boolean;
  displayOrder: number;
}

export interface MediaItemSchema {
  id: string;
  url: string;
  alt?: string;
  thumbnail?: string;
}
