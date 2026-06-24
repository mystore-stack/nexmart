import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { invalidateCMSCache } from "@/lib/cms/cache";
import { emitCMSEvent, CMSEventType } from "@/lib/cms/event-bus";
import { z } from "zod";

const announcementBarSchema = z.object({
  text: z.string().min(1, "Text is required"),
  icon: z.string().optional(),
  backgroundColor: z.string().default("#000000"),
  textColor: z.string().default("#ffffff"),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// GET - Get announcement bars
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();

    const announcements = await prisma.announcementBar.findMany({
      where: { organizationId },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ success: true, announcements });
  } catch (error: any) {
    console.error("[ANNOUNCEMENT GET ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

// POST - Create announcement bar
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();
    const data = announcementBarSchema.parse(body);

    const announcement = await prisma.announcementBar.create({
      data: {
        organizationId,
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
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

    return NextResponse.json({ success: true, announcement });
  } catch (error: any) {
    console.error("[ANNOUNCEMENT POST ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
