import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { defaultThemes } from "@/lib/themes/default-themes";
import { ThemeVersion } from "@prisma/client";

// GET - List all themes for the organization
export async function GET() {
  try {
    const organizationId = await getDefaultOrganizationId();

    const themes = await prisma.theme.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, themes });
  } catch (error) {
    console.error("[THEME_API] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch themes" },
      { status: 500 }
    );
  }
}

// POST - Create a new theme
export async function POST(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const { version, name, description, isActive, config } = body;

    if (!version || !name) {
      return NextResponse.json(
        { success: false, error: "Version and name are required" },
        { status: 400 }
      );
    }

    // If this is being set as active, deactivate all other themes
    if (isActive) {
      await prisma.theme.updateMany({
        where: { organizationId },
        data: { isActive: false },
      });
    }

    const theme = await prisma.theme.create({
      data: {
        organizationId,
        version: version as ThemeVersion,
        name,
        description,
        isActive: isActive || false,
        settings: config?.settings || {},
        colorPalette: config?.colorPalette || {},
        typography: config?.typography || {},
        componentOverrides: config?.componentOverrides || {},
        layoutSettings: config?.layoutSettings || {},
        animations: config?.animations || {},
        headerConfig: config?.header || {},
        footerConfig: config?.footer || {},
        sectionStyles: config?.sectionStyles || {},
        customCSS: config?.customCSS,
        customJS: config?.customJS,
        previewImage: config?.previewImage,
      },
    });

    return NextResponse.json({ success: true, theme });
  } catch (error) {
    console.error("[THEME_API] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create theme" },
      { status: 500 }
    );
  }
}
