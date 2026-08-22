import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";

// DELETE - Delete media asset
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.mediaAsset.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[MEDIA DELETE ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete media" },
      { status: 500 }
    );
  }
}

// PATCH - Update media asset metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { alt, category, tags } = body;

    const media = await prisma.mediaAsset.update({
      where: { id },
      data: {
        alt: alt || undefined,
        category: category || undefined,
        tags: tags || undefined,
      },
    });

    return NextResponse.json({ success: true, media });
  } catch (error: any) {
    console.error("[MEDIA PATCH ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update media" },
      { status: 500 }
    );
  }
}
