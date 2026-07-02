import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, notFound } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch a single frequently bought together bundle
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();

    const bundle = await prisma.frequentlyBoughtTogether.findFirst({
      where: {
        id: params.id,
        organizationId,
      },
      include: {
        products: {
          include: { product: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!bundle) {
      return notFound("Bundle not found");
    }

    return ok(bundle);
  } catch (err) {
    console.error("[FREQUENTLY_BOUGHT_TOGETHER] GET by ID error:", err);
    return serverError("Failed to fetch bundle");
  }
}

// PUT - Update a frequently bought together bundle
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const bundle = await prisma.frequentlyBoughtTogether.update({
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

    // Update products if provided
    if (body.products && Array.isArray(body.products)) {
      // Delete existing products
      await prisma.frequentlyBoughtTogetherProduct.deleteMany({
        where: { bundleId: params.id },
      });

      // Add new products
      for (const product of body.products) {
        await prisma.frequentlyBoughtTogetherProduct.create({
          data: {
            bundleId: bundle.id,
            productId: product.productId,
            displayOrder: product.displayOrder ?? 0,
          },
        });
      }
    }

    // Fetch the complete bundle with products
    const completeBundle = await prisma.frequentlyBoughtTogether.findUnique({
      where: { id: bundle.id },
      include: {
        products: {
          include: { product: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return ok(completeBundle);
  } catch (err) {
    console.error("[FREQUENTLY_BOUGHT_TOGETHER] PUT error:", err);
    return serverError("Failed to update bundle");
  }
}

// DELETE - Delete a frequently bought together bundle
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();

    const bundle = await prisma.frequentlyBoughtTogether.findFirst({
      where: { id: params.id, organizationId },
    });

    if (!bundle) {
      return notFound("Bundle not found");
    }

    await prisma.frequentlyBoughtTogether.delete({
      where: { id: params.id },
    });

    return ok({ id: params.id });
  } catch (err) {
    console.error("[FREQUENTLY_BOUGHT_TOGETHER] DELETE error:", err);
    return serverError("Failed to delete bundle");
  }
}
