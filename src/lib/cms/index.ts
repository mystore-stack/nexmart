/**
 * Unified CMS data access layer — use these functions server-side.
 * All frontend content flows from PostgreSQL via these getters.
 */
export {
  getSiteSettings,
  getFooterData,
  getNavigationMenu,
  getHeroBanners,
  getAnnouncementBar,
  getHomepageSections,
  getSiteConfigBundle,
} from "./data";

export type { SiteConfigBundle, NavigationItemData } from "./data";
export type { SiteSettingsData, SocialLink } from "./defaults";

export { revalidateSiteContent } from "./revalidate";
