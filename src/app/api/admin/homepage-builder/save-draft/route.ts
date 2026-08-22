import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-api";

// POST - Save homepage as draft
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { organizationId, sections } = body;

    if (!organizationId || !Array.isArray(sections)) {
      return NextResponse.json({ error: "Organization ID and sections required" }, { status: 400 });
    }

    // Get or create homepage builder
    let builder = await (prisma as any).homepageBuilder.findFirst({
      where: { organizationId },
    });

    if (!builder) {
      builder = await (prisma as any).homepageBuilder.create({
        data: {
          organizationId,
          name: "Homepage",
          isPublished: false,
        },
      });
    }

    // Update all sections to draft status
    const updates = sections.map((section: any) =>
      (prisma as any).homepageSection.update({
        where: { id: section.id },
        data: {
          displayOrder: section.displayOrder,
          isEnabled: section.isEnabled,
          config: section.config,
          publishStatus: "DRAFT",
        },
      })
    );

    await Promise.all(updates);

    // Update builder
    await (prisma as any).homepageBuilder.update({
      where: { id: builder.id },
      data: {
        isPublished: false,
        version: builder.version + 1,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, version: builder.version + 1 });
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
