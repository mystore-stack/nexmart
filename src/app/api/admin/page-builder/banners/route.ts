import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, badRequest, notFound } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch banners for a page
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return badRequest("pageId is required");
    }

    // Verify page belongs to organization
    const page = await prisma.pageBuilderPage.findFirst({
      where: { id: pageId, organizationId },
    });

    if (!page) {
      return notFound("Page not found");
    }

    const banners = await prisma.pageBanner.findMany({
      where: { pageId },
      orderBy: { priority: "desc" },
    });

    return ok(banners);
  } catch (err) {
    console.error("[PAGE_BUILDER_BANNERS] GET error:", err);
    return serverError("Failed to fetch banners");
  }
}

// POST - Create a new banner
export async function POST(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    // Verify page belongs to organization
    const page = await prisma.pageBuilderPage.findFirst({
      where: { id: body.pageId, organizationId },
    });

    if (!page) {
      return notFound("Page not found");
    }

    const banner = await prisma.pageBanner.create({
      data: {
        pageId: body.pageId,
        organizationId,
        image: body.image,
        mobileImage: body.mobileImage,
        link: body.link,
        openInNewTab: body.openInNewTab ?? false,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        active: body.active ?? true,
        priority: body.priority || 0,
      },
    });

    return ok(banner);
  } catch (err) {
    console.error("[PAGE_BUILDER_BANNERS] POST error:", err);
    return serverError("Failed to create banner");
  }
}
