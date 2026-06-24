import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { requireCmsPermission } from "@/lib/cms/auth";
import { CmsPermission } from "@/lib/cms/rbac";
import { navigationMenuSchema, navigationMenuItemSchema } from "@/lib/cms/schemas/navigation";
import { logCmsActivity } from "@/lib/cms/audit";
import { z } from "zod";

export async function GET() {
  try {
    await requireCmsPermission(CmsPermission.CMS_NAVIGATION);
    const orgId = await getDefaultOrganizationId();

    const menus = await prisma.navigationMenu.findMany({
      where: { organizationId: orgId },
      include: {
        items: { orderBy: { displayOrder: "asc" } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, menus });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch menus";
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireCmsPermission(CmsPermission.CMS_NAVIGATION);
    const orgId = await getDefaultOrganizationId();
    const body = await req.json();

    const menuData = navigationMenuSchema.parse(body.menu ?? body);
    const items = z.array(navigationMenuItemSchema).optional().parse(body.items);

    const menu = await prisma.navigationMenu.create({
      data: {
        organizationId: orgId,
        name: menuData.name,
        location: menuData.location,
        isActive: menuData.isActive,
        items: items
          ? {
              create: items.map((item, index) => ({
                label: item.label,
                url: item.url,
                icon: item.icon,
                target: item.target,
                isVisible: item.isVisible,
                displayOrder: item.displayOrder ?? index,
                badge: item.badge,
                parentId: item.parentId,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });

    await logCmsActivity({
      userId: session.userId,
      organizationId: orgId,
      entityType: "navigation_menu",
      entityId: menu.id,
      action: "CREATE",
    });

    return NextResponse.json({ success: true, menu }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to create menu";
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
