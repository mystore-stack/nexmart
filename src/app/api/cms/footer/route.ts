// src/app/api/cms/footer/route.ts - Footer CMS Endpoint
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { getCMSCache, setCMSCache } from "@/lib/cms/cache";
import type { FooterConfigSchema, CMSResponse } from "@/lib/cms/types";

// Force dynamic rendering and no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();

    // Try cache first
    const cached = await getCMSCache<FooterConfigSchema>('footer', organizationId);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
      } as CMSResponse<FooterConfigSchema>, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Fetch from database
    const footerConfig = await prisma.footerConfig.findFirst({
      where: { organizationId, isActive: true },
    });

    if (!footerConfig) {
      return NextResponse.json({
        success: true,
        data: null,
        timestamp: new Date().toISOString(),
      } as CMSResponse<FooterConfigSchema>, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Cache the result
    await setCMSCache('footer', organizationId, footerConfig);

    return NextResponse.json({
      success: true,
      data: footerConfig,
      timestamp: new Date().toISOString(),
    } as CMSResponse<FooterConfigSchema>, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("[CMS FOOTER GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch footer config", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
