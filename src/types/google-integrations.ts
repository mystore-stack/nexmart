export type GoogleService = 
  | "ANALYTICS"
  | "TAG_MANAGER"
  | "SEARCH_CONSOLE"
  | "MERCHANT_CENTER"
  | "BUSINESS_PROFILE"
  | "RECAPTCHA"
  | "MAPS"
  | "OAUTH";

export type IntegrationStatus = 
  | "CONNECTED"
  | "DISCONNECTED"
  | "ERROR"
  | "PENDING"
  | "SYNCING";

export type FeedStatus = 
  | "ACTIVE"
  | "PENDING"
  | "PROCESSING"
  | "ERROR"
  | "DISABLED";

export type LocationType = 
  | "STORE"
  | "WAREHOUSE"
  | "DELIVERY_ZONE"
  | "PICKUP_POINT";

export interface GoogleIntegration {
  id: string;
  organizationId: string;
  service: GoogleService;
  enabled: boolean;
  config: any;
  status: IntegrationStatus;
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  error: string | null;
  healthScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleAnalyticsEvent {
  id: string;
  organizationId: string;
  integrationId: string;
  eventType: string;
  eventData: Record<string, any>;
  userId: string | null;
  sessionId: string | null;
  timestamp: Date;
}

export interface GoogleMerchantFeed {
  id: string;
  organizationId: string;
  integrationId: string;
  feedName: string;
  feedUrl: string | null;
  feedId: string | null;
  status: FeedStatus;
  totalProducts: number;
  processedProducts: number;
  lastGeneratedAt: Date | null;
  lastSyncAt: Date | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleOAuthAccount {
  id: string;
  userId: string;
  googleId: string;
  email: string;
  name: string | null;
  picture: string | null;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleSearchConsoleSite {
  id: string;
  organizationId: string;
  siteUrl: string;
  verified: boolean;
  verificationMethod: string | null;
  sitemapUrl: string | null;
  lastCrawlAt: Date | null;
  crawlErrors: number;
  indexedPages: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleBusinessProfile {
  id: string;
  organizationId: string;
  placeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  categories: string[];
  rating: number | null;
  reviewCount: number | null;
  verified: boolean;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleMapsLocation {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  locationType: LocationType;
  deliveryZone: Record<string, any> | null;
  warehouse: boolean;
  store: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleIntegrationDashboard {
  integrations: GoogleIntegration[];
  analytics: {
    totalEvents: number;
    todayEvents: number;
    revenue: number;
    sessions: number;
    users: number;
  };
  merchantFeeds: GoogleMerchantFeed[];
  searchConsoleSites: GoogleSearchConsoleSite[];
  businessProfiles: GoogleBusinessProfile[];
  mapsLocations: GoogleMapsLocation[];
  healthScore: number;
  lastSync: Date | null;
  recommendations: string[];
}
