import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { ThemeVersion } from "@prisma/client";

// POST - Import a theme from JSON
export async function POST(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const {
      version,
      name,
      description,
      settings,
      colorPalette,
      typography,
      componentOverrides,
      layoutSettings,
      animations,
      headerConfig,
      footerConfig,
      sectionStyles,
      customCSS,
      customJS,
      previewImage,
    } = body;

    if (!version || !name) {
      return NextResponse.json(
        { success: false, error: "Version and name are required" },
        { status: 400 }
      );
    }

    // Check if theme version already exists for this organization
    const existingTheme = await prisma.theme.findFirst({
      where: { organizationId, version: version as ThemeVersion },
    });

    if (existingTheme) {
      return NextResponse.json(
        { success: false, error: "Theme version already exists" },
        { status: 400 }
      );
    }

    const theme = await prisma.theme.create({
      data: {
        organizationId,
        version: version as ThemeVersion,
        name,
        description,
        isActive: false,
        settings: settings || {},
        colorPalette: colorPalette || {},
        typography: typography || {},
        componentOverrides: componentOverrides || {},
        layoutSettings: layoutSettings || {},
        animations: animations || {},
        headerConfig: headerConfig || {},
        footerConfig: footerConfig || {},
        sectionStyles: sectionStyles || {},
        customCSS,
        customJS,
        previewImage,
      },
    });

    return NextResponse.json({ success: true, theme });
  } catch (error) {
    console.error("[THEME_API] IMPORT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import theme" },
      { status: 500 }
    );
  }
}
