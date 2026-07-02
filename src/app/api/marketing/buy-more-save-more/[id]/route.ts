import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, notFound } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch a single buy more save more bundle
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();

    const bundle = await prisma.buyMoreSaveMore.findFirst({
      where: {
        id: params.id,
        organizationId,
      },
      include: { rules: true },
    });

    if (!bundle) {
      return notFound("Bundle not found");
    }

    return ok(bundle);
  } catch (err) {
    console.error("[BUY_MORE_SAVE_MORE] GET by ID error:", err);
    return serverError("Failed to fetch bundle");
  }
}

// PUT - Update a buy more save more bundle
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const bundle = await prisma.buyMoreSaveMore.update({
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

    // Update rules if provided
    if (body.rules && Array.isArray(body.rules)) {
      // Delete existing rules
      await prisma.buyMoreSaveMoreRule.deleteMany({
        where: { bundleId: params.id },
      });

      // Add new rules
      for (const rule of body.rules) {
        await prisma.buyMoreSaveMoreRule.create({
          data: {
            bundleId: bundle.id,
            minQuantity: rule.minQuantity,
            discountType: rule.discountType || "PERCENTAGE",
            discountValue: rule.discountValue,
            maxDiscount: rule.maxDiscount,
            applicableCategories: rule.applicableCategories || [],
          },
        });
      }
    }

    // Fetch the complete bundle with rules
    const completeBundle = await prisma.buyMoreSaveMore.findUnique({
      where: { id: bundle.id },
      include: { rules: true },
    });

    return ok(completeBundle);
  } catch (err) {
    console.error("[BUY_MORE_SAVE_MORE] PUT error:", err);
    return serverError("Failed to update bundle");
  }
}

// DELETE - Delete a buy more save more bundle
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();

    const bundle = await prisma.buyMoreSaveMore.findFirst({
      where: { id: params.id, organizationId },
    });

    if (!bundle) {
      return notFound("Bundle not found");
    }

    await prisma.buyMoreSaveMore.delete({
      where: { id: params.id },
    });

    return ok({ id: params.id });
  } catch (err) {
    console.error("[BUY_MORE_SAVE_MORE] DELETE error:", err);
    return serverError("Failed to delete bundle");
  }
}
