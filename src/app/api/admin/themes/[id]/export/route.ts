import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";

// GET - Export a theme as JSON
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

    const exportData = {
      version: theme.version,
      name: theme.name,
      description: theme.description,
      settings: theme.settings,
      colorPalette: theme.colorPalette,
      typography: theme.typography,
      componentOverrides: theme.componentOverrides,
      layoutSettings: theme.layoutSettings,
      animations: theme.animations,
      headerConfig: theme.headerConfig,
      footerConfig: theme.footerConfig,
      sectionStyles: theme.sectionStyles,
      customCSS: theme.customCSS,
      customJS: theme.customJS,
      previewImage: theme.previewImage,
      exportedAt: new Date().toISOString(),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${theme.name.replace(/\s+/g, "_")}_theme.json"`,
      },
    });
  } catch (error) {
    console.error("[THEME_API] EXPORT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export theme" },
      { status: 500 }
    );
  }
}
