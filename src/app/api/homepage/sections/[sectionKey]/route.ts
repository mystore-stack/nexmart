import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeToCanonicalKey, getCanonicalSection } from "@/lib/homepage/canonical-contract";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    const { sectionKey: rawKey } = await params;

    // Normalize section key
    const sectionKey = normalizeToCanonicalKey(rawKey);
    const canonicalSection = getCanonicalSection(rawKey);
    console.log("[PUBLIC SECTION] RAW KEY:", rawKey);
    console.log("[PUBLIC SECTION] NORMALIZED KEY:", sectionKey);

    if (!sectionKey || !canonicalSection) {
      console.error("[PUBLIC SECTION] Invalid section key:", rawKey);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid section key",
        },
        { status: 400 }
      );
    }

    // Warn about legacy usage
    if (rawKey !== sectionKey) {
      console.warn("[PUBLIC SECTION] Legacy section key used:", rawKey, "->", sectionKey);
    }

    const section = await prisma.homePageSection.findFirst({
      where: { sectionKey },
      include: {
        products: {
          where: { active: true },
          orderBy: { order: "asc" },
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        {
          success: false,
          error: "Section not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error("Error fetching homepage section:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch homepage section",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    const { sectionKey: rawKey } = await params;

    // Normalize section key
    const sectionKey = normalizeToCanonicalKey(rawKey);
    const canonicalSection = getCanonicalSection(rawKey);
    console.log("[PUBLIC SECTION PUT] RAW KEY:", rawKey);
    console.log("[PUBLIC SECTION PUT] NORMALIZED KEY:", sectionKey);

    if (!sectionKey || !canonicalSection) {
      console.error("[PUBLIC SECTION PUT] Invalid section key:", rawKey);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid section key",
        },
        { status: 400 }
      );
    }

    // Warn about legacy usage
    if (rawKey !== sectionKey) {
      console.warn("[PUBLIC SECTION PUT] Legacy section key used:", rawKey, "->", sectionKey);
    }

    const body = await request.json();

    const existingSection = await prisma.homePageSection.findFirst({
      where: { sectionKey },
    });

    let section;
    if (existingSection) {
      section = await prisma.homePageSection.update({
        where: { id: existingSection.id },
        data: {
          title: body.title,
          subtitle: body.subtitle,
          description: body.description,
          bannerImage: body.bannerImage,
          viewAllButton: body.viewAllButton,
          destinationUrl: body.destinationUrl,
          order: body.order,
          displayOrder: body.displayOrder,
          active: body.active ?? true,
          maxProducts: body.maxProducts,
          hideIfEmpty: body.hideIfEmpty,
        },
      });
    } else {
      section = await prisma.homePageSection.create({
        data: {
          sectionKey,
          title: body.title,
          subtitle: body.subtitle,
          description: body.description,
          bannerImage: body.bannerImage,
          viewAllButton: body.viewAllButton,
          destinationUrl: body.destinationUrl,
          order: body.order ?? 0,
          displayOrder: body.displayOrder ?? 0,
          active: body.active ?? true,
          maxProducts: body.maxProducts ?? 12,
          hideIfEmpty: body.hideIfEmpty ?? false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error("Error updating homepage section:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update homepage section",
      },
      { status: 500 }
    );
  }
}
