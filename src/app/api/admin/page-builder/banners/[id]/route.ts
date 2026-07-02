import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ok, serverError, notFound } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// PUT - Update a banner
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    // Verify banner's page belongs to organization
    const banner = await prisma.pageBanner.findFirst({
      where: { id: params.id },
      include: { page: true },
    });

    if (!banner || banner.page.organizationId !== organizationId) {
      return notFound("Banner not found");
    }

    const updatedBanner = await prisma.pageBanner.update({
      where: { id: params.id },
      data: {
        image: body.image,
        mobileImage: body.mobileImage,
        link: body.link,
        openInNewTab: body.openInNewTab,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        active: body.active,
        priority: body.priority,
      },
    });

    return ok(updatedBanner);
  } catch (err) {
    console.error("[PAGE_BUILDER_BANNERS] PUT error:", err);
    return serverError("Failed to update banner");
  }
}

// DELETE - Delete a banner
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getDefaultOrganizationId();

    // Verify banner's page belongs to organization
    const banner = await prisma.pageBanner.findFirst({
      where: { id: params.id },
      include: { page: true },
    });

    if (!banner || banner.page.organizationId !== organizationId) {
      return notFound("Banner not found");
    }

    await prisma.pageBanner.delete({
      where: { id: params.id },
    });

    return ok({ id: params.id });
  } catch (err) {
    console.error("[PAGE_BUILDER_BANNERS] DELETE error:", err);
    return serverError("Failed to delete banner");
  }
}
