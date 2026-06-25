import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { sponsoredProductSchema, parseDate } from "@/lib/marketing/schemas";
import { revalidateTag } from "next/cache";
import { z } from "zod";

export async function GET() {
  try {
    const { organizationId } = await requireAdmin();
    const items = await prisma.sponsoredProduct.findMany({
      where: { organizationId },
      include: {
        product: { select: { id: true, name: true, slug: true, price: true, images: true } },
      },
      orderBy: { priority: "desc" },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to fetch sponsored products" },
      { status: err.statusCode ?? 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    const data = sponsoredProductSchema.parse(await req.json());

    const item = await prisma.sponsoredProduct.create({
      data: {
        organizationId,
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
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to create sponsored product" },
      { status: err.statusCode ?? 500 }
    );
  }
}
