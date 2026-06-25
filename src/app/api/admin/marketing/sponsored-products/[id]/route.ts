import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { sponsoredProductSchema, parseDate } from "@/lib/marketing/schemas";
import { revalidateTag } from "next/cache";
import { z } from "zod";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;
    const data = sponsoredProductSchema.parse(await req.json());

    const existing = await prisma.sponsoredProduct.findFirst({ where: { id, organizationId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    const item = await prisma.sponsoredProduct.update({
      where: { id },
      data: {
        productId: data.productId,
        priority: data.priority,
        badgeText: data.badgeText,
        startDate: parseDate(data.startDate),
        endDate: parseDate(data.endDate),
        isActive: data.isActive,
      },
      include: {
        product: { select: { id: true, name: true, slug: true, price: true, images: true } },
      },
    });

    revalidateTag("marketing-ads");
    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to update" },
      { status: err.statusCode ?? 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.sponsoredProduct.findFirst({ where: { id, organizationId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    await prisma.sponsoredProduct.delete({ where: { id } });
    revalidateTag("marketing-ads");
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to delete" },
      { status: err.statusCode ?? 500 }
    );
  }
}
