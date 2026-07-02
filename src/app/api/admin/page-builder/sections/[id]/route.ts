import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, notFound } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// PUT - Update a section
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    // Verify section's page belongs to organization
    const section = await prisma.pageSection.findFirst({
      where: { id },
      include: { page: true },
    });

    if (!section || section.page.organizationId !== organizationId) {
      return notFound("Section not found");
    }

    const updatedSection = await prisma.pageSection.update({
      where: { id },
      data: {
        sectionType: body.sectionType,
        enabled: body.enabled,
        displayOrder: body.displayOrder,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        visibility: body.visibility,
        backgroundColor: body.backgroundColor,
        backgroundImage: body.backgroundImage,
        overlayColor: body.overlayColor,
        overlayOpacity: body.overlayOpacity,
        layoutStyle: body.layoutStyle,
        themeVariant: body.themeVariant,
        spacing: body.spacing,
        config: body.config,
      },
    });

    return ok(updatedSection);
  } catch (err) {
    console.error("[PAGE_BUILDER_SECTIONS] PUT error:", err);
    return serverError("Failed to update section");
  }
}

// DELETE - Delete a section
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getDefaultOrganizationId();

    // Verify section's page belongs to organization
    const section = await prisma.pageSection.findFirst({
      where: { id },
      include: { page: true },
    });

    if (!section || section.page.organizationId !== organizationId) {
      return notFound("Section not found");
    }

    await prisma.pageSection.delete({
      where: { id },
    });

    return ok({ id });
  } catch (err) {
    console.error("[PAGE_BUILDER_SECTIONS] DELETE error:", err);
    return serverError("Failed to delete section");
  }
}
