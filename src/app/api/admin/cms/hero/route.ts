import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCmsPermission } from "@/lib/cms/auth";
import { CmsPermission } from "@/lib/cms/rbac";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import { heroBannerSchema } from "@/lib/cms/schemas/hero";
import { logCmsActivity } from "@/lib/cms/audit";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    await requireCmsPermission(CmsPermission.CMS_VIEW);
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const banners = await prisma.heroBanner.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ priorityScore: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, banners });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch banners";
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_EDIT);
    const orgId = await getDefaultOrganizationId();
    const body = await req.json();
    const data = heroBannerSchema.parse(body);

    const banner = await prisma.heroBanner.create({
      data: {
        organizationId: orgId,
        ...data,
        publishDate: data.publishDate ? new Date(data.publishDate) : null,
        expireDate: data.expireDate ? new Date(data.expireDate) : null,
      },
    });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "hero_banner",
      entityId: banner.id,
      action: "CREATE",
    });

    await revalidateSiteContent(orgId);

    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to create banner";
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_EDIT);
    const orgId = await getDefaultOrganizationId();
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Banner ID is required" }, { status: 400 });
    }

    const parsedData = heroBannerSchema.partial().parse(data);

    const banner = await prisma.heroBanner.update({
      where: { id },
      data: {
        ...parsedData,
        publishDate: parsedData.publishDate ? new Date(parsedData.publishDate) : undefined,
        expireDate: parsedData.expireDate ? new Date(parsedData.expireDate) : undefined,
      },
    });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "hero_banner",
      entityId: banner.id,
      action: "UPDATE",
    });

    await revalidateSiteContent(orgId);

    return NextResponse.json({ success: true, banner });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to update banner";
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_DELETE);
    const orgId = await getDefaultOrganizationId();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Banner ID is required" }, { status: 400 });
    }

    await prisma.heroBanner.delete({ where: { id } });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "hero_banner",
      entityId: id,
      action: "DELETE",
    });

    await revalidateSiteContent(orgId);

    return NextResponse.json({ success: true, message: "Banner deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete banner";
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
