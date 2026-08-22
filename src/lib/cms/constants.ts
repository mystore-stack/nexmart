import type { HomepageSectionType } from "@prisma/client";

export const CMS_MODULES = [
  { id: "settings", label: "Paramètres du site", href: "/admin/cms/settings", icon: "Settings" },
  { id: "hero", label: "Hero Banners", href: "/admin/cms/hero", icon: "Image" },
  { id: "homepage", label: "Homepage Builder", href: "/admin/cms/homepage", icon: "LayoutTemplate" },
  { id: "announcement", label: "Announcement Bar", href: "/admin/cms/announcement", icon: "BellRing" },
  { id: "footer", label: "Footer CMS", href: "/admin/cms/footer", icon: "PanelBottom" },
  { id: "media", label: "Media Library", href: "/admin/cms/media", icon: "FolderOpen" },
  { id: "navigation", label: "Navigation", href: "/admin/cms/navigation", icon: "Menu" },
  { id: "categories", label: "Categories", href: "/admin/categories", icon: "FolderTree" },
  { id: "brands", label: "Brand Management", href: "/admin/cms/brands", icon: "Award" },
  { id: "campaigns", label: "Marketing Campaigns", href: "/admin/cms/campaigns", icon: "Megaphone" },
  { id: "analytics", label: "CMS Analytics", href: "/admin/cms/analytics", icon: "BarChart3" },
] as const;

// Homepage section configuration
// Note: Section types are stored as strings in the database, not as a Prisma enum

export const HOMEPAGE_SECTION_META: Record<
  string,
  { label: string; description: string; icon: string }
> = {
  HERO: { label: "Hero", description: "Full-width hero banner carousel", icon: "Image" },
  FEATURED_PRODUCTS: { label: "Featured Products", description: "Curated product grid", icon: "ShoppingBag" },
  CATEGORIES: { label: "Categories", description: "Category showcase grid", icon: "Grid3x3" },
  FLASH_DEALS: { label: "Flash Deals", description: "Time-limited offers", icon: "Zap" },
  BUNDLE_DEALS: { label: "Bundle Deals", description: "Curated bundle offers", icon: "Package" },
  MYSTERY_BOXES: { label: "Mystery Boxes", description: "Surprise product bundles", icon: "Gift" },
  AI_RECOMMENDATIONS: { label: "AI Recommendations", description: "Personalized product picks", icon: "Bot" },
  BEST_SELLERS: { label: "Best Sellers", description: "Top-selling products", icon: "TrendingUp" },
  BRANDS: { label: "Partner Brands", description: "Brand logo carousel", icon: "Award" },
  WHY_NEXMART: { label: "Why NexMart", description: "Brand value and trust section", icon: "Sparkles" },
  TESTIMONIALS: { label: "Testimonials", description: "Customer reviews", icon: "Quote" },
  MOBILE_APP: { label: "Mobile App", description: "Mobile app promotion banner", icon: "Smartphone" },
  NEWSLETTER: { label: "Newsletter", description: "Email signup CTA", icon: "Mail" },
  FOOTER: { label: "Footer", description: "Site footer content and links", icon: "PanelBottom" },
};

export const DEFAULT_HOMEPAGE_SECTIONS: string[] = [
  "HERO",
  "CATEGORIES",
  "FLASH_DEALS",
  "BUNDLE_DEALS",
  "MYSTERY_BOXES",
  "FEATURED_PRODUCTS",
  "AI_RECOMMENDATIONS",
  "BEST_SELLERS",
  "BRANDS",
  "WHY_NEXMART",
  "TESTIMONIALS",
  "MOBILE_APP",
  "NEWSLETTER",
  "FOOTER",
];

export const FOOTER_COLUMN_TYPES = [
  { id: "company", label: "Company" },
  { id: "shop", label: "Shop" },
  { id: "support", label: "Support" },
  { id: "legal", label: "Legal" },
  { id: "social", label: "Social" },
] as const;

export const HERO_ANIMATION_PRESETS = [
  { id: "fade", label: "Fade In" },
  { id: "slide-up", label: "Slide Up" },
  { id: "slide-left", label: "Slide Left" },
  { id: "zoom", label: "Zoom In" },
  { id: "none", label: "None" },
] as const;

export const CMS_STATUS_LABELS = {
  DRAFT: { label: "Draft", color: "bg-gray-500" },
  PUBLISHED: { label: "Published", color: "bg-green-500" },
  SCHEDULED: { label: "Scheduled", color: "bg-blue-500" },
  ARCHIVED: { label: "Archived", color: "bg-yellow-600" },
  EXPIRED: { label: "Expired", color: "bg-red-500" },
} as const;

