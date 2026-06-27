import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Update bundle deal
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const { enabled, order, name, description, bundlePrice, discountPercent, backgroundColor, gradient, buttonText, buttonUrl } = body;

    const bundleDeal = await (prisma as any).bundleDeal.update({
      where: { id: params.id },
      data: {
        ...(enabled !== undefined && { enabled }),
        ...(order !== undefined && { order }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(bundlePrice !== undefined && { bundlePrice }),
        ...(discountPercent !== undefined && { discountPercent }),
        ...(backgroundColor !== undefined && { backgroundColor }),
        ...(gradient !== undefined && { gradient }),
        ...(buttonText !== undefined && { buttonText }),
        ...(buttonUrl !== undefined && { buttonUrl }),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: bundleDeal,
    });
  } catch (error) {
    console.error("[BUNDLE_DEALS_PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update bundle deal" },
      { status: 500 }
    );
  }
}

// DELETE - Delete bundle deal
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();

    await (prisma as any).bundleDeal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Bundle deal deleted successfully",
    });
  } catch (error) {
    console.error("[BUNDLE_DEALS_DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete bundle deal" },
      { status: 500 }
    );
  }
}
