import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";

// DELETE - Delete testimonial
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[TESTIMONIAL DELETE ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}

// PUT - Update testimonial
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, testimonial });
  } catch (error: any) {
    console.error("[TESTIMONIAL PUT ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}
