import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch all page builder pages
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const { searchParams } = new URL(req.url);
    const pageType = searchParams.get("pageType");

    const where: any = { organizationId };
    if (pageType) {
      where.pageType = pageType;
    }

    const pages = await prisma.pageBuilderPage.findMany({
      where,
      include: {
        sections: {
          orderBy: { displayOrder: "asc" },
        },
        banners: {
          orderBy: { priority: "desc" },
        },
        _count: {
          select: { sections: true, banners: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    return ok(pages);
  } catch (err) {
    console.error("[PAGE_BUILDER] GET error:", err);
    return serverError("Failed to fetch pages");
  }
}

// POST - Create a new page builder page
export async function POST(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const page = await prisma.pageBuilderPage.create({
      data: {
        organizationId,
        pageType: body.pageType,
        name: body.name,
        slug: body.slug,
        status: body.status || "DRAFT",
        enabled: body.enabled ?? true,
        featured: body.featured ?? false,
        publishDate: body.publishDate ? new Date(body.publishDate) : null,
        unpublishDate: body.unpublishDate ? new Date(body.unpublishDate) : null,
        displayOrder: body.displayOrder || 0,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        seoKeywords: body.seoKeywords,
        canonicalUrl: body.canonicalUrl,
        ogImage: body.ogImage,
        twitterImage: body.twitterImage,
        accentColor: body.accentColor,
        sectionBackground: body.sectionBackground,
        buttonStyle: body.buttonStyle,
        cardStyle: body.cardStyle,
        borderRadius: body.borderRadius,
        shadow: body.shadow,
        gradient: body.gradient,
      },
    });

    return ok(page);
  } catch (err) {
    console.error("[PAGE_BUILDER] POST error:", err);
    return serverError("Failed to create page");
  }
}
