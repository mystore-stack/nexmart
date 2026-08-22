import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-api";

// PUT - Update section order
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "Sections array required" }, { status: 400 });
    }

    // Update display order for all sections
    const updates = sections.map((section: { id: string; displayOrder: number }) =>
      (prisma as any).homepageSection.update({
        where: { id: section.id },
        data: { displayOrder: section.displayOrder },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating section order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
