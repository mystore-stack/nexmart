"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCmsPermission } from "@/lib/cms/auth";
import { CmsPermission } from "@/lib/cms/rbac";
import { logCmsActivity } from "@/lib/cms/audit";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import { getDefaultOrganizationId } from "@/lib/tenant";
import {
  heroBannerSchema,
  heroBannerReorderSchema,
  type HeroBannerInput,
} from "@/lib/cms/schemas/hero";
import {
  homepageBuilderSchema,
  homepagePublishSchema,
  homepageRollbackSchema,
  homepageSectionReorderSchema,
} from "@/lib/cms/schemas/homepage";
import { normalizeSectionsForValidation, normalizeSectionForValidation } from "@/lib/homepage/canonical-contract";
import slugify from "slugify";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

function parseDates<T extends Record<string, unknown>>(data: T) {
  const result = { ...data } as Record<string, unknown>;
  for (const key of ["publishDate", "expireDate", "countdownEnd", "startDate", "endDate"] as const) {
    if (key in result) {
      const val = result[key];
      result[key] = val && typeof val === "string" ? new Date(val) : val === "" ? null : val;
    }
  }
  return result;
}

// ─── Hero Banner Actions ───────────────────────────────────────────

export async function createHeroBanner(input: HeroBannerInput): Promise<ActionResult> {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_EDIT);
    const data = heroBannerSchema.parse(input);
    const orgId = await getDefaultOrganizationId();

    const banner = await prisma.homeBanner.create({
      data: {
        ...parseDates(data),
        organizationId: orgId,
        createdBy: session.userId,
        ctaButtons: data.ctaButtons ?? [],
        animationSettings: data.animationSettings ?? undefined,
      } as Parameters<typeof prisma.homeBanner.create>[0]["data"],
    });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "hero_banner",
      entityId: banner.id,
      action: "CREATE",
    });

    revalidatePath("/admin/cms/hero");
    return { success: true, data: banner };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create banner" };
  }
}

export async function updateHeroBanner(id: string, input: HeroBannerInput): Promise<ActionResult> {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_EDIT);
    const data = heroBannerSchema.parse(input);
    const orgId = await getDefaultOrganizationId();

    const banner = await prisma.homeBanner.update({
      where: { id },
      data: {
        ...parseDates(data),
        ctaButtons: data.ctaButtons ?? [],
        animationSettings: data.animationSettings ?? undefined,
      } as Parameters<typeof prisma.homeBanner.update>[0]["data"],
    });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "hero_banner",
      entityId: id,
      action: "UPDATE",
    });

    revalidatePath("/admin/cms/hero");
    return { success: true, data: banner };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update banner" };
  }
}

export async function publishHeroBanner(id: string): Promise<ActionResult> {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_PUBLISH);
    const orgId = await getDefaultOrganizationId();

    const banner = await prisma.homeBanner.update({
      where: { id },
      data: { status: "PUBLISHED", isActive: true, publishedAt: new Date() },
    });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "hero_banner",
      entityId: id,
      action: "PUBLISH",
    });

    revalidatePath("/admin/cms/hero");
    return { success: true, data: banner };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to publish banner" };
  }
}

export async function duplicateHeroBanner(id: string): Promise<ActionResult> {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_EDIT);
    const orgId = await getDefaultOrganizationId();

    const original = await prisma.homeBanner.findUnique({ where: { id } });
    if (!original) return { success: false, error: "Banner not found" };

    const { id: _id, createdAt, updatedAt, impressions, primaryButtonClicks, secondaryButtonClicks, conversionCount, revenueGenerated, publishedAt, ...rest } = original;

    const banner = await prisma.homeBanner.create({
      data: {
        ...rest,
        title: `${original.title} (Copy)`,
        status: "DRAFT",
        isActive: false,
        displayOrder: original.displayOrder + 1,
        organizationId: orgId,
        createdBy: session.userId,
        ctaButtons: original.ctaButtons ?? [],
      },
    });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "hero_banner",
      entityId: banner.id,
      action: "DUPLICATE",
      metadata: { sourceId: id },
    });

    revalidatePath("/admin/cms/hero");
    return { success: true, data: banner };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to duplicate banner" };
  }
}

export async function reorderHeroBanners(input: unknown): Promise<ActionResult> {
  try {
    await requireCmsPermission(CmsPermission.CMS_EDIT);
    const { items } = heroBannerReorderSchema.parse(input);
    const orgId = await getDefaultOrganizationId();

    await prisma.$transaction(
      items.map((item) =>
        prisma.homeBanner.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    await logCmsActivity({
      organizationId: orgId,
      entityType: "hero_banner",
      action: "REORDER",
      metadata: { items },
    });

    revalidatePath("/admin/cms/hero");
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to reorder banners" };
  }
}

export async function deleteHeroBanner(id: string): Promise<ActionResult> {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_DELETE);
    const orgId = await getDefaultOrganizationId();

    await prisma.homeBanner.delete({ where: { id } });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "hero_banner",
      entityId: id,
      action: "DELETE",
    });

    revalidatePath("/admin/cms/hero");
    return { success: true, data: { id } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete banner" };
  }
}

// ─── Homepage Builder Actions ──────────────────────────────────────

export async function saveHomepageDraft(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_EDIT);
    // Normalize section types before validation
    const normalizedInput = typeof input === 'object' && input !== null && 'sections' in input 
      ? { ...input, sections: normalizeSectionsForValidation(input.sections as any[]) }
      : input;
    const data = homepageBuilderSchema.parse(normalizedInput);
    const orgId = await getDefaultOrganizationId();

    let config = await prisma.homepageConfig.findFirst({
      where: { organizationId: orgId },
    });

    if (!config) {
      config = await prisma.homepageConfig.create({
        data: {
          organizationId: orgId,
          featuredCategories: data.featuredCategories,
          themeSettings: {},
        },
      });
    } else {
      await prisma.homepageConfig.update({
        where: { id: config.id },
        data: {
          featuredCategories: data.featuredCategories,
          themeSettings: {},
        },
      });
    }

    await revalidateSiteContent(orgId);
    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "homepage",
      entityId: config.id,
      action: "UPDATE",
    });

    revalidatePath("/admin/cms/homepage");
    return { success: true, data: { id: config.id } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to save homepage draft" };
  }
}

export async function publishHomepage(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_PUBLISH);
    const { note } = homepagePublishSchema.parse(input ?? {});
    const orgId = await getDefaultOrganizationId();

    const config = await prisma.homepageConfig.findFirst({
      where: { organizationId: orgId },
    });

    if (!config) return { success: false, error: "No homepage configuration found" };

    const nextVersion = 1;

    // Note: homepageVersion model not implemented yet
    // await prisma.homepageVersion.create({
    //   data: {
    //     homepageId: config.id,
    //     version: nextVersion,
    //     publishedBy: session.userId,
    //     note,
    //     snapshot: config,
    //   },
    // });

    const updated = await prisma.homepageConfig.update({
      where: { id: config.id },
      data: {
        featuredCategories: config.featuredCategories,
        heroBannerId: config.heroBannerId,
        themeSettings: config.themeSettings,
      },
    });

    await revalidateSiteContent(orgId);
    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "homepage",
      entityId: config.id,
      action: "PUBLISH",
      metadata: { version: nextVersion },
    });

    revalidatePath("/admin/cms/homepage");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to publish homepage" };
  }
}

export async function rollbackHomepage(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_PUBLISH);
    const { versionId } = homepageRollbackSchema.parse(input);
    const orgId = await getDefaultOrganizationId();

    // Note: homepageVersion model not implemented yet
    return { success: false, error: "Version rollback not implemented yet" };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to rollback homepage" };
  }
}

export async function reorderHomepageSections(input: unknown): Promise<ActionResult> {
  try {
    await requireCmsPermission(CmsPermission.CMS_EDIT);
    const { items } = homepageSectionReorderSchema.parse(input);
    const orgId = await getDefaultOrganizationId();

    await prisma.$transaction(
      items.map((item) =>
        prisma.homePageSection.update({
          where: { id: item.id },
          data: {
            displayOrder: item.displayOrder,
            ...(item.isVisible !== undefined ? { isVisible: item.isVisible } : {}),
          },
        })
      )
    );

    await revalidateSiteContent(orgId);
    await logCmsActivity({
      organizationId: orgId,
      entityType: "homepage_section",
      action: "REORDER",
    });

    revalidatePath("/admin/cms/homepage");
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to reorder sections" };
  }
}

// ─── Brand Actions ─────────────────────────────────────────────────

export async function createBrand(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_BRANDS);
    const { brandSchema } = await import("@/lib/cms/schemas/brand");
    const data = brandSchema.parse(input);
    const orgId = await getDefaultOrganizationId();

    // Note: brand model not implemented yet
    return { success: false, error: "Brand management not implemented yet" };

    const brand = await prisma.brand.create({
      data: {
        organizationId: orgId,
        name: data.name,
        slug: data.slug ?? slugify(data.name, { lower: true, strict: true }),
        logoUrl: data.logoUrl || null,
        bannerUrl: data.bannerUrl || null,
        description: data.description,
        website: data.website || null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        displayOrder: data.displayOrder,
      },
    });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "brand",
      entityId: brand.id,
      action: "CREATE",
    });

    revalidatePath("/admin/cms/brands");
    return { success: true, data: brand };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create brand" };
  }
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_DELETE);
    const orgId = await getDefaultOrganizationId();

    // Note: brand model not implemented yet
    return { success: false, error: "Brand management not implemented yet" };

    await prisma.brand.delete({ where: { id } });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "brand",
      entityId: id,
      action: "DELETE",
    });

    revalidatePath("/admin/cms/brands");
    return { success: true, data: { id } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete brand" };
  }
}
