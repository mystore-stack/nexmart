// src/lib/cms/data.ts — CMS data types for navigation & site config
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface NavigationChildData {
  label: string;
  url: string;
  badge?: string;
}

export interface NavigationItemData {
  label: string;
  url: string;
  children?: NavigationChildData[];
}

export interface SiteSettings {
  storeName: string;
  storeTagline: string;
  seoDescription: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  email: string;
  phone: string;
  address: string;
  whatsapp?: string;
  businessHours?: string;
  copyrightText?: string;
  searchPlaceholder?: string;
  socialLinks: Array<{ platform?: string; url?: string; icon?: string }>;
}

export interface FooterData {
  logoUrl?: string;
  description?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  socialLinks?: Array<{ platform?: string; url?: string; icon?: string }>;
  quickLinks?: Array<{ title: string; url: string }>;
  columns?: Array<{
    title: string;
    links: Array<{ title: string; url: string }>;
  }>;
  legalLinks?: Array<{ title: string; url: string }>;
  newsletterSettings?: {
    enabled?: boolean;
    title?: string;
    placeholder?: string;
  };
}

export interface SiteConfig {
  settings: SiteSettings;
  navigation: NavigationItemData[];
  footer: FooterData | null;
}

export type SiteConfigBundle = SiteConfig;

// Default fallback data when database is empty
const defaultSettings: SiteSettings = {
  storeName: "NexMart",
  storeTagline: "Maroc · Premium",
  seoDescription: "NexMart est la marketplace premium du Maroc — shopping intelligent par IA, artisanat authentique, paiement sécurisé et livraison express.",
  primaryColor: "#0F766E",
  secondaryColor: "#D4AF37",
  accentColor: "#14b8a6",
  email: "contact@nexmart.ma",
  phone: "+212 5XX-XXXXXX",
  address: "Casablanca, Maroc",
  socialLinks: [],
  searchPlaceholder: "Rechercher un produit...",
};

const defaultNavigation: NavigationItemData[] = [
  {
    label: "Accueil",
    url: "/",
  },
  {
    label: "Catégories",
    url: "/categories",
  },
  {
    label: "Promotions",
    url: "/deals",
  },
  {
    label: "À propos",
    url: "/about",
  },
];

/**
 * Fetch site settings from database with caching
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const fetchSettings = async () => {
    try {
      // Return default settings since siteSettings model doesn't exist
      return defaultSettings;
    } catch (error) {
      console.error("Error fetching site settings:", error);
      return defaultSettings;
    }
  };

  try {
    return await unstable_cache(fetchSettings, ["site-settings"], {
      revalidate: 60,
      tags: ["site-settings"],
    })();
  } catch (error) {
    console.error("Error caching site settings:", error);
    return fetchSettings();
  }
}

/**
 * Fetch navigation menu from database with caching
 */
export async function getNavigationMenu(location: "HEADER" | "FOOTER" | "MOBILE" = "HEADER"): Promise<NavigationItemData[]> {
  const fetchNavigation = async () => {
    try {
      // Return default navigation since navigationMenu model doesn't exist
      return defaultNavigation;
    } catch (error) {
      console.error("Error fetching navigation menu:", error);
      return defaultNavigation;
    }
  };

  try {
    return await unstable_cache(fetchNavigation, ["navigation-menu", location], {
      revalidate: 60,
      tags: ["navigation-menu"],
    })();
  } catch (error) {
    console.error("Error caching navigation menu:", error);
    return fetchNavigation();
  }
}

/**
 * Fetch footer data from database with caching
 */
export async function getFooterData(): Promise<FooterData | null> {
  const fetchFooter = async () => {
    try {
      const footer = await prisma.footerConfig.findFirst({
        where: { active: true },
      });

      if (!footer) {
        return null;
      }

      return {
        logoUrl: undefined,
        description: footer.description || undefined,
        contactInfo: footer.linkGroups ? JSON.parse(footer.linkGroups as string) : undefined,
        socialLinks: footer.socials ? JSON.parse(footer.socials as string) : undefined,
        quickLinks: footer.linkGroups ? JSON.parse(footer.linkGroups as string) : undefined,
        columns: undefined,
        legalLinks: footer.linkGroups ? JSON.parse(footer.linkGroups as string) : undefined,
        newsletterSettings: undefined,
      };
    } catch (error) {
      console.error("Error fetching footer data:", error);
      return null;
    }
  };

  try {
    return await unstable_cache(fetchFooter, ["footer-data"], {
      revalidate: 60,
      tags: ["footer-data"],
    })();
  } catch (error) {
    console.error("Error caching footer data:", error);
    return fetchFooter();
  }
}

/**
 * Fetch hero banners from database with caching
 * Matches the /api/hero endpoint logic for consistency
 */
export async function getHeroBanners() {
  const fetchBanners = async () => {
    try {
      const now = new Date();
      
      // Use HeroSlide model with same date filtering as /api/hero
      const banners = await prisma.heroSlide.findMany({
        where: {
          active: true,
          AND: [
            {
              OR: [
                { startDate: null },
                { startDate: { lte: now } },
              ],
            },
            {
              OR: [
                { endDate: null },
                { endDate: { gte: now } },
              ],
            },
          ],
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });

      return banners;
    } catch (error) {
      console.error("Error fetching hero banners:", error);
      return [];
    }
  };

  return unstable_cache(fetchBanners, ["hero-banners"], {
    revalidate: 60,
    tags: ["hero-banners"],
  })();
}

/**
 * Fetch announcement bar from database with caching
 */
export async function getAnnouncementBar() {
  const fetchAnnouncement = async () => {
    try {
      // Return null since announcementBar model doesn't exist
      return null;
    } catch (error) {
      console.error("Error fetching announcement bar:", error);
      return null;
    }
  };

  return unstable_cache(fetchAnnouncement, ["announcement-bar"], {
    revalidate: 60,
    tags: ["announcement-bar"],
  })();
}

/**
 * Fetch homepage sections from database with caching
 */
export async function getHomepageSections() {
  const fetchSections = async () => {
    try {
      const sections = await prisma.homePageSection.findMany({
        where: {
          active: true,
        },
        orderBy: { order: "asc" },
      });

      return sections;
    } catch (error) {
      console.error("Error fetching homepage sections:", error);
      return [];
    }
  };

  return unstable_cache(fetchSections, ["homepage-sections"], {
    revalidate: 60,
    tags: ["homepage-sections"],
  })();
}

/**
 * Fetch all site configuration data in one call
 */
export async function getSiteConfigBundle(): Promise<SiteConfigBundle> {
  try {
    const [settings, navigation, footer] = await Promise.all([
      getSiteSettings(),
      getNavigationMenu("HEADER"),
      getFooterData(),
    ]);

    return {
      settings,
      navigation,
      footer,
    };
  } catch (error) {
    console.error("Error fetching site config bundle:", error);
    return {
      settings: defaultSettings,
      navigation: defaultNavigation,
      footer: null,
    };
  }
}
