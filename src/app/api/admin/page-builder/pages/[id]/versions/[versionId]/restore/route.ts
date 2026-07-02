import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, notFound } from "@/lib/api-response";

// POST - Restore a page from a specific version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id, versionId } = await params;
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

    // Get the version to restore
    const version = await prisma.pageVersion.findFirst({
      where: {
        id: versionId,
        pageId,
      },
    });

    if (!version) {
      return notFound("Version not found");
    }

    const snapshot = version.snapshot as any;

    // Restore page settings
    await prisma.pageBuilderPage.update({
      where: { id: pageId },
      data: {
        name: snapshot.page.name,
        slug: snapshot.page.slug,
        status: snapshot.page.status,
        enabled: snapshot.page.enabled,
        featured: snapshot.page.featured,
        publishDate: snapshot.page.publishDate ? new Date(snapshot.page.publishDate) : null,
        unpublishDate: snapshot.page.unpublishDate ? new Date(snapshot.page.unpublishDate) : null,
        displayOrder: snapshot.page.displayOrder,
        seoTitle: snapshot.page.seoTitle,
        seoDescription: snapshot.page.seoDescription,
        seoKeywords: snapshot.page.seoKeywords,
        canonicalUrl: snapshot.page.canonicalUrl,
        ogImage: snapshot.page.ogImage,
        twitterImage: snapshot.page.twitterImage,
        accentColor: snapshot.page.accentColor,
        sectionBackground: snapshot.page.sectionBackground,
        buttonStyle: snapshot.page.buttonStyle,
        cardStyle: snapshot.page.cardStyle,
        borderRadius: snapshot.page.borderRadius,
        shadow: snapshot.page.shadow,
        gradient: snapshot.page.gradient,
      },
    });

    // Delete existing sections
    await prisma.pageSection.deleteMany({
      where: { pageId },
    });

    // Restore sections
    if (snapshot.sections && Array.isArray(snapshot.sections)) {
      for (const section of snapshot.sections) {
        await prisma.pageSection.create({
          data: {
            pageId,
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
          },
        });
      }
    }

    // Delete existing banners
    await prisma.pageBanner.deleteMany({
      where: { pageId },
    });

    // Restore banners
    if (snapshot.banners && Array.isArray(snapshot.banners)) {
      for (const banner of snapshot.banners) {
        await prisma.pageBanner.create({
          data: {
            pageId,
            organizationId,
            image: banner.image,
            mobileImage: banner.mobileImage,
            link: banner.link,
            openInNewTab: banner.openInNewTab,
            startDate: banner.startDate ? new Date(banner.startDate) : null,
            endDate: banner.endDate ? new Date(banner.endDate) : null,
            active: banner.active,
            priority: banner.priority,
          },
        });
      }
    }

    // Create a new version for the restore action
    const lastVersion = await prisma.pageVersion.findFirst({
      where: { pageId },
      orderBy: { versionNumber: "desc" },
    });

    const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    await prisma.pageVersion.create({
      data: {
        pageId,
        versionNumber: nextVersionNumber,
        changeNote: `Restored from version ${version.versionNumber}`,
        isAutoSave: false,
        snapshot,
      },
    });

    return ok({
      message: "Page restored successfully",
      restoredFromVersion: version.versionNumber,
      newVersionNumber: nextVersionNumber,
    });
  } catch (error) {
    console.error("Error restoring page version:", error);
    return serverError("Failed to restore page version");
  }
}
