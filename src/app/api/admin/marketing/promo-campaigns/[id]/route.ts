import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { promoCampaignSchema, parseDate, slugify } from "@/lib/marketing/schemas";
import { revalidateTag } from "next/cache";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;

    const campaign = await prisma.promoCampaign.findFirst({
      where: { id, organizationId },
      include: {
        advertisements: { orderBy: { priority: "desc" } },
        flashDeals: true,
        _count: { select: { advertisements: true, flashDeals: true } },
      },
    });

    if (!campaign) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: campaign });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json({ success: false, error: err.message ?? "Failed" }, { status: err.statusCode ?? 500 });
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
    const data = promoCampaignSchema.parse({ ...body, slug: body.slug || slugify(body.name) });

    const existing = await prisma.promoCampaign.findFirst({ where: { id, organizationId } });
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const campaign = await prisma.promoCampaign.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
        description: data.description,
        status: data.status,
        startDate: parseDate(data.startDate),
        endDate: parseDate(data.endDate),
        bannerColor: data.bannerColor,
      },
      include: { _count: { select: { advertisements: true, flashDeals: true } } },
    });

    revalidateTag("marketing-ads");
    return NextResponse.json({ success: true, data: campaign });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json({ success: false, error: err.message ?? "Failed" }, { status: err.statusCode ?? 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.promoCampaign.findFirst({ where: { id, organizationId } });
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await prisma.promoCampaign.delete({ where: { id } });
    revalidateTag("marketing-ads");
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json({ success: false, error: err.message ?? "Failed" }, { status: err.statusCode ?? 500 });
  }
}
