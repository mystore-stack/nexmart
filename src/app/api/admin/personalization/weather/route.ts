import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { getDefaultOrganizationId } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();

    const weatherPersonalizations = await prisma.weatherPersonalization.findMany({
      where: { organizationId, isActive: true },
      orderBy: { displayPriority: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: weatherPersonalizations,
    });
  } catch (error: any) {
    console.error("[WEATHER_PERSONALIZATION_GET]", error);
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
      condition,
      minTemperature,
      maxTemperature,
      productIds,
      categoryIds,
      title,
      description,
      displayPriority,
    } = body;

    const personalization = await prisma.weatherPersonalization.create({
      data: {
        organizationId,
        condition,
        minTemperature,
        maxTemperature,
        productIds: productIds || [],
        categoryIds: categoryIds || [],
        title,
        description,
        displayPriority: displayPriority || 0,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: personalization,
    });
  } catch (error: any) {
    console.error("[WEATHER_PERSONALIZATION_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const { id, ...updateData } = body;

    const personalization = await prisma.weatherPersonalization.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: personalization,
    });
  } catch (error: any) {
    console.error("[WEATHER_PERSONALIZATION_PUT]", error);
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

    await prisma.weatherPersonalization.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Weather personalization deleted",
    });
  } catch (error: any) {
    console.error("[WEATHER_PERSONALIZATION_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
