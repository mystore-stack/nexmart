export interface HomepageSection {
  key: string;
  title: string;
  component: React.ComponentType<any>;
}

// Static HOMEPAGE_SECTIONS array using canonical UPPER_SNAKE_CASE keys
// This matches the canonical contract and avoids circular dependency
// Components are resolved dynamically to avoid import issues
export const HOMEPAGE_SECTIONS: HomepageSection[] = [
  {
    key: "HERO",
    title: "Hero Banner",
    component: null as any, // Component resolved dynamically
  },
  {
    key: "CATEGORIES",
    title: "Categories",
    component: null as any,
  },
  {
    key: "FLASH_DEALS",
    title: "Flash Deals",
    component: null as any,
  },
  {
    key: "BUNDLE_DEALS",
    title: "Bundle Deals",
    component: null as any,
  },
  {
    key: "MYSTERY_BOXES",
    title: "Mystery Boxes",
    component: null as any,
  },
  {
    key: "FEATURED_PRODUCTS",
    title: "Featured Products",
    component: null as any,
  },
  {
    key: "AI_RECOMMENDATIONS",
    title: "AI Recommendations",
    component: null as any,
  },
  {
    key: "BEST_SELLERS",
    title: "Best Sellers",
    component: null as any,
  },
  {
    key: "BRANDS",
    title: "Partner Brands",
    component: null as any,
  },
  {
    key: "WHY_NEXMART",
    title: "Why NexMart",
    component: null as any,
  },
  {
    key: "TESTIMONIALS",
    title: "Testimonials",
    component: null as any,
  },
  {
    key: "MOBILE_APP",
    title: "Mobile App",
    component: null as any,
  },
  {
    key: "NEWSLETTER",
    title: "Newsletter",
    component: null as any,
  },
  {
    key: "FOOTER",
    title: "Footer",
    component: null as any,
  },
  {
    key: "EDITORS_CHOICE",
    title: "Editor's Choice",
    component: null as any,
  },
  {
    key: "PROMOTIONAL_CARDS",
    title: "Promotional Cards",
    component: null as any,
  },
  {
    key: "TRENDING_PRODUCTS",
    title: "Trending Products",
    component: null as any,
  },
  {
    key: "SEASONAL_COLLECTION",
    title: "Seasonal Collection",
    component: null as any,
  },
  {
    key: "RECENTLY_VIEWED",
    title: "Recently Viewed",
    component: null as any,
  },
];

// Helper function to get section by key
export function getSectionByKey(key: string): HomepageSection | undefined {
  return HOMEPAGE_SECTIONS.find(section => section.key === key);
}

// Helper function to get section title by key
export function getSectionTitle(key: string): string {
  return getSectionByKey(key)?.title || key;
}
