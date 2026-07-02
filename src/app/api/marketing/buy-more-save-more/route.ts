import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch all buy more save more bundles
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const bundles = await prisma.buyMoreSaveMore.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { enabled: true }),
        ...(includeInactive ? {} : { status: "PUBLISHED" }),
      },
      include: {
        rules: true,
      },
      orderBy: { displayOrder: "asc" },
    });

    return ok(bundles);
  } catch (err) {
    console.error("[BUY_MORE_SAVE_MORE] GET error:", err);
    return serverError("Failed to fetch buy more save more bundles");
  }
}

// POST - Create a new buy more save more bundle
export async function POST(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const bundle = await prisma.buyMoreSaveMore.create({
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

    // Add rules if provided
    if (body.rules && Array.isArray(body.rules)) {
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
    console.error("[BUY_MORE_SAVE_MORE] POST error:", err);
    return serverError("Failed to create buy more save more bundle");
  }
}
