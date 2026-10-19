const sectionTypesByKey: Record<string, string> = {
  herocarousel: 'hero',
  categories: 'categories',
  categoriesrapides: 'categories',
  marquesvedettes: 'brands',
  brands: 'brands',
  offresdumoment: 'offers',
  offers: 'offers',
  meilleuresventes: 'products',
  bestsellers: 'products',
  nouveautes: 'products',
  newarrivals: 'products',
  flash: 'flash',
  flashsale: 'flash',
  offresgroupees: 'grouped-offers',
  offresgroupes: 'grouped-offers',
  groupedoffers: 'grouped-offers',
  coupons: 'coupons',
  aperudescoupons: 'coupons',
  couponspreview: 'coupons',
  welcomeoffer: 'welcome-offer',
  offrebienvenue: 'welcome-offer',
  popupbienvenu: 'welcome-offer',
  welcomeofferpopup: 'welcome-offer',
  welcomeofferpopupbienvenu: 'welcome-offer',
  smartjourney: 'smart-journey',
  giftquest: 'gift-quest',
  nexmartgiftquest: 'gift-quest',
  announcementpopup: 'announcement-popup',
  informationalpopup: 'announcement-popup',
  personal: 'personal',
  gift: 'gift',
  giftfinder: 'gift',
  promobanner: 'discover',
  discover: 'discover',
  nexplay: 'nexplay',
};

const sectionTypesByType: Record<string, string> = {
  hero: 'hero',
  categories: 'categories',
  brands: 'brands',
  offers: 'offers',
  flash: 'flash',
  groupedoffers: 'grouped-offers',
  offresgroupes: 'grouped-offers',
  offresgroupees: 'grouped-offers',
  coupons: 'coupons',
  welcomeoffer: 'welcome-offer',
  offrebienvenue: 'welcome-offer',
  popupbienvenu: 'welcome-offer',
  smartjourney: 'smart-journey',
  giftquest: 'gift-quest',
  nexmartgiftquest: 'gift-quest',
  announcementpopup: 'announcement-popup',
  informationalpopup: 'announcement-popup',
  personal: 'personal',
  gift: 'gift',
  discover: 'discover',
  promobanner: 'discover',
  nexplay: 'nexplay',
  custombanner: 'custom-banner',
};

export const MOBILE_SECTION_EDITOR_REGISTRY = {
  hero: "hero",
  categories: "categories",
  brands: "brands",
  offers: "offers",
  products: "products",
  flash: "flash",
  "grouped-offers": "grouped-offers",
  coupons: "coupons",
  "welcome-offer": "welcome-offer",
  "smart-journey": "smart-journey",
  "gift-quest": "gift-quest",
  "announcement-popup": "announcement-popup",
  personal: "personal",
  gift: "gift",
  discover: "discover",
  nexplay: "nexplay",
} as const;

export type MobileSectionEditorType = keyof typeof MOBILE_SECTION_EDITOR_REGISTRY;

const normalize = (value: unknown) =>
  typeof value === 'string' ? value.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

/** Returns the explicit mobile renderer type for a known key/type pair. */
export function resolveMobileSectionType(sectionKey: unknown, type: unknown): string | null {
  const normalizedKey = normalize(sectionKey);
  const normalizedType = normalize(type);

  if (sectionTypesByKey[normalizedKey]) {
    return sectionTypesByKey[normalizedKey];
  }

  if (normalizedType === 'products') {
    // Products row requires recognized key or explicit dynamic product prefix
    if (normalizedKey.startsWith('secproducts') || ['meilleuresventes', 'bestsellers', 'nouveautes', 'newarrivals'].includes(normalizedKey)) {
      return 'products';
    }
    return null;
  }

  if (normalizedType && sectionTypesByType[normalizedType]) {
    return sectionTypesByType[normalizedType];
  }

  return null;
}

export function resolveMobileSectionEditorType(sectionKey: unknown, type: unknown): MobileSectionEditorType | null {
  const sectionType = resolveMobileSectionType(sectionKey, type);
  return sectionType && sectionType in MOBILE_SECTION_EDITOR_REGISTRY
    ? sectionType as MobileSectionEditorType
    : null;
}
