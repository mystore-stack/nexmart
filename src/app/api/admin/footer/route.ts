import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import { emitCMSEvent, CMSEventType } from "@/lib/cms/event-bus";
import { z } from "zod";

const footerConfigSchema = z.object({
  logoUrl: z.string().optional(),
  description: z.string().optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string(),
    icon: z.string(),
  })),
  contactInfo: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  quickLinks: z.array(z.object({
    title: z.string(),
    url: z.string(),
  })),
  legalLinks: z.array(z.object({
    title: z.string(),
    url: z.string(),
  })),
  isActive: z.boolean().default(true),
});

// GET - Get footer configuration
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();

    const config = await prisma.footerConfig.findFirst({
      where: { organizationId, isActive: true },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error("[FOOTER GET ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch footer config" },
      { status: 500 }
    );
  }
}

// POST - Create footer configuration
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();
    const data = footerConfigSchema.parse(body);

    // Deactivate existing configs
    await prisma.footerConfig.updateMany({
      where: { organizationId },
      data: { isActive: false },
    });

    const config = await prisma.footerConfig.create({
      data: {
        organizationId,
        ...data,
      },
    });

    // Invalidate CMS cache
    await revalidateSiteContent(organizationId);

    // Emit event
    await emitCMSEvent({
      type: CMSEventType.FOOTER_UPDATED,
      domain: 'footer',
      organizationId,
      timestamp: new Date(),
      data: config,
      metadata: { source: 'admin' },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error("[FOOTER POST ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create footer config" },
      { status: 500 }
    );
  }
}

// PUT - Update footer configuration
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();
    const data = footerConfigSchema.parse(body);

    const config = await prisma.footerConfig.updateMany({
      where: { organizationId },
      data,
    });

    // Invalidate CMS cache
    await revalidateSiteContent(organizationId);

    // Emit event
    await emitCMSEvent({
      type: CMSEventType.FOOTER_UPDATED,
      domain: 'footer',
      organizationId,
      timestamp: new Date(),
      data,
      metadata: { source: 'admin' },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error("[FOOTER PUT ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update footer config" },
      { status: 500 }
    );
  }
}
