import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCmsPermission } from "@/lib/cms/auth";
import { CmsPermission } from "@/lib/cms/rbac";

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
