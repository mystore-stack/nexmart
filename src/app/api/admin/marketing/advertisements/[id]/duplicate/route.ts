import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { revalidateTag } from "next/cache";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;

    const original = await prisma.advertisement.findFirst({ where: { id, organizationId } });
    if (!original) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const copy = await prisma.advertisement.create({
      data: {
        organizationId,
        campaignId: original.campaignId,
        title: `${original.title} (Copy)`,
        subtitle: original.subtitle,
        description: original.description,
        imageDesktop: original.imageDesktop,
        imageMobile: original.imageMobile,
        videoUrl: original.videoUrl,
        ctaText: original.ctaText,
        ctaUrl: original.ctaUrl,
        backgroundColor: original.backgroundColor,
        textColor: original.textColor,
        placement: original.placement,
        priority: original.priority,
        status: "DRAFT",
        startDate: original.startDate,
        endDate: original.endDate,
        targetCountries: original.targetCountries,
        targetLanguages: original.targetLanguages,
        targetDevices: original.targetDevices,
        visitorTarget: original.visitorTarget,
      },
    });

    revalidateTag("marketing-ads");
    return NextResponse.json({ success: true, data: copy });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to duplicate" },
      { status: err.statusCode ?? 500 }
    );
  }
}
