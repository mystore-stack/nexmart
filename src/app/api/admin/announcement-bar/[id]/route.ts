import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { invalidateCMSCache } from "@/lib/cms/cache";
import { emitCMSEvent, CMSEventType } from "@/lib/cms/event-bus";
import { revalidateSiteContent } from "@/lib/cms/revalidate";

// DELETE - Delete announcement bar
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const organizationId = await getDefaultOrganizationId();

    await prisma.announcementBar.delete({
      where: { id },
    });

    // Invalidate CMS cache
    await invalidateCMSCache('announcement', organizationId);

    // Emit event
    await emitCMSEvent({
      type: CMSEventType.ANNOUNCEMENT_UPDATED,
      domain: 'announcement',
      organizationId,
      timestamp: new Date(),
      data: { id },
      metadata: { source: 'admin' },
    });

    // Revalidate site content
    await revalidateSiteContent(organizationId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[ANNOUNCEMENT DELETE ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}

// PUT - Update announcement bar
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const organizationId = await getDefaultOrganizationId();

    const announcement = await prisma.announcementBar.update({
      where: { id },
      data: {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });

    // Invalidate CMS cache
    await invalidateCMSCache('announcement', organizationId);

    // Emit event
    await emitCMSEvent({
      type: CMSEventType.ANNOUNCEMENT_UPDATED,
      domain: 'announcement',
      organizationId,
      timestamp: new Date(),
      data: announcement,
      metadata: { source: 'admin' },
    });

    // Revalidate site content
    await revalidateSiteContent(organizationId);

    return NextResponse.json({ success: true, announcement });
  } catch (error: any) {
    console.error("[ANNOUNCEMENT PUT ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}
