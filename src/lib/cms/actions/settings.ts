"use server";

import { prisma } from "@/lib/prisma";
import { requireCmsPermission } from "@/lib/cms/auth";
import { CmsPermission } from "@/lib/cms/rbac";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/cms/schemas/settings";
import { logCmsActivity } from "@/lib/cms/audit";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import { mapSiteSettings } from "@/lib/cms/defaults";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateSiteSettings(input: SiteSettingsInput): Promise<ActionResult> {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_EDIT);
    const orgId = await getDefaultOrganizationId();
    const data = siteSettingsSchema.parse(input);

    const settings = await prisma.siteSettings.upsert({
      where: { organizationId: orgId },
      create: {
        organizationId: orgId,
        ...data,
        logoUrl: data.logoUrl || null,
        faviconUrl: data.faviconUrl || null,
        ogImageUrl: data.ogImageUrl || null,
        email: data.email || null,
        supportEmail: data.supportEmail || null,
        siteUrl: data.siteUrl || null,
        accentColor: data.accentColor || null,
        socialLinks: data.socialLinks,
      },
      update: {
        ...data,
        logoUrl: data.logoUrl || null,
        faviconUrl: data.faviconUrl || null,
        ogImageUrl: data.ogImageUrl || null,
        email: data.email || null,
        supportEmail: data.supportEmail || null,
        siteUrl: data.siteUrl || null,
        accentColor: data.accentColor || null,
        socialLinks: data.socialLinks,
      },
    });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "site_settings",
      entityId: settings.id,
      action: "UPDATE",
    });

    await revalidateSiteContent(orgId);

    return { success: true, data: mapSiteSettings(settings) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update settings",
    };
  }
}

export async function getSiteSettingsAction(): Promise<ActionResult> {
  try {
    await requireCmsPermission(CmsPermission.CMS_VIEW);
    const orgId = await getDefaultOrganizationId();
    const settings = await prisma.siteSettings.findUnique({ where: { organizationId: orgId } });
    if (!settings) return { success: true, data: null };
    return { success: true, data: mapSiteSettings(settings) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch settings",
    };
  }
}
