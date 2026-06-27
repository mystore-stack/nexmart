import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List all featured categories
export async function GET() {
  try {
    const featuredCategories = await (prisma as any).featuredCategory.findMany({
      include: {
        category: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: featuredCategories,
    });
  } catch (error) {
    console.error("[FEATURED_CATEGORIES_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch featured categories" },
      { status: 500 }
    );
  }
}

// POST - Create featured category
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const { categoryId, order, enabled, backgroundColor, gradient, buttonText, buttonUrl, description } = body;

    const featuredCategory = await (prisma as any).featuredCategory.create({
      data: {
        category: {
          connect: { id: categoryId },
        },
        order: order || 0,
        enabled: enabled !== undefined ? enabled : true,
        backgroundColor,
        gradient,
        buttonText,
        buttonUrl,
        description,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: featuredCategory,
    });
  } catch (error) {
    console.error("[FEATURED_CATEGORIES_POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create featured category" },
      { status: 500 }
    );
  }
}
