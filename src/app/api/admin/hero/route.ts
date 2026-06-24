import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { z } from "zod";

const heroBannerSchema = z.object({
  badgeText: z.string().optional(),
  title: z.string().min(1, "Title is required"),
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
  overlayOpacity: z.number().min(0).max(1).default(0.5),
  textColor: z.string().optional(),
  primaryButtonColor: z.string().optional(),
  secondaryButtonColor: z.string().optional(),
  heroHeight: z.string().default("90vh"),
  heroPosition: z.string().default("center"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  publishDate: z.string().optional(),
  expireDate: z.string().optional(),
});

// GET all hero banners (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const banners = await prisma.heroBanner.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    console.error("[ADMIN HERO GET ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch hero banners" },
      { status: 500 }
    );
  }
}

// POST create new hero banner (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await req.json();
    const validatedData = heroBannerSchema.parse(body);

    // Convert date strings to Date objects
    const data = {
      ...validatedData,
      publishDate: validatedData.publishDate ? new Date(validatedData.publishDate) : null,
      expireDate: validatedData.expireDate ? new Date(validatedData.expireDate) : null,
    };

    const banner = await prisma.heroBanner.create({
      data,
    });

    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error: any) {
    console.error("[ADMIN HERO POST ERROR]", error);
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
      { success: false, error: "Failed to create hero banner" },
      { status: 500 }
    );
  }
}
