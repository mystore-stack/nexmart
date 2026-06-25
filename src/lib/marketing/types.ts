import type {
  AdPlacement,
  CMSContentStatus,
  DeviceTarget,
  PromoCampaignType,
  VisitorTarget,
} from "@prisma/client";

export type AdvertisementDTO = {
  id: string;
  organizationId: string;
  campaignId: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageDesktop: string | null;
  imageMobile: string | null;
  videoUrl: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  backgroundColor: string;
  textColor: string;
  placement: AdPlacement;
  priority: number;
  status: CMSContentStatus;
  startDate: string | null;
  endDate: string | null;
  targetCountries: string[];
  targetLanguages: string[];
  targetDevices: DeviceTarget;
  visitorTarget: VisitorTarget;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  campaign?: { id: string; name: string; type: PromoCampaignType } | null;
};

export type PromoCampaignDTO = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  type: PromoCampaignType;
  description: string | null;
  status: CMSContentStatus;
  startDate: string | null;
  endDate: string | null;
  bannerColor: string | null;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  _count?: { advertisements: number; flashDeals: number };
};

export type SponsoredProductDTO = {
  id: string;
  organizationId: string;
  productId: string;
  priority: number;
  badgeText: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  };
};

export type FlashDealDTO = {
  id: string;
  organizationId: string;
  campaignId: string | null;
  name: string;
  slug: string;
  discountPercent: number | null;
  discountAmount: number | null;
  startDate: string;
  endDate: string;
  autoStart: boolean;
  autoEnd: boolean;
  status: CMSContentStatus;
  isActive: boolean;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  products?: Array<{
    id: string;
    productId: string;
    discountPercent: number | null;
    discountPrice: number | null;
    displayOrder: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      comparePrice: number | null;
      images: string[];
    };
  }>;
};

export type MarketingAnalyticsSummary = {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  totalConversions: number;
  totalRevenue: number;
  topAds: Array<{
    id: string;
    title: string;
    placement: AdPlacement;
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    revenue: number;
  }>;
  byPlacement: Array<{ placement: AdPlacement; views: number; clicks: number }>;
};

export type HomeMarketingData = {
  scheduledAds: AdvertisementDTO[];
  heroAds: AdvertisementDTO[];
  topBannerAds: AdvertisementDTO[];
  betweenSectionAds: AdvertisementDTO[];
  popupAds: AdvertisementDTO[];
  floatingAds: AdvertisementDTO[];
  flashDeals: FlashDealDTO[];
  sponsoredProducts: SponsoredProductDTO[];
};

export const AD_PLACEMENT_LABELS: Record<AdPlacement, string> = {
  HOMEPAGE_HERO: "Homepage Hero",
  TOP_BANNER: "Top Banner",
  BETWEEN_PRODUCT_SECTIONS: "Between Product Sections",
  CATEGORY_PAGE: "Category Page",
  PRODUCT_PAGE: "Product Page",
  SIDEBAR: "Sidebar",
  FOOTER: "Footer",
  POPUP: "Popup",
  FLOATING_BANNER: "Floating Banner",
};

export const PROMO_CAMPAIGN_TYPE_LABELS: Record<PromoCampaignType, string> = {
  BLACK_FRIDAY: "Black Friday",
  RAMADAN: "Ramadan",
  EID: "Eid",
  SUMMER_SALE: "Summer Sale",
  WINTER_SALE: "Winter Sale",
  CUSTOM: "Custom Campaign",
};

export const VISITOR_TARGET_LABELS: Record<VisitorTarget, string> = {
  ALL: "All Visitors",
  NEW_VISITORS: "New Visitors",
  RETURNING_VISITORS: "Returning Visitors",
  LOGGED_IN: "Logged In Users",
  GUEST: "Guest Users",
};
