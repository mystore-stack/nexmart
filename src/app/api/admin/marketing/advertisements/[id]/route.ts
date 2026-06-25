import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { advertisementSchema, parseDate } from "@/lib/marketing/schemas";
import { revalidateTag } from "next/cache";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;

    const ad = await prisma.advertisement.findFirst({
      where: { id, organizationId },
      include: { campaign: { select: { id: true, name: true, type: true } } },
    });

    if (!ad) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: ad });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to fetch advertisement" },
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
    const data = advertisementSchema.parse(await req.json());

    const existing = await prisma.advertisement.findFirst({ where: { id, organizationId } });
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const ad = await prisma.advertisement.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        imageDesktop: data.imageDesktop,
        imageMobile: data.imageMobile,
        videoUrl: data.videoUrl,
        ctaText: data.ctaText,
        ctaUrl: data.ctaUrl,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        placement: data.placement,
        priority: data.priority,
        status: data.status,
        startDate: parseDate(data.startDate),
        endDate: parseDate(data.endDate),
        campaignId: data.campaignId,
        targetCountries: data.targetCountries,
        targetLanguages: data.targetLanguages,
        targetDevices: data.targetDevices,
        visitorTarget: data.visitorTarget,
      },
      include: { campaign: { select: { id: true, name: true, type: true } } },
    });

    revalidateTag("marketing-ads");
    return NextResponse.json({ success: true, data: ad });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to update advertisement" },
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

    const existing = await prisma.advertisement.findFirst({ where: { id, organizationId } });
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await prisma.advertisement.delete({ where: { id } });
    revalidateTag("marketing-ads");
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to delete advertisement" },
      { status: err.statusCode ?? 500 }
    );
  }
}
