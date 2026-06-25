import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { flashDealSchema, parseDate, slugify } from "@/lib/marketing/schemas";
import { revalidateTag } from "next/cache";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;

    const deal = await prisma.flashDeal.findFirst({
      where: { id, organizationId },
      include: {
        products: {
          orderBy: { displayOrder: "asc" },
          include: {
            product: { select: { id: true, name: true, slug: true, price: true, comparePrice: true, images: true } },
          },
        },
        campaign: { select: { id: true, name: true } },
      },
    });

    if (!deal) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: deal });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to fetch flash deal" },
      { status: err.statusCode ?? 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = flashDealSchema.parse({
      ...body,
      slug: body.slug || slugify(body.name),
    });

    const existing = await prisma.flashDeal.findFirst({ where: { id, organizationId } });
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await prisma.flashDealProduct.deleteMany({ where: { flashDealId: id } });

    const deal = await prisma.flashDeal.update({
      where: { id },
      data: {
        campaignId: data.campaignId,
        name: data.name,
        slug: data.slug,
        discountPercent: data.discountPercent,
        discountAmount: data.discountAmount,
        startDate: parseDate(data.startDate)!,
        endDate: parseDate(data.endDate)!,
        autoStart: data.autoStart,
        autoEnd: data.autoEnd,
        status: data.status,
        isActive: data.isActive,
        products: {
          create: data.productIds.map((p) => ({
            productId: p.productId,
            discountPercent: p.discountPercent,
            discountPrice: p.discountPrice,
            displayOrder: p.displayOrder,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true, slug: true, price: true, comparePrice: true, images: true } },
          },
        },
      },
    });

    revalidateTag("marketing-ads");
    return NextResponse.json({ success: true, data: deal });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to update flash deal" },
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

    const existing = await prisma.flashDeal.findFirst({ where: { id, organizationId } });
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await prisma.flashDeal.delete({ where: { id } });
    revalidateTag("marketing-ads");
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to delete flash deal" },
      { status: err.statusCode ?? 500 }
    );
  }
}
