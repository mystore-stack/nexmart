import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch all mystery boxes
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const boxes = await prisma.mysteryBox.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { enabled: true }),
        ...(includeInactive ? {} : { status: "PUBLISHED" }),
      },
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    // Filter out boxes with no published products
    const validBoxes = boxes.filter((box) =>
      (box as any).products?.some((bp: any) => bp.product && bp.product.published)
    );

    return ok(validBoxes);
  } catch (err) {
    console.error("[MYSTERY_BOX] GET error:", err);
    return serverError("Failed to fetch mystery boxes");
  }
}

// POST - Create a new mystery box
export async function POST(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const box = await prisma.mysteryBox.create({
      data: {
        organizationId,
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
        stockRemaining: body.stockRemaining ?? 0,
        status: body.status || "DRAFT",
        enabled: body.enabled ?? true,
        featured: body.featured ?? false,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        displayOrder: body.displayOrder ?? 0,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        ogImage: body.ogImage,
      },
    });

    // Add products if provided
    if (body.products && Array.isArray(body.products)) {
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
    console.error("[MYSTERY_BOX] POST error:", err);
    return serverError("Failed to create mystery box");
  }
}
