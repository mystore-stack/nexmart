import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-api";

// POST - Auto-save homepage sections
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

    // Update all sections
    const updates = sections.map((section: any) =>
      (prisma as any).homepageSection.update({
        where: { id: section.id },
        data: {
          displayOrder: section.displayOrder,
          isEnabled: section.isEnabled,
          config: section.config,
        },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error auto-saving homepage:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
