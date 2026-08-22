import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-api";

// POST - Duplicate section
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get original section
    const originalSection = await (prisma as any).homepageSection.findUnique({
      where: { id },
    });

    if (!originalSection) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Create duplicate
    const duplicateSection = await (prisma as any).homepageSection.create({
      data: {
        builderId: originalSection.builderId,
        sectionType: originalSection.sectionType,
        displayOrder: originalSection.displayOrder + 1,
        config: originalSection.config,
        translations: originalSection.translations,
        isEnabled: false, // Duplicates start as disabled
        publishStatus: "DRAFT",
        createdBy: session.userId,
      },
    });

    return NextResponse.json(duplicateSection);
  } catch (error) {
    console.error("Error duplicating section:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
