import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalAbsoluteUrl = (message: string) =>
  z.preprocess(emptyToUndefined, z.string().url(message).optional());

const optionalNullableAbsoluteUrl = (message: string) =>
  z.preprocess(emptyToUndefined, z.string().url(message).optional().nullable());

const optionalHeroLink = (message: string) =>
  z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine((value) => {
        if (value.startsWith("/") && !value.startsWith("//")) return true;

        try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      }, message)
      .optional()
  );

const heroBannerSchema = z.object({
  badgeText: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  highlightedText: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  desktopImageUrl: optionalAbsoluteUrl("Invalid desktop image URL"),
  mobileImageUrl: optionalNullableAbsoluteUrl("Invalid mobile image URL"),
  videoUrl: optionalAbsoluteUrl("Invalid video URL"),
  primaryButtonText: z.string().optional(),
  primaryButtonLink: optionalHeroLink("Invalid primary button link"),
  secondaryButtonText: z.string().optional(),
  secondaryButtonLink: optionalHeroLink("Invalid secondary button link"),
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

    const organizationId = await getDefaultOrganizationId();

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const banners = await prisma.heroBanner.findMany({
      where: {
        organizationId,
        ...(!includeInactive && { isActive: true }),
      },
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

    const organizationId = await getDefaultOrganizationId();

    const body = await req.json();
    const validatedData = heroBannerSchema.parse(body);

    // Convert date strings to Date objects
    const data = {
      ...validatedData,
      organizationId,
      publishDate: validatedData.publishDate ? new Date(validatedData.publishDate) : null,
      expireDate: validatedData.expireDate ? new Date(validatedData.expireDate) : null,
    };

    const banner = await prisma.heroBanner.create({
      data,
    });

    // Revalidate homepage to show new banner
    revalidatePath("/");
    revalidatePath("/api/hero");

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
