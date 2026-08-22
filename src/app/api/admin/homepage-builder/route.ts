import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-api";

// GET - Fetch homepage builder configuration
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
    }

    // Get or create homepage builder using raw query if models don't exist
    let builder;
    try {
      builder = await (prisma as any).homepageBuilder.findFirst({
        where: { organizationId },
        include: {
          sections: {
            orderBy: { displayOrder: "asc" },
          },
        },
      });
    } catch (modelError) {
      console.error("HomepageBuilder model not found:", modelError);
      return NextResponse.json({ error: "HomepageBuilder model not available. Please run 'npx prisma generate'" }, { status: 500 });
    }

    if (!builder) {
      try {
        builder = await (prisma as any).homepageBuilder.create({
          data: {
            organizationId,
            name: "Homepage",
          },
          include: {
            sections: {
              orderBy: { displayOrder: "asc" },
            },
          },
        });
      } catch (createError) {
        console.error("Error creating homepage builder:", createError);
        return NextResponse.json({ error: "Failed to create homepage builder" }, { status: 500 });
      }
    }

    return NextResponse.json({ builder, sections: builder.sections });
  } catch (error) {
    console.error("Error fetching homepage builder:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new homepage section
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { organizationId, sectionType, displayOrder } = body;

    if (!organizationId || !sectionType) {
      return NextResponse.json(
        { error: "Organization ID and section type required" },
        { status: 400 }
      );
    }

    // Get or create homepage builder
    let builder;
    try {
      builder = await (prisma as any).homepageBuilder.findFirst({
        where: { organizationId },
      });
    } catch (modelError) {
      console.error("HomepageBuilder model not found:", modelError);
      return NextResponse.json({ error: "HomepageBuilder model not available. Please run 'npx prisma generate'" }, { status: 500 });
    }

    if (!builder) {
      try {
        builder = await (prisma as any).homepageBuilder.create({
          data: {
            organizationId,
            name: "Homepage",
          },
        });
      } catch (createError) {
        console.error("Error creating homepage builder:", createError);
        return NextResponse.json({ error: "Failed to create homepage builder" }, { status: 500 });
      }
    }

    // Create new section
    let section;
    try {
      section = await (prisma as any).homepageSection.create({
        data: {
          builderId: builder.id,
          sectionType,
          displayOrder: displayOrder || 0,
          config: {},
          translations: {},
          createdBy: session.userId,
        },
      });
    } catch (sectionError) {
      console.error("Error creating homepage section:", sectionError);
      return NextResponse.json({ error: "Failed to create homepage section" }, { status: 500 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error("Error creating homepage section:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
