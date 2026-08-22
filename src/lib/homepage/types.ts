export interface HomepageData {
  organizationId: string;
  announcementBar: AnnouncementBarData | null;
  hero: HeroData | null;
  sections: HomepageSectionData[];
  navigation: NavigationData | null;
  footer: FooterData | null;
  theme: ThemeData | null;
}

export interface AnnouncementBarData {
  id: string;
  text: string;
  backgroundColor: string;
  textColor: string;
  link?: string;
  linkText?: string;
  icon?: string;
  animation?: string;
  autoHide: boolean;
  hideAfter?: number;
}

export interface HeroData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  desktopImage?: string;
  tabletImage?: string;
  mobileImage?: string;
  videoUrl?: string;
  gradient?: any;
  animatedBackground?: any;
  floatingCards?: any[];
  countdownEnabled: boolean;
  countdownEnd?: Date;
  ctaButtons: CTAButton[];
  badge?: any;
  discount?: any;
  featuredProductId?: string;
  sponsorLogo?: string;
  sponsorLink?: string;
  backgroundColor?: string;
  textColor?: string;
  overlayOpacity: number;
  heroHeight: string;
  heroPosition: string;
  animationSettings?: any;
}

export interface CTAButton {
  text: string;
  link: string;
  style: 'primary' | 'secondary';
  backgroundColor?: string;
  textColor?: string;
}

export interface HomepageSectionData {
  id: string;
  type: SectionType;
  isEnabled: boolean;
  displayOrder: number;
  config: any;
}

export type SectionType =
  | 'ANNOUNCEMENT_BAR'
  | 'PROFESSIONAL_HERO'
  | 'HERO'
  | 'SPONSORED_PRODUCTS'
  | 'FLASH_DEALS'
  | 'CATEGORIES'
  | 'POPULAR_CATEGORIES'
  | 'FEATURED_PRODUCTS'
  | 'NEW_ARRIVALS'
  | 'TRENDING_PRODUCTS'
  | 'BRANDS'
  | 'FEATURED_BRANDS'
  | 'AI_RECOMMENDATIONS'
  | 'LUXURY_COLLECTIONS'
  | 'BUNDLE_DEALS'
  | 'MYSTERY_BOXES'
  | 'MYSTERY_BOX'
  | 'SUPER_DEALS'
  | 'SUMMER_PROMOTION'
  | 'WEATHER_SECTION'
  | 'RECOMMENDED_FOR_YOU'
  | 'BEST_SELLERS'
  | 'VIDEO_BANNER'
  | 'OUR_ADVANTAGES'
  | 'NEWSLETTER'
  | 'INSTAGRAM_FEED'
  | 'INSTAGRAM_GALLERY'
  | 'PREMIUM_FOOTER'
  | 'FOOTER'
  | 'WHY_NEXMART'
  | 'MOBILE_APP'
  | 'SEASONAL_COLLECTION'
  | 'CUSTOM_HTML'
  | 'FAQ'
  | 'RECENTLY_VIEWED'
  | 'EDITORS_CHOICE'
  | 'PROMOTIONAL_CARDS';

export interface NavigationData {
  id: string;
  name: string;
  location: 'HEADER' | 'FOOTER' | 'MOBILE' | 'SIDEBAR';
  items: NavigationItem[];
}

export interface NavigationItem {
  id: string;
  label: string;
  url?: string;
  icon?: string;
  target: string;
  isVisible: boolean;
  displayOrder: number;
  badge?: string;
  children?: NavigationItem[];
}

export interface FooterData {
  id: string;
  logoUrl?: string;
  description?: string;
  socialLinks: SocialLink[];
  contactInfo: ContactInfo;
  quickLinks: QuickLink[];
  legalLinks: QuickLink[];
  columns: any[];
  copyrightText?: string;
  newsletterSettings?: any;
  paymentIcons: any[];
  storeBadges: any[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

export interface QuickLink {
  label: string;
  url: string;
}

export interface ThemeData {
  id: string;
  version: string;
  name: string;
  isActive: boolean;
  settings: any;
  colorPalette: any;
  typography: any;
  componentOverrides: any;
  layoutSettings: any;
  animations: any;
  headerConfig: any;
  footerConfig: any;
  sectionStyles: any;
  customCSS?: string;
  customJS?: string;
}
