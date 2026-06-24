import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { invalidateCMSCache } from "@/lib/cms/cache";
import { emitCMSEvent, CMSEventType } from "@/lib/cms/event-bus";
import { z } from "zod";

const homepageConfigSchema = z.object({
  featuredCategories: z.array(z.string()),
  featuredProducts: z.array(z.string()),
  featuredBrands: z.array(z.string()),
  testimonials: z.array(z.object({
    name: z.string(),
    role: z.string().optional(),
    avatarUrl: z.string().optional(),
    rating: z.number().min(1).max(5),
    content: z.string(),
  })),
  newsletterEnabled: z.boolean().default(true),
  newsletterTitle: z.string().optional(),
  newsletterSubtitle: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET - Get homepage configuration
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();

    const config = await prisma.homepageConfig.findFirst({
      where: { organizationId, isActive: true },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error("[HOMEPAGE GET ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch homepage config" },
      { status: 500 }
    );
  }
}

// POST - Create homepage configuration
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();
    const data = homepageConfigSchema.parse(body);

    // Deactivate existing configs
    await prisma.homepageConfig.updateMany({
      where: { organizationId },
      data: { isActive: false },
    });

    const config = await prisma.homepageConfig.create({
      data: {
        organizationId,
        ...data,
      },
    });

    // Invalidate CMS cache
    await invalidateCMSCache('homepage', organizationId);

    // Emit event
    await emitCMSEvent({
      type: CMSEventType.HOMEPAGE_UPDATED,
      domain: 'homepage',
      organizationId,
      timestamp: new Date(),
      data: config,
      metadata: { source: 'admin' },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error("[HOMEPAGE POST ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create homepage config" },
      { status: 500 }
    );
  }
}

// PUT - Update homepage configuration
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();
    const data = homepageConfigSchema.parse(body);

    const config = await prisma.homepageConfig.updateMany({
      where: { organizationId },
      data,
    });

    // Invalidate CMS cache
    await invalidateCMSCache('homepage', organizationId);

    // Emit event
    await emitCMSEvent({
      type: CMSEventType.HOMEPAGE_UPDATED,
      domain: 'homepage',
      organizationId,
      timestamp: new Date(),
      data,
      metadata: { source: 'admin' },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error("[HOMEPAGE PUT ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update homepage config" },
      { status: 500 }
    );
  }
}
