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

export const HOMEPAGE_SECTION_META: Record<
  HomepageSectionType,
  { label: string; description: string; icon: string }
> = {
  HERO: { label: "Hero", description: "Full-width hero banner carousel", icon: "Image" },
  FEATURED_PRODUCTS: { label: "Featured Products", description: "Curated product grid", icon: "ShoppingBag" },
  CATEGORIES: { label: "Categories", description: "Category showcase grid", icon: "Grid3x3" },
  FLASH_DEALS: { label: "Flash Deals", description: "Time-limited offers", icon: "Zap" },
  NEW_ARRIVALS: { label: "New Arrivals", description: "Latest products", icon: "Sparkles" },
  BRANDS: { label: "Brands", description: "Brand logo carousel", icon: "Award" },
  TESTIMONIALS: { label: "Testimonials", description: "Customer reviews", icon: "Quote" },
  FAQ: { label: "FAQ", description: "Frequently asked questions", icon: "HelpCircle" },
  NEWSLETTER: { label: "Newsletter", description: "Email signup CTA", icon: "Mail" },
  CUSTOM_HTML: { label: "Custom HTML", description: "Raw HTML block", icon: "Code" },
  AI_RECOMMENDATIONS: { label: "AI Recommendations", description: "Personalized product picks", icon: "Bot" },
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionType[] = [
  "HERO",
  "CATEGORIES",
  "FEATURED_PRODUCTS",
  "FLASH_DEALS",
  "NEW_ARRIVALS",
  "BRANDS",
  "TESTIMONIALS",
  "NEWSLETTER",
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
