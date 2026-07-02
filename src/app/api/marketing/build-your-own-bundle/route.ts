import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch all build your own bundle configurations
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const bundles = await prisma.buildYourOwnBundle.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { enabled: true }),
        ...(includeInactive ? {} : { status: "PUBLISHED" }),
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
      orderBy: { displayOrder: "asc" },
    });

    return ok(bundles);
  } catch (err) {
    console.error("[BUILD_YOUR_OWN_BUNDLE] GET error:", err);
    return serverError("Failed to fetch build your own bundle configurations");
  }
}

// POST - Create a new build your own bundle configuration
export async function POST(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const bundle = await prisma.buildYourOwnBundle.create({
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
        minProducts: body.minProducts ?? 2,
        maxProducts: body.maxProducts ?? 10,
        baseDiscount: body.baseDiscount ?? 0,
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

    // Add categories if provided
    if (body.categories && Array.isArray(body.categories)) {
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

    // Add discount tiers if provided
    if (body.discountTiers && Array.isArray(body.discountTiers)) {
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
    console.error("[BUILD_YOUR_OWN_BUNDLE] POST error:", err);
    return serverError("Failed to create build your own bundle configuration");
  }
}
