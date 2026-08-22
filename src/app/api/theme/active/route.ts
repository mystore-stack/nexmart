import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import { defaultThemes } from "@/lib/themes/default-themes";
import { revalidateTag } from "next/cache";

export const revalidate = 300; // Revalidate every 5 minutes
export const dynamic = "force-dynamic";

// GET - Get the active theme for the organization
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getOptionalDefaultOrganizationId();

    // Check for cache revalidation request
    const revalidate = req.nextUrl.searchParams.get("revalidate");
    if (revalidate === "true") {
      revalidateTag("theme");
      revalidateTag("active-theme");
      return NextResponse.json({ success: true, revalidated: true });
    }

    // If no organization exists, return default theme
    if (!organizationId) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[THEME_API] No organization found, returning default theme");
      }
      return NextResponse.json({
        success: true,
        theme: defaultThemes["V1_CLASSIC"],
        isDefault: true,
      }, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "CDN-Cache-Control": "public, s-maxage=300",
        },
      });
    }

    const activeTheme = await prisma.theme.findFirst({
      where: { organizationId, isActive: true },
    });

    if (!activeTheme) {
      // Return default V1_CLASSIC theme if no active theme
      return NextResponse.json({
        success: true,
        theme: defaultThemes["V1_CLASSIC"],
        isDefault: true,
      }, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "CDN-Cache-Control": "public, s-maxage=300",
        },
      });
    }

    // Merge database theme with default theme config
    const defaultThemeConfig = defaultThemes[activeTheme.version] || defaultThemes["V1_CLASSIC"];
    
    const mergedTheme = {
      ...defaultThemeConfig,
      version: activeTheme.version,
      name: activeTheme.name,
      description: activeTheme.description,
      colorPalette: activeTheme.colorPalette as any || defaultThemeConfig.colorPalette,
      typography: activeTheme.typography as any || defaultThemeConfig.typography,
      componentOverrides: activeTheme.componentOverrides as any || defaultThemeConfig.componentOverrides,
      animations: activeTheme.animations as any || defaultThemeConfig.animations,
      header: activeTheme.headerConfig as any || defaultThemeConfig.header,
      footer: activeTheme.footerConfig as any || defaultThemeConfig.footer,
      sectionStyles: activeTheme.sectionStyles as any || defaultThemeConfig.sectionStyles,
      customCSS: activeTheme.customCSS || undefined,
      customJS: activeTheme.customJS || undefined,
    };

    return NextResponse.json({
      success: true,
      theme: mergedTheme,
      isDefault: false,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, s-maxage=300",
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[THEME_API] GET active theme error:", error);
    }
    // Return default theme on error instead of 500
    return NextResponse.json({
      success: true,
      theme: defaultThemes["V1_CLASSIC"],
      isDefault: true,
      error: "Failed to fetch active theme, using default",
    }, {
      status: 200, // Return 200 with default theme instead of 500
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }
}
