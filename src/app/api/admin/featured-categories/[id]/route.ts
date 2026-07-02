import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Update featured category
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await requireAdmin();
    const body = await req.json();

    const { enabled, order, backgroundColor, gradient, buttonText, buttonUrl, description } = body;

    const featuredCategory = await (prisma as any).featuredCategory.update({
      where: { id },
      data: {
        ...(enabled !== undefined && { enabled }),
        ...(order !== undefined && { order }),
        ...(backgroundColor !== undefined && { backgroundColor }),
        ...(gradient !== undefined && { gradient }),
        ...(buttonText !== undefined && { buttonText }),
        ...(buttonUrl !== undefined && { buttonUrl }),
        ...(description !== undefined && { description }),
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
    console.error("[FEATURED_CATEGORIES_PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update featured category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete featured category
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await requireAdmin();

    await (prisma as any).featuredCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Featured category deleted successfully",
    });
  } catch (error) {
    console.error("[FEATURED_CATEGORIES_DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete featured category" },
      { status: 500 }
    );
  }
}
