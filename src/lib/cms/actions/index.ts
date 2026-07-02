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
import slugify from "slugify";
import type { Prisma } from "@prisma/client";

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

    const banner = await prisma.heroBanner.create({
      data: {
        ...parseDates(data),
        organizationId: orgId,
        createdBy: session.userId,
        ctaButtons: (data.ctaButtons ?? []) as Prisma.InputJsonValue,
        animationSettings: (data.animationSettings ?? undefined) as unknown as Prisma.NullableJsonNullValueInput,
      } as any,
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

    const banner = await prisma.heroBanner.update({
      where: { id },
      data: {
        ...parseDates(data),
        ctaButtons: (data.ctaButtons ?? []) as Prisma.InputJsonValue,
        animationSettings: (data.animationSettings ?? undefined) as unknown as Prisma.NullableJsonNullValueInput,
      } as Parameters<typeof prisma.heroBanner.update>[0]["data"],
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

    const banner = await prisma.heroBanner.update({
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

    const original = await prisma.heroBanner.findUnique({ where: { id } });
    if (!original) return { success: false, error: "Banner not found" };

    const { id: _id, createdAt, updatedAt, impressions, primaryButtonClicks, secondaryButtonClicks, conversionCount, revenueGenerated, publishedAt, ...rest } = original;

    const banner = await prisma.heroBanner.create({
      data: {
        ...rest,
        title: `${original.title} (Copy)`,
        status: "DRAFT",
        isActive: false,
        displayOrder: original.displayOrder + 1,
        organizationId: orgId,
        createdBy: session.userId,
        ctaButtons: (original.ctaButtons ?? []) as Prisma.InputJsonValue,
        animationSettings: (original.animationSettings ?? undefined) as unknown as Prisma.NullableJsonNullValueInput,
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
        prisma.heroBanner.update({
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

    await prisma.heroBanner.delete({ where: { id } });

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

// ─── Brand Actions ─────────────────────────────────────────────────

export async function createBrand(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_BRANDS);
    const { brandSchema } = await import("@/lib/cms/schemas/brand");
    const data = brandSchema.parse(input);
    const orgId = await getDefaultOrganizationId();

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
