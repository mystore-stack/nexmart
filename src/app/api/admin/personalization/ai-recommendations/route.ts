import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { getDefaultOrganizationId } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();

    const rules = await prisma.aIRecommendationRule.findMany({
      where: { organizationId, isActive: true },
      orderBy: { displayPriority: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: rules,
    });
  } catch (error: any) {
    console.error("[AI_RECOMMENDATIONS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const {
      name,
      description,
      strategy,
      productIds,
      categoryIds,
      minScore,
      maxResults,
      displayPriority,
    } = body;

    const rule = await prisma.aIRecommendationRule.create({
      data: {
        organizationId,
        name,
        description,
        strategy,
        productIds: productIds || [],
        categoryIds: categoryIds || [],
        minScore: minScore || 0.5,
        maxResults: maxResults || 5,
        displayPriority: displayPriority || 0,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: rule,
    });
  } catch (error: any) {
    console.error("[AI_RECOMMENDATIONS_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const { id, ...updateData } = body;

    const rule = await prisma.aIRecommendationRule.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: rule,
    });
  } catch (error: any) {
    console.error("[AI_RECOMMENDATIONS_PUT]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

    await prisma.aIRecommendationRule.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "AI recommendation rule deleted",
    });
  } catch (error: any) {
    console.error("[AI_RECOMMENDATIONS_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
