import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  FALLBACK_ORGANIZATION_ID,
  getOptionalDefaultOrganizationId,
} from "@/lib/tenant";
import { CMS_TAGS } from "@/lib/cms/revalidate";
import {
  createDefaultSiteSettings,
  mapSiteSettings,
  type SiteSettingsData,
} from "@/lib/cms/defaults";
import type { FooterConfigSchema } from "@/lib/cms/types";

export interface NavigationItemData {
  id: string;
  label: string;
  url: string | null;
  icon: string | null;
  target: string;
  badge: string | null;
  displayOrder: number;
  children?: NavigationItemData[];
}

export interface SiteConfigBundle {
  settings: SiteSettingsData;
  footer: FooterConfigSchema | null;
  navigation: NavigationItemData[];
  announcement: Awaited<ReturnType<typeof getAnnouncementBar>>;
}

function createFallbackSiteSettings(): SiteSettingsData {
  return createDefaultSiteSettings(FALLBACK_ORGANIZATION_ID);
}

async function resolvePublicOrganizationId(organizationId?: string): Promise<string | null> {
  return organizationId ?? (await getOptionalDefaultOrganizationId());
}

// ─── Site Settings ───────────────────────────────────────────────────

async function fetchSiteSettingsFromDb(organizationId: string): Promise<SiteSettingsData> {
  const row = await prisma.siteSettings.findUnique({ where: { organizationId } });
  if (row) return mapSiteSettings(row);

  const defaults = createDefaultSiteSettings(organizationId);
  try {
    const created = await prisma.siteSettings.create({
      data: {
        organizationId,
        storeName: defaults.storeName,
        storeTagline: defaults.storeTagline,
        faviconUrl: defaults.faviconUrl,
        ogImageUrl: defaults.ogImageUrl,
        email: defaults.email,
        phone: defaults.phone,
        address: defaults.address,
        businessHours: defaults.businessHours,
        supportEmail: defaults.supportEmail,
        socialLinks: defaults.socialLinks as unknown as Prisma.InputJsonValue,
        seoTitle: defaults.seoTitle,
        seoDescription: defaults.seoDescription,
        seoKeywords: defaults.seoKeywords,
        siteUrl: defaults.siteUrl,
        twitterHandle: defaults.twitterHandle,
        locale: defaults.locale,
        primaryColor: defaults.primaryColor,
        secondaryColor: defaults.secondaryColor,
        accentColor: defaults.accentColor,
        themeColorLight: defaults.themeColorLight,
        themeColorDark: defaults.themeColorDark,
        currency: defaults.currency,
        freeShippingThreshold: defaults.freeShippingThreshold,
        freeShippingMessage: defaults.freeShippingMessage,
        searchPlaceholder: defaults.searchPlaceholder,
      },
    });
    return mapSiteSettings(created);
  } catch {
    return defaults;
  }
}

export async function getSiteSettings(organizationId?: string): Promise<SiteSettingsData> {
  const orgId = await resolvePublicOrganizationId(organizationId);
  if (!orgId) return createFallbackSiteSettings();

  const cached = unstable_cache(
    () => fetchSiteSettingsFromDb(orgId),
    [`site-settings-${orgId}`],
    { tags: [CMS_TAGS.settings(orgId)], revalidate: 60 }
  );

  try {
    return await cached();
  } catch (error) {
    console.warn(
      "[CMS] Failed to load site settings; using fallback defaults.",
      error instanceof Error ? error.message : error
    );
    return createFallbackSiteSettings();
  }
}

// ─── Footer ──────────────────────────────────────────────────────────

export async function getFooterData(organizationId?: string): Promise<FooterConfigSchema | null> {
  const orgId = await resolvePublicOrganizationId(organizationId);
  if (!orgId) return null;

  const cached = unstable_cache(
    async () => {
      const config = await prisma.footerConfig.findFirst({
        where: { organizationId: orgId, isActive: true },
      });
      if (!config) return null;
      return {
        id: config.id,
        logoUrl: config.logoUrl,
        description: config.description,
        socialLinks: (config.socialLinks as unknown[]) ?? [],
        contactInfo: config.contactInfo as FooterConfigSchema["contactInfo"],
        quickLinks: (config.quickLinks as unknown[]) ?? [],
        legalLinks: (config.legalLinks as unknown[]) ?? [],
        columns: (config.columns as unknown[]) ?? [],
        isActive: config.isActive,
      } as FooterConfigSchema;
    },
    [`footer-${orgId}`],
    { tags: [CMS_TAGS.footer(orgId)], revalidate: 60 }
  );

  try {
    return await cached();
  } catch (error) {
    console.warn(
      "[CMS] Failed to load footer config; rendering without CMS footer data.",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

// ─── Navigation ──────────────────────────────────────────────────────

function buildNavTree(
  items: Array<{
    id: string;
    label: string;
    url: string | null;
    icon: string | null;
    target: string;
    badge: string | null;
    displayOrder: number;
    parentId: string | null;
  }>
): NavigationItemData[] {
  const roots = items.filter((i) => !i.parentId).sort((a, b) => a.displayOrder - b.displayOrder);
  return roots.map((root) => ({
    id: root.id,
    label: root.label,
    url: root.url,
    icon: root.icon,
    target: root.target,
    badge: root.badge,
    displayOrder: root.displayOrder,
    children: items
      .filter((i) => i.parentId === root.id)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((c) => ({
        id: c.id,
        label: c.label,
        url: c.url,
        icon: c.icon,
        target: c.target,
        badge: c.badge,
        displayOrder: c.displayOrder,
      })),
  }));
}

export async function getNavigationMenu(
  location: "HEADER" | "FOOTER" | "MOBILE" = "HEADER",
  organizationId?: string
): Promise<NavigationItemData[]> {
  const orgId = await resolvePublicOrganizationId(organizationId);
  if (!orgId) return [];

  const cached = unstable_cache(
    async () => {
      const menu = await prisma.navigationMenu.findFirst({
        where: { organizationId: orgId, location, isActive: true },
        include: { items: { where: { isVisible: true }, orderBy: { displayOrder: "asc" } } },
      });
      if (!menu?.items.length) return [];
      return buildNavTree(menu.items);
    },
    [`navigation-${location}-${orgId}`],
    { tags: [CMS_TAGS.navigation(orgId)], revalidate: 60 }
  );

  try {
    return await cached();
  } catch (error) {
    console.warn(
      "[CMS] Failed to load navigation menu; rendering empty navigation.",
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

// ─── Hero Banners ────────────────────────────────────────────────────

export async function getHeroBanners(organizationId?: string) {
  const now = new Date();
  try {
    return await prisma.heroBanner.findMany({
      where: {
        isActive: true,
        status: { in: ["PUBLISHED", "SCHEDULED"] },
        OR: [{ publishDate: null }, { publishDate: { lte: now } }],
        AND: [{ OR: [{ expireDate: null }, { expireDate: { gte: now } }] }],
      },
      orderBy: [{ priorityScore: "desc" }, { displayOrder: "asc" }],
    });
  } catch (error) {
    console.warn(
      "[CMS] Failed to load hero banners; rendering without CMS banners.",
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

// ─── Announcement Bar ──────────────────────────────────────────────────

export async function getAnnouncementBar(organizationId?: string) {
  const orgId = await resolvePublicOrganizationId(organizationId);
  if (!orgId) return null;

  const now = new Date();
  const cached = unstable_cache(
    async () => {
      return prisma.announcementBar.findFirst({
        where: {
          organizationId: orgId,
          isActive: true,
          status: "PUBLISHED",
          OR: [{ startDate: null }, { startDate: { lte: now } }],
          AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
        },
        orderBy: [{ displayOrder: "asc" }],
      });
    },
    [`announcement-${orgId}`],
    { tags: [CMS_TAGS.announcement(orgId)], revalidate: 30 }
  );

  try {
    return await cached();
  } catch (error) {
    console.warn(
      "[CMS] Failed to load announcement bar; rendering without announcement.",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

// ─── Full bundle for layout ──────────────────────────────────────────

export async function getSiteConfigBundle(organizationId?: string): Promise<SiteConfigBundle> {
  const orgId = await resolvePublicOrganizationId(organizationId);
  if (!orgId) {
    return {
      settings: createFallbackSiteSettings(),
      footer: null,
      navigation: [],
      announcement: null,
    };
  }

  const [settings, footer, navigation, announcement] = await Promise.all([
    getSiteSettings(orgId),
    getFooterData(orgId),
    getNavigationMenu("HEADER", orgId),
    getAnnouncementBar(orgId),
  ]);
  return { settings, footer, navigation, announcement };
}
