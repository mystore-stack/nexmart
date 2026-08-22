import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { defaultThemes } from "@/lib/themes/default-themes";
import { ThemeVersion } from "@prisma/client";

// GET - Get a single theme by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getDefaultOrganizationId();

    const theme = await prisma.theme.findFirst({
      where: { id, organizationId },
    });

    if (!theme) {
      return NextResponse.json(
        { success: false, error: "Theme not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, theme });
  } catch (error) {
    console.error("[THEME_API] GET by ID error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch theme" },
      { status: 500 }
    );
  }
}

// PUT - Update a theme
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const { name, description, isActive, config } = body;

    // Check if theme exists
    const existingTheme = await prisma.theme.findFirst({
      where: { id, organizationId },
    });

    if (!existingTheme) {
      return NextResponse.json(
        { success: false, error: "Theme not found" },
        { status: 404 }
      );
    }

    // If this is being set as active, deactivate all other themes
    if (isActive && !existingTheme.isActive) {
      await prisma.theme.updateMany({
        where: { organizationId, id: { not: id } },
        data: { isActive: false },
      });
    }

    const theme = await prisma.theme.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(config?.settings && { settings: config.settings }),
        ...(config?.colorPalette && { colorPalette: config.colorPalette }),
        ...(config?.typography && { typography: config.typography }),
        ...(config?.componentOverrides && { componentOverrides: config.componentOverrides }),
        ...(config?.layoutSettings && { layoutSettings: config.layoutSettings }),
        ...(config?.animations && { animations: config.animations }),
        ...(config?.header && { headerConfig: config.header }),
        ...(config?.footer && { footerConfig: config.footer }),
        ...(config?.sectionStyles && { sectionStyles: config.sectionStyles }),
        ...(config?.customCSS !== undefined && { customCSS: config.customCSS }),
        ...(config?.customJS !== undefined && { customJS: config.customJS }),
        ...(config?.previewImage !== undefined && { previewImage: config.previewImage }),
      },
    });

    return NextResponse.json({ success: true, theme });
  } catch (error) {
    console.error("[THEME_API] PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update theme" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a theme
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getDefaultOrganizationId();

    // Check if theme exists
    const existingTheme = await prisma.theme.findFirst({
      where: { id, organizationId },
    });

    if (!existingTheme) {
      return NextResponse.json(
        { success: false, error: "Theme not found" },
        { status: 404 }
      );
    }

    // Prevent deleting the active theme
    if (existingTheme.isActive) {
      return NextResponse.json(
        { success: false, error: "Cannot delete active theme" },
        { status: 400 }
      );
    }

    await prisma.theme.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Theme deleted successfully" });
  } catch (error) {
    console.error("[THEME_API] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete theme" },
      { status: 500 }
    );
  }
}
