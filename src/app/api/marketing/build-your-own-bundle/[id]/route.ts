import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, notFound } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch a single build your own bundle configuration
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();

    const bundle = await prisma.buildYourOwnBundle.findFirst({
      where: {
        id: params.id,
        organizationId,
      },
      include: {
        categories: {
          include: { category: true },
          orderBy: { displayOrder: "asc" },
        },
        discountTiers: {
          orderBy: { minProducts: "asc" },
        },
      },
    });

    if (!bundle) {
      return notFound("Bundle configuration not found");
    }

    return ok(bundle);
  } catch (err) {
    console.error("[BUILD_YOUR_OWN_BUNDLE] GET by ID error:", err);
    return serverError("Failed to fetch bundle configuration");
  }
}

// PUT - Update a build your own bundle configuration
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const bundle = await prisma.buildYourOwnBundle.update({
      where: { id: params.id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        heroImage: body.heroImage,
        heroBannerColor: body.heroBannerColor,
        ctaText: body.ctaText,
        ctaUrl: body.ctaUrl,
        sectionTitle: body.sectionTitle,
        sectionDescription: body.sectionDescription,
        backgroundColor: body.backgroundColor,
        minProducts: body.minProducts,
        maxProducts: body.maxProducts,
        baseDiscount: body.baseDiscount,
        status: body.status,
        enabled: body.enabled,
        featured: body.featured,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        displayOrder: body.displayOrder,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        ogImage: body.ogImage,
      },
    });

    // Update categories if provided
    if (body.categories && Array.isArray(body.categories)) {
      // Delete existing categories
      await prisma.buildYourOwnBundleCategory.deleteMany({
        where: { bundleId: params.id },
      });

      // Add new categories
      for (const category of body.categories) {
        await prisma.buildYourOwnBundleCategory.create({
          data: {
            bundleId: bundle.id,
            categoryId: category.categoryId,
            required: category.required ?? false,
            displayOrder: category.displayOrder ?? 0,
          },
        });
      }
    }

    // Update discount tiers if provided
    if (body.discountTiers && Array.isArray(body.discountTiers)) {
      // Delete existing discount tiers
      await prisma.buildYourOwnBundleDiscountTier.deleteMany({
        where: { bundleId: params.id },
      });

      // Add new discount tiers
      for (const tier of body.discountTiers) {
        await prisma.buildYourOwnBundleDiscountTier.create({
          data: {
            bundleId: bundle.id,
            minProducts: tier.minProducts,
            discountPercent: tier.discountPercent,
          },
        });
      }
    }

    // Fetch the complete bundle with relations
    const completeBundle = await prisma.buildYourOwnBundle.findUnique({
      where: { id: bundle.id },
      include: {
        categories: {
          include: { category: true },
          orderBy: { displayOrder: "asc" },
        },
        discountTiers: {
          orderBy: { minProducts: "asc" },
        },
      },
    });

    return ok(completeBundle);
  } catch (err) {
    console.error("[BUILD_YOUR_OWN_BUNDLE] PUT error:", err);
    return serverError("Failed to update bundle configuration");
  }
}

// DELETE - Delete a build your own bundle configuration
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();

    const bundle = await prisma.buildYourOwnBundle.findFirst({
      where: { id: params.id, organizationId },
    });

    if (!bundle) {
      return notFound("Bundle configuration not found");
    }

    await prisma.buildYourOwnBundle.delete({
      where: { id: params.id },
    });

    return ok({ id: params.id });
  } catch (err) {
    console.error("[BUILD_YOUR_OWN_BUNDLE] DELETE error:", err);
    return serverError("Failed to delete bundle configuration");
  }
}
