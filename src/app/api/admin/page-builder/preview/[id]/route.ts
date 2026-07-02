import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, notFound } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch page data for preview (includes draft content)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();

    const page = await prisma.pageBuilderPage.findFirst({
      where: {
        id: params.id,
        organizationId,
      },
      include: {
        sections: {
          where: { enabled: true },
          orderBy: { displayOrder: "asc" },
        },
        banners: {
          where: { active: true },
          orderBy: { priority: "desc" },
        },
      },
    });

    if (!page) {
      return notFound("Page not found");
    }

    // Filter banners by date range
    const now = new Date();
    const activeBanners = page.banners.filter(
      (banner) =>
        (!banner.startDate || banner.startDate <= now) &&
        (!banner.endDate || banner.endDate >= now)
    );

    return ok({
      ...page,
      banners: activeBanners,
      isPreview: true,
    });
  } catch (err) {
    console.error("[PAGE_BUILDER_PREVIEW] GET error:", err);
    return serverError("Failed to fetch preview data");
  }
}
