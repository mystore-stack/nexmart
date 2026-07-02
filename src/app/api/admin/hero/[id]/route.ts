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
  title: z.string().min(1, "Title is required").optional(),
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const organizationId = await getDefaultOrganizationId();

    const body = await req.json();
    const validatedData = heroBannerSchema.parse(body);

    // Check if banner exists and belongs to organization
    const existingBanner = await prisma.heroBanner.findFirst({
      where: { id, organizationId },
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

    // Revalidate homepage to show updated banner
    revalidatePath("/");
    revalidatePath("/api/hero");

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const organizationId = await getDefaultOrganizationId();

    // Check if banner exists and belongs to organization
    const existingBanner = await prisma.heroBanner.findFirst({
      where: { id, organizationId },
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

    // Revalidate homepage to remove deleted banner
    revalidatePath("/");
    revalidatePath("/api/hero");

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
