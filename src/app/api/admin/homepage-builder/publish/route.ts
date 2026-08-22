import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-api";
import { revalidatePath, revalidateTag } from "next/cache";

// POST - Publish homepage
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
    }

    // Get homepage builder
    const builder = await (prisma as any).homepageBuilder.findFirst({
      where: { organizationId },
      include: {
        sections: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!builder) {
      return NextResponse.json({ error: "Homepage builder not found" }, { status: 404 });
    }

    // Update all published sections
    const updates = builder.sections
      .filter((s: any) => s.isEnabled && s.publishStatus !== "ARCHIVED")
      .map((section: any) =>
        (prisma as any).homepageSection.update({
          where: { id: section.id },
          data: { 
            publishStatus: "PUBLISHED",
            publishedAt: new Date(),
          },
        })
      );

    await Promise.all(updates);

    // Update builder
    await (prisma as any).homepageBuilder.update({
      where: { id: builder.id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
        version: builder.version + 1,
      },
    });

    // Revalidate cache
    revalidatePath("/");
    revalidateTag("homepage");

    return NextResponse.json({ success: true, publishedCount: updates.length, version: builder.version + 1 });
  } catch (error) {
    console.error("Error publishing homepage:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
