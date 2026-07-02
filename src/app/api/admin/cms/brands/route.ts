import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { requireCmsPermission } from "@/lib/cms/auth";
import { CmsPermission } from "@/lib/cms/rbac";
import { brandSchema } from "@/lib/cms/schemas/brand";
import { logCmsActivity } from "@/lib/cms/audit";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import slugify from "slugify";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    await requireCmsPermission(CmsPermission.CMS_BRANDS);
    const orgId = await getDefaultOrganizationId();
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured") === "true";

    const brands = await prisma.brand.findMany({
      where: {
        organizationId: orgId,
        ...(featured ? { isFeatured: true } : {}),
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ success: true, brands });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch brands";
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_BRANDS);
    const orgId = await getDefaultOrganizationId();
    const body = await req.json();
    const data = brandSchema.parse(body);

    const brand = await prisma.brand.create({
      data: {
        organizationId: orgId,
        name: data.name,
        slug: data.slug ?? slugify(data.name, { lower: true, strict: true }),
        logoUrl: data.logoUrl || null,
        bannerUrl: data.bannerUrl || null,
        description: data.description,
        website: data.website || null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        displayOrder: data.displayOrder,
      },
    });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "brand",
      entityId: brand.id,
      action: "CREATE",
    });

    await revalidateSiteContent(orgId);

    return NextResponse.json({ success: true, brand }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to create brand";
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_BRANDS);
    const orgId = await getDefaultOrganizationId();
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Brand ID is required" }, { status: 400 });
    }

    const parsedData = brandSchema.partial().parse(data);

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...parsedData,
        slug: parsedData.slug ?? (parsedData.name ? slugify(parsedData.name, { lower: true, strict: true }) : undefined),
      },
    });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "brand",
      entityId: brand.id,
      action: "UPDATE",
    });

    await revalidateSiteContent(orgId);

    return NextResponse.json({ success: true, brand });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to update brand";
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_BRANDS);
    const orgId = await getDefaultOrganizationId();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Brand ID is required" }, { status: 400 });
    }

    await prisma.brand.delete({ where: { id } });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "brand",
      entityId: id,
      action: "DELETE",
    });

    await revalidateSiteContent(orgId);

    return NextResponse.json({ success: true, message: "Brand deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete brand";
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
