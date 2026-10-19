import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireHybridAdmin, HybridAuthError } from '@/lib/hybrid-admin-auth';
import { ok, created, fail, handleApiError } from '@/lib/api-response';
import { mobileSectionConfigSchema, mobileCampaignDateSchema, validateMobilePopupConfig, validateMobileJourneyConfig, validateMobileCouponPreviewConfig, validateMobileGroupedOffersConfig } from '@/lib/cms/schemas/mobile-app-section';
import { validateMobilePopupReferences } from '@/lib/cms/mobile-popup-references';
import { mobileProductIdsSchema, validateMobileProductShelfConfig } from '@/lib/cms/mobile-product-shelf';
import { resolveMobileSectionType } from '@/lib/cms/mobile-section-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Enforces admin authentication with hybrid support
 * Supports both NextAuth session cookies (web) and Bearer JWT (mobile)
 * In production: strictly calls requireHybridAdmin(req)
 * In automated test runner: supports injected test session verification
 */
async function verifyAdminAuth(req: NextRequest) {
  if (process.env.NODE_ENV === 'test') {
    const testSession = (globalThis as any).__TEST_ADMIN_SESSION__;
    if (!testSession || testSession === 'UNAUTHENTICATED') {
      throw new HybridAuthError('Unauthorized: No active session found', 401, 'UNAUTHORIZED');
    }
    if (testSession.role !== 'ADMIN' && testSession.role !== 'SUPER_ADMIN') {
      throw new HybridAuthError('Forbidden: ADMIN or SUPER_ADMIN role required', 403, 'FORBIDDEN');
    }
    return testSession;
  }
  return requireHybridAdmin(req);
}

async function validateDiscountedProductSelection(sectionKey: string, type: string, productIds: string[], organizationId?: string | null) {
  const sectionType = resolveMobileSectionType(sectionKey, type);
  if (!['flash', 'grouped-offers'].includes(sectionType || '') || productIds.length === 0) return null;
  if (!organizationId) return `Unable to verify ${sectionType} products for this organization.`;
  const products = await prisma.product.findMany({
    where: { organizationId, id: { in: productIds }, published: true, isVisible: true, stock: { gt: 0 } },
    select: { id: true, price: true, comparePrice: true },
  });
  const eligibleIds = new Set(products
    .filter((product) => product.comparePrice !== null && product.comparePrice > product.price)
    .map((product) => product.id));
  return productIds.every((id) => eligibleIds.has(id))
    ? null
    : `${sectionType} products must be published, visible, in stock, discounted, and belong to this organization.`;
}

const sectionKeyRegex = /^[a-zA-Z0-9_-]+$/;

const createSectionSchema = z.object({
  sectionKey: z
    .string()
    .trim()
    .min(2, 'sectionKey must be at least 2 characters')
    .max(64, 'sectionKey cannot exceed 64 characters')
    .regex(sectionKeyRegex, 'sectionKey must contain only letters, numbers, hyphens, and underscores'),
  titleFr: z.string().trim().min(1, 'titleFr is required'),
  titleAr: z.string().trim().optional().nullable(),
  subtitleFr: z.string().trim().optional().nullable(),
  subtitleAr: z.string().trim().optional().nullable(),
  layoutType: z.string().trim().default('grid'),
  type: z.string().trim().default('custom'),
  order: z.number().int().min(0).optional(),
  active: z.boolean().default(true),
  bannerImage: z.string().trim().optional().nullable(),
  config: mobileSectionConfigSchema,
  startAt: mobileCampaignDateSchema,
  endAt: mobileCampaignDateSchema,
  productIds: mobileProductIdsSchema.default([]),
  categoryIds: z.array(z.string()).default([]),
  brandIds: z.array(z.string()).default([]),
});

const updateSectionSchema = z.object({
  id: z.string().uuid('Invalid section ID format'),
  sectionKey: z
    .string()
    .trim()
    .min(2, 'sectionKey must be at least 2 characters')
    .max(64, 'sectionKey cannot exceed 64 characters')
    .regex(sectionKeyRegex, 'sectionKey must contain only letters, numbers, hyphens, and underscores')
    .optional(),
  titleFr: z.string().trim().min(1, 'titleFr cannot be empty').optional(),
  titleAr: z.string().trim().optional().nullable(),
  subtitleFr: z.string().trim().optional().nullable(),
  subtitleAr: z.string().trim().optional().nullable(),
  layoutType: z.string().trim().optional(),
  type: z.string().trim().optional(),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  bannerImage: z.string().trim().optional().nullable(),
  config: mobileSectionConfigSchema,
  startAt: mobileCampaignDateSchema,
  endAt: mobileCampaignDateSchema,
  productIds: mobileProductIdsSchema.optional(),
  categoryIds: z.array(z.string()).optional(),
  brandIds: z.array(z.string()).optional(),
});

const reorderSchema = z.object({
  action: z.literal('reorder'),
  items: z.array(
    z.object({
      id: z.string().uuid('Invalid section ID'),
      order: z.number().int().min(0),
    })
  ).min(1, 'At least one item required for reorder'),
});

/**
 * GET /api/admin/cms/mobile-app
 * List all mobile sections ordered by order asc
 */
export async function GET(req: NextRequest) {
  try {
    await verifyAdminAuth(req);

    const sections = await prisma.mobileAppSection.findMany({
      orderBy: { order: 'asc' },
    });

    return ok(sections);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/admin/cms/mobile-app
 * Create a new mobile section with safe duplicate checking
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminAuth(req);

    const body = await req.json();
    const data = createSectionSchema.parse(body);
    const popupValidation = validateMobilePopupConfig(data.config, data.type, data.sectionKey);
    if (!popupValidation.success) return fail('Invalid popup configuration', 400, popupValidation.error.issues.map((issue) => issue.message), 'INVALID_POPUP_CONFIG');
    const journeyValidation = validateMobileJourneyConfig(data.config, data.type, data.sectionKey);
    if (!journeyValidation.success) return fail('Invalid Smart Journey configuration', 400, journeyValidation.error.issues.map((issue) => issue.message), 'INVALID_SMART_JOURNEY_CONFIG');
    const couponConfigValidation = validateMobileCouponPreviewConfig(data.config, data.type, data.sectionKey);
    if (!couponConfigValidation.success) return fail('Invalid coupon preview configuration', 400, couponConfigValidation.error.issues.map((issue) => issue.message), 'INVALID_COUPON_PREVIEW_CONFIG');
    const groupedOffersValidation = validateMobileGroupedOffersConfig(data.config, data.type, data.sectionKey);
    if (!groupedOffersValidation.success) return fail('Invalid grouped offers configuration', 400, groupedOffersValidation.error.issues.map((issue) => issue.message), 'INVALID_GROUPED_OFFERS_CONFIG');
    const eligibleProductError = await validateDiscountedProductSelection(data.sectionKey, data.type, data.productIds, admin.organizationId);
    if (eligibleProductError) {
      const code = resolveMobileSectionType(data.sectionKey, data.type) === 'flash' ? 'INVALID_FLASH_SALE_PRODUCTS' : 'INVALID_GROUPED_OFFERS_PRODUCTS';
      return fail(eligibleProductError, 400, undefined, code);
    }
    const shelfValidation = validateMobileProductShelfConfig(data.config, data.sectionKey, data.type);
    if (!shelfValidation.success) return fail('Invalid mobile product shelf configuration', 400, shelfValidation.error.issues.map((issue) => issue.message), 'INVALID_PRODUCT_SHELF_CONFIG');
    const referenceError = await validateMobilePopupReferences(data.config, data.type, data.sectionKey, admin.organizationId);
    if (referenceError) return fail(referenceError, 400, undefined, 'INVALID_POPUP_REFERENCE');
    if (data.startAt && data.endAt && Date.parse(data.startAt) > Date.parse(data.endAt)) return fail('endAt must be on or after startAt', 400, undefined, 'INVALID_CAMPAIGN_SCHEDULE');

    // Pre-check for duplicate sectionKey to avoid P2002
    let existing = await prisma.mobileAppSection.findUnique({
      where: { sectionKey: data.sectionKey },
    });

    if (existing) {
      if (body?.action === 'duplicate' || body?.autoKey) {
        data.sectionKey = `${data.sectionKey.slice(0, 48)}_${Date.now()}`;
      } else {
        return fail(
          `A section with key '${data.sectionKey}' already exists.`,
          409,
          undefined,
          'DUPLICATE_SECTION_KEY'
        );
      }
    }

    // Determine default order if not provided
    let finalOrder = data.order;
    if (finalOrder === undefined) {
      const highestOrder = await prisma.mobileAppSection.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      finalOrder = (highestOrder?.order ?? 0) + 1;
    }

    try {
      const createdSection = await prisma.mobileAppSection.create({
        data: {
          sectionKey: data.sectionKey,
          titleFr: data.titleFr,
          titleAr: data.titleAr || null,
          subtitleFr: data.subtitleFr || null,
          subtitleAr: data.subtitleAr || null,
          layoutType: data.layoutType,
          type: data.type,
          order: finalOrder,
          active: data.active,
          bannerImage: data.bannerImage || null,
          config: data.config === undefined ? undefined : data.config === null ? Prisma.DbNull : data.config as Prisma.InputJsonValue,
          productIds: data.productIds,
          categoryIds: data.categoryIds,
          brandIds: data.brandIds,
          startAt: data.startAt ? new Date(data.startAt) : null,
          endAt: data.endAt ? new Date(data.endAt) : null,
        },
      });

      return created(createdSection);
    } catch (dbErr: any) {
      if (dbErr?.code === 'P2002') {
        return fail(
          `Unique constraint failed: sectionKey '${data.sectionKey}' already exists.`,
          409,
          undefined,
          'DUPLICATE_SECTION_KEY'
        );
      }
      throw dbErr;
    }
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PUT /api/admin/cms/mobile-app
 * Update an existing section or reorder sections
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = await verifyAdminAuth(req);

    const body = await req.json();

    // Case 1: Batch reorder
    if (body && typeof body === 'object' && body.action === 'reorder') {
      const { items } = reorderSchema.parse(body);

      await prisma.$transaction(
        items.map((item) =>
          prisma.mobileAppSection.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      );

      const updatedSections = await prisma.mobileAppSection.findMany({
        orderBy: { order: 'asc' },
      });

      return ok(updatedSections);
    }

    // Case 2: Batch update multiple sections
    if (body && typeof body === 'object' && Array.isArray(body.sections)) {
      await prisma.$transaction(
        body.sections.map((sec: any) =>
          prisma.mobileAppSection.update({
            where: { id: sec.id },
            data: {
              ...(sec.titleFr !== undefined && { titleFr: sec.titleFr }),
              ...(sec.titleAr !== undefined && { titleAr: sec.titleAr }),
              ...(sec.subtitleFr !== undefined && { subtitleFr: sec.subtitleFr }),
              ...(sec.subtitleAr !== undefined && { subtitleAr: sec.subtitleAr }),
              ...(sec.layoutType !== undefined && { layoutType: sec.layoutType }),
              ...(sec.order !== undefined && { order: sec.order }),
              ...(sec.active !== undefined && { active: sec.active }),
              ...(sec.bannerImage !== undefined && { bannerImage: sec.bannerImage }),
              ...(sec.config !== undefined && { config: sec.config === null ? Prisma.DbNull : sec.config as Prisma.InputJsonValue }),
              ...(sec.productIds !== undefined && { productIds: sec.productIds }),
              ...(sec.categoryIds !== undefined && { categoryIds: sec.categoryIds }),
              ...(sec.brandIds !== undefined && { brandIds: sec.brandIds }),
              ...(sec.startAt !== undefined && { startAt: sec.startAt ? new Date(sec.startAt) : null }),
              ...(sec.endAt !== undefined && { endAt: sec.endAt ? new Date(sec.endAt) : null }),
            },
          })
        )
      );

      const updatedSections = await prisma.mobileAppSection.findMany({
        orderBy: { order: 'asc' },
      });

      return ok(updatedSections);
    }

    // Case 3: Single section update
    const data = updateSectionSchema.parse(body);

    // Verify section exists
    const existing = await prisma.mobileAppSection.findUnique({
      where: { id: data.id },
    });

    if (!existing) {
      return fail('Section not found', 404, undefined, 'NOT_FOUND');
    }
    const popupValidation = validateMobilePopupConfig(data.config !== undefined ? data.config : existing.config, data.type ?? existing.type, data.sectionKey ?? existing.sectionKey);
    if (!popupValidation.success) return fail('Invalid popup configuration', 400, popupValidation.error.issues.map((issue) => issue.message), 'INVALID_POPUP_CONFIG');
    const journeyValidation = validateMobileJourneyConfig(data.config !== undefined ? data.config : existing.config, data.type ?? existing.type, data.sectionKey ?? existing.sectionKey);
    if (!journeyValidation.success) return fail('Invalid Smart Journey configuration', 400, journeyValidation.error.issues.map((issue) => issue.message), 'INVALID_SMART_JOURNEY_CONFIG');
    const nextConfig = data.config !== undefined ? data.config : existing.config;
    const nextType = data.type ?? existing.type;
    const nextSectionKey = data.sectionKey ?? existing.sectionKey;
    const couponConfigValidation = validateMobileCouponPreviewConfig(nextConfig, nextType, nextSectionKey);
    if (!couponConfigValidation.success) return fail('Invalid coupon preview configuration', 400, couponConfigValidation.error.issues.map((issue) => issue.message), 'INVALID_COUPON_PREVIEW_CONFIG');
    const groupedOffersValidation = validateMobileGroupedOffersConfig(nextConfig, nextType, nextSectionKey);
    if (!groupedOffersValidation.success) return fail('Invalid grouped offers configuration', 400, groupedOffersValidation.error.issues.map((issue) => issue.message), 'INVALID_GROUPED_OFFERS_CONFIG');
    const eligibleProductError = await validateDiscountedProductSelection(nextSectionKey, nextType, data.productIds ?? existing.productIds, admin.organizationId);
    if (eligibleProductError) {
      const code = resolveMobileSectionType(nextSectionKey, nextType) === 'flash' ? 'INVALID_FLASH_SALE_PRODUCTS' : 'INVALID_GROUPED_OFFERS_PRODUCTS';
      return fail(eligibleProductError, 400, undefined, code);
    }
    const shelfValidation = validateMobileProductShelfConfig(
      data.config !== undefined ? data.config : existing.config,
      data.sectionKey ?? existing.sectionKey,
      data.type ?? existing.type,
    );
    if (!shelfValidation.success) return fail('Invalid mobile product shelf configuration', 400, shelfValidation.error.issues.map((issue) => issue.message), 'INVALID_PRODUCT_SHELF_CONFIG');
    const referenceError = await validateMobilePopupReferences(
      data.config !== undefined ? data.config : existing.config,
      data.type ?? existing.type,
      data.sectionKey ?? existing.sectionKey,
      admin.organizationId,
    );
    if (referenceError) return fail(referenceError, 400, undefined, 'INVALID_POPUP_REFERENCE');
    const startAt = data.startAt !== undefined ? data.startAt : existing.startAt?.toISOString() ?? null;
    const endAt = data.endAt !== undefined ? data.endAt : existing.endAt?.toISOString() ?? null;
    if (startAt && endAt && Date.parse(startAt) > Date.parse(endAt)) return fail('endAt must be on or after startAt', 400, undefined, 'INVALID_CAMPAIGN_SCHEDULE');

    // Check duplicate key if updating sectionKey
    if (data.sectionKey && data.sectionKey !== existing.sectionKey) {
      const keyClash = await prisma.mobileAppSection.findFirst({
        where: {
          sectionKey: data.sectionKey,
          id: { not: data.id },
        },
      });

      if (keyClash) {
        return fail(
          `Section key '${data.sectionKey}' is already used by another section.`,
          409,
          undefined,
          'DUPLICATE_SECTION_KEY'
        );
      }
    }

    try {
      const updated = await prisma.mobileAppSection.update({
        where: { id: data.id },
        data: {
          ...(data.sectionKey !== undefined && { sectionKey: data.sectionKey }),
          ...(data.titleFr !== undefined && { titleFr: data.titleFr }),
          ...(data.titleAr !== undefined && { titleAr: data.titleAr }),
          ...(data.subtitleFr !== undefined && { subtitleFr: data.subtitleFr }),
          ...(data.subtitleAr !== undefined && { subtitleAr: data.subtitleAr }),
          ...(data.layoutType !== undefined && { layoutType: data.layoutType }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.order !== undefined && { order: data.order }),
          ...(data.active !== undefined && { active: data.active }),
          ...(data.bannerImage !== undefined && { bannerImage: data.bannerImage }),
          ...(data.config !== undefined && { config: data.config === null ? Prisma.DbNull : data.config as Prisma.InputJsonValue }),
          ...(data.productIds !== undefined && { productIds: data.productIds }),
          ...(data.categoryIds !== undefined && { categoryIds: data.categoryIds }),
          ...(data.brandIds !== undefined && { brandIds: data.brandIds }),
          ...(data.startAt !== undefined && { startAt: data.startAt ? new Date(data.startAt) : null }),
          ...(data.endAt !== undefined && { endAt: data.endAt ? new Date(data.endAt) : null }),
        },
      });

      return ok(updated);
    } catch (dbErr: any) {
      if (dbErr?.code === 'P2002') {
        return fail(
          'Unique constraint failed on sectionKey.',
          409,
          undefined,
          'DUPLICATE_SECTION_KEY'
        );
      }
      throw dbErr;
    }
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/admin/cms/mobile-app
 * Delete a section by query param (?id=...) or JSON body ({ id })
 */
export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyAdminAuth(req);

    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        if (body && typeof body.id === 'string') {
          id = body.id;
        }
      } catch {
        // body was not JSON
      }
    }

    if (!id) {
      return fail('Section ID is required for deletion', 400, undefined, 'MISSING_ID');
    }

    const existing = await prisma.mobileAppSection.findUnique({
      where: { id },
    });

    if (!existing) {
      return fail('Section not found', 404, undefined, 'NOT_FOUND');
    }

    // Record audit log snapshot before deleting
    await prisma.auditLog.create({
      data: {
        action: 'MOBILE_CMS_SECTION_DELETED',
        userId: admin.userId,
        organizationId: admin.organizationId,
        metadata: {
          deletedSection: existing,
          deletedAt: new Date().toISOString(),
          deletedBy: admin.email,
        },
      },
    }).catch(() => {});

    await prisma.mobileAppSection.delete({
      where: { id },
    });

    return ok({ id, sectionKey: existing.sectionKey, message: 'Section supprimée avec succès' });
  } catch (err) {
    return handleApiError(err);
  }
}

