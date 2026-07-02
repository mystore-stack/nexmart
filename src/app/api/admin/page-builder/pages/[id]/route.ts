import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, notFound } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// GET - Fetch a single page builder page
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getDefaultOrganizationId();

    const page = await prisma.pageBuilderPage.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        sections: {
          orderBy: { displayOrder: "asc" },
        },
        banners: {
          orderBy: { priority: "desc" },
        },
        analytics: {
          orderBy: { date: "desc" },
          take: 30,
        },
      },
    });

    if (!page) {
      return notFound("Page not found");
    }

    return ok(page);
  } catch (err) {
    console.error("[PAGE_BUILDER] GET by ID error:", err);
    return serverError("Failed to fetch page");
  }
}

// PUT - Update a page builder page
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    // Fetch the current page to check if slug is being changed
    const currentPage = await prisma.pageBuilderPage.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!currentPage) {
      return notFound("Page not found");
    }

    // Only check for duplicate slug if the slug is being changed
    if (body.slug && body.slug !== currentPage.slug) {
      // Check if another page with the same slug already exists
      // NOT: { id } is required to exclude the current page from the duplicate check
      // This prevents false positives when the user keeps the same slug
      const existingPage = await prisma.pageBuilderPage.findFirst({
        where: {
          organizationId,
          slug: body.slug,
          id: { not: id }, // Exclude current page from duplicate check
        },
      });

      if (existingPage) {
        return NextResponse.json(
          { error: "A page with this slug already exists." },
          { status: 400 }
        );
      }
    }

    // Only include slug in update if it's provided and different from current
    // This prevents unnecessary updates that could trigger P2002
    const updateData: any = {
      name: body.name,
      status: body.status,
      enabled: body.enabled,
      featured: body.featured,
      publishDate: body.publishDate ? new Date(body.publishDate) : null,
      unpublishDate: body.unpublishDate ? new Date(body.unpublishDate) : null,
      displayOrder: body.displayOrder,
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
    };

    // Only update slug if it's explicitly provided and different
    if (body.slug && body.slug !== currentPage.slug) {
      updateData.slug = body.slug;
    }

    // Handle sections update if provided
    if (body.sections && Array.isArray(body.sections)) {
      // Delete existing sections
      await prisma.pageSection.deleteMany({
        where: { pageId: id },
      });

      // Create new sections
      if (body.sections.length > 0) {
        await prisma.pageSection.createMany({
          data: body.sections.map((section: any) => ({
            ...section,
            pageId: id,
          })),
        });
      }
    }

    const page = await prisma.pageBuilderPage.update({
      where: { id },
      data: updateData,
      include: {
        sections: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return ok(page);
  } catch (err: any) {
    console.error("[PAGE_BUILDER] PUT error:", err);

    // P2002 is caught as a safeguard in case a race condition or edge case
    // bypasses the pre-update duplicate check
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Slug already exists." },
        { status: 400 }
      );
    }

    return serverError("Failed to update page");
  }
}

// DELETE - Delete a page builder page
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getDefaultOrganizationId();

    const page = await prisma.pageBuilderPage.findFirst({
      where: { id, organizationId },
    });

    if (!page) {
      return notFound("Page not found");
    }

    await prisma.pageBuilderPage.delete({
      where: { id },
    });

    return ok({ id });
  } catch (err) {
    console.error("[PAGE_BUILDER] DELETE error:", err);
    return serverError("Failed to delete page");
  }
}
