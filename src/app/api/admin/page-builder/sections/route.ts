import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, badRequest, notFound } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch sections for a page
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

    const sections = await prisma.pageSection.findMany({
      where: { pageId },
      orderBy: { displayOrder: "asc" },
    });

    return ok(sections);
  } catch (err) {
    console.error("[PAGE_BUILDER_SECTIONS] GET error:", err);
    return serverError("Failed to fetch sections");
  }
}

// POST - Create a new section
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

    const section = await prisma.pageSection.create({
      data: {
        pageId: body.pageId,
        sectionType: body.sectionType,
        enabled: body.enabled ?? true,
        displayOrder: body.displayOrder || 0,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        visibility: body.visibility || "ALL",
        backgroundColor: body.backgroundColor,
        backgroundImage: body.backgroundImage,
        overlayColor: body.overlayColor,
        overlayOpacity: body.overlayOpacity,
        layoutStyle: body.layoutStyle,
        themeVariant: body.themeVariant,
        spacing: body.spacing,
        config: (body.config || {}) as any,
      },
    });

    return ok(section);
  } catch (err) {
    console.error("[PAGE_BUILDER_SECTIONS] POST error:", err);
    return serverError("Failed to create section");
  }
}
