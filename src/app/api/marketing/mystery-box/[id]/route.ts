import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, notFound } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch a single mystery box
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();

    const box = await prisma.mysteryBox.findFirst({
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

    if (!box) {
      return notFound("Mystery box not found");
    }

    return ok(box);
  } catch (err) {
    console.error("[MYSTERY_BOX] GET by ID error:", err);
    return serverError("Failed to fetch mystery box");
  }
}

// PUT - Update a mystery box
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const box = await prisma.mysteryBox.update({
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
        price: body.price,
        originalValue: body.originalValue,
        stockLimit: body.stockLimit,
        stockRemaining: body.stockRemaining,
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
      await prisma.mysteryBoxProduct.deleteMany({
        where: { boxId: params.id },
      });

      // Add new products
      for (const product of body.products) {
        await prisma.mysteryBoxProduct.create({
          data: {
            boxId: box.id,
            productId: product.productId,
            probability: product.probability ?? 1.0,
            displayOrder: product.displayOrder ?? 0,
          },
        });
      }
    }

    // Fetch the complete box with products
    const completeBox = await prisma.mysteryBox.findUnique({
      where: { id: box.id },
      include: {
        products: {
          include: { product: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return ok(completeBox);
  } catch (err) {
    console.error("[MYSTERY_BOX] PUT error:", err);
    return serverError("Failed to update mystery box");
  }
}

// DELETE - Delete a mystery box
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();

    const box = await prisma.mysteryBox.findFirst({
      where: { id: params.id, organizationId },
    });

    if (!box) {
      return notFound("Mystery box not found");
    }

    await prisma.mysteryBox.delete({
      where: { id: params.id },
    });

    return ok({ id: params.id });
  } catch (err) {
    console.error("[MYSTERY_BOX] DELETE error:", err);
    return serverError("Failed to delete mystery box");
  }
}
