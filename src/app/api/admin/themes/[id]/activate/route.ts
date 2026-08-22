import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { revalidatePath } from "next/cache";

// POST - Activate a theme
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getDefaultOrganizationId();

    // Check if theme exists
    const theme = await prisma.theme.findFirst({
      where: { id, organizationId },
    });

    if (!theme) {
      return NextResponse.json(
        { success: false, error: "Theme not found" },
        { status: 404 }
      );
    }

    // Deactivate all other themes
    await prisma.theme.updateMany({
      where: { organizationId, id: { not: id } },
      data: { isActive: false },
    });

    // Activate this theme
    const activatedTheme = await prisma.theme.update({
      where: { id },
      data: { isActive: true },
    });

    // Revalidate all pages to apply the new theme
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/categories");
    revalidatePath("/checkout");
    revalidatePath("/cart");

    return NextResponse.json({ success: true, theme: activatedTheme });
  } catch (error) {
    console.error("[THEME_API] ACTIVATE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to activate theme" },
      { status: 500 }
    );
  }
}
