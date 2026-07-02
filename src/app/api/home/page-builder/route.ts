import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch active home page sections for storefront
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const now = new Date();

    // Find the home page for this organization
    const homePage = await prisma.pageBuilderPage.findFirst({
      where: {
        organizationId,
        enabled: true,
        status: "PUBLISHED",
        OR: [
          { publishDate: null },
          { publishDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { unpublishDate: null },
              { unpublishDate: { gte: now } },
            ],
          },
        ],
      },
      include: {
        sections: {
          where: {
            enabled: true,
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!homePage) {
      // Return empty sections if no home page is configured
      return ok({
        page: null,
        sections: [],
      });
    }

    return ok({
      page: {
        id: homePage.id,
        name: homePage.name,
        slug: homePage.slug,
        accentColor: homePage.accentColor,
        sectionBackground: homePage.sectionBackground,
        buttonStyle: homePage.buttonStyle,
        cardStyle: homePage.cardStyle,
        borderRadius: homePage.borderRadius,
        shadow: homePage.shadow,
        gradient: homePage.gradient,
      },
      sections: (homePage as any).sections,
    });
  } catch (err) {
    console.error("[HOME_PAGE_BUILDER] GET error:", err);
    return serverError("Failed to fetch home page sections");
  }
}
