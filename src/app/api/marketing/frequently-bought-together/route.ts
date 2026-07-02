import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch all frequently bought together bundles
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const bundles = await prisma.frequentlyBoughtTogether.findMany({
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

    // Filter out bundles with no published products
    const validBundles = bundles.filter((bundle) =>
      (bundle as any).products?.some((bp: any) => bp.product && bp.product.published)
    );

    return ok(validBundles);
  } catch (err) {
    console.error("[FREQUENTLY_BOUGHT_TOGETHER] GET error:", err);
    return serverError("Failed to fetch frequently bought together bundles");
  }
}

// POST - Create a new frequently bought together bundle
export async function POST(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const bundle = await prisma.frequentlyBoughtTogether.create({
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
    console.error("[FREQUENTLY_BOUGHT_TOGETHER] POST error:", err);
    return serverError("Failed to create frequently bought together bundle");
  }
}
