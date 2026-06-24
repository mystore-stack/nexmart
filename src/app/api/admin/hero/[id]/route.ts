import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { z } from "zod";

const heroBannerSchema = z.object({
  badgeText: z.string().optional(),
  title: z.string().min(1, "Title is required").optional(),
  highlightedText: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  desktopImageUrl: z.string().url("Invalid desktop image URL").optional(),
  mobileImageUrl: z.string().url("Invalid mobile image URL").optional().nullable(),
  videoUrl: z.string().url("Invalid video URL").optional(),
  primaryButtonText: z.string().optional(),
  primaryButtonLink: z.string().url("Invalid primary button link").optional(),
  secondaryButtonText: z.string().optional(),
  secondaryButtonLink: z.string().url("Invalid secondary button link").optional(),
  backgroundColor: z.string().optional(),
  backgroundOverlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
  textColor: z.string().optional(),
  primaryButtonColor: z.string().optional(),
  secondaryButtonColor: z.string().optional(),
  heroHeight: z.string().optional(),
  heroPosition: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  publishDate: z.string().optional(),
  expireDate: z.string().optional(),
});

// PUT update hero banner (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    const body = await req.json();
    const validatedData = heroBannerSchema.parse(body);

    // Check if banner exists
    const existingBanner = await prisma.heroBanner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: "Hero banner not found" },
        { status: 404 }
      );
    }

    // Convert date strings to Date objects
    const data = {
      ...validatedData,
      publishDate: validatedData.publishDate ? new Date(validatedData.publishDate) : undefined,
      expireDate: validatedData.expireDate ? new Date(validatedData.expireDate) : undefined,
    };

    const banner = await prisma.heroBanner.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    console.error("[ADMIN HERO PUT ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update hero banner" },
      { status: 500 }
    );
  }
}

// DELETE hero banner (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    // Check if banner exists
    const existingBanner = await prisma.heroBanner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: "Hero banner not found" },
        { status: 404 }
      );
    }

    await prisma.heroBanner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Hero banner deleted" });
  } catch (error: any) {
    console.error("[ADMIN HERO DELETE ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete hero banner" },
      { status: 500 }
    );
  }
}
