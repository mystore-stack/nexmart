import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, notFound } from "@/lib/api-response";

// GET - Fetch all versions for a page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getDefaultOrganizationId();
    const pageId = id;

    // Verify page belongs to organization
    const page = await prisma.pageBuilderPage.findFirst({
      where: {
        id: pageId,
        organizationId,
      },
    });

    if (!page) {
      return notFound("Page not found");
    }

    const versions = await prisma.pageVersion.findMany({
      where: { pageId },
      orderBy: { versionNumber: "desc" },
    });

    return ok(versions);
  } catch (error) {
    console.error("Error fetching page versions:", error);
    return serverError("Failed to fetch page versions");
  }
}

// POST - Create a new version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getDefaultOrganizationId();
    const pageId = id;
    const body = await request.json();
    const { changeNote, isAutoSave = false, createdBy } = body;

    // Verify page belongs to organization
    const page = await prisma.pageBuilderPage.findFirst({
      where: {
        id: pageId,
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

    // Get the next version number
    const lastVersion = await prisma.pageVersion.findFirst({
      where: { pageId },
      orderBy: { versionNumber: "desc" },
    });

    const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    // Create snapshot
    const snapshot = {
      page: {
        name: page.name,
        slug: page.slug,
        status: page.status,
        enabled: page.enabled,
        featured: page.featured,
        publishDate: page.publishDate,
        unpublishDate: page.unpublishDate,
        displayOrder: page.displayOrder,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        seoKeywords: page.seoKeywords,
        canonicalUrl: page.canonicalUrl,
        ogImage: page.ogImage,
        twitterImage: page.twitterImage,
        accentColor: page.accentColor,
        sectionBackground: page.sectionBackground,
        buttonStyle: page.buttonStyle,
        cardStyle: page.cardStyle,
        borderRadius: page.borderRadius,
        shadow: page.shadow,
        gradient: page.gradient,
      },
      sections: page.sections.map((section) => ({
        id: section.id,
        sectionType: section.sectionType,
        enabled: section.enabled,
        displayOrder: section.displayOrder,
        visibility: section.visibility,
        backgroundColor: section.backgroundColor,
        backgroundImage: section.backgroundImage,
        overlayColor: section.overlayColor,
        overlayOpacity: section.overlayOpacity,
        layoutStyle: section.layoutStyle,
        themeVariant: section.themeVariant,
        spacing: section.spacing,
        config: section.config,
      })),
      banners: page.banners.map((banner) => ({
        id: banner.id,
        image: banner.image,
        mobileImage: banner.mobileImage,
        link: banner.link,
        openInNewTab: banner.openInNewTab,
        startDate: banner.startDate,
        endDate: banner.endDate,
        active: banner.active,
        priority: banner.priority,
      })),
    };

    const version = await prisma.pageVersion.create({
      data: {
        pageId,
        versionNumber: nextVersionNumber,
        changeNote,
        isAutoSave,
        snapshot,
        createdBy,
      },
    });

    return ok(version, 201);
  } catch (error) {
    console.error("Error creating page version:", error);
    return serverError("Failed to create page version");
  }
}
