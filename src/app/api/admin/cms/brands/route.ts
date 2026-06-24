import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { requireCmsPermission } from "@/lib/cms/auth";
import { CmsPermission } from "@/lib/cms/rbac";
import { brandSchema } from "@/lib/cms/schemas/brand";
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
    await requireCmsPermission(CmsPermission.CMS_BRANDS);
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
