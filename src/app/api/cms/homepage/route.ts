// src/app/api/cms/homepage/route.ts - Homepage CMS Endpoint
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { getCMSCache, setCMSCache } from "@/lib/cms/cache";
import type { HomepageConfigSchema, CMSResponse } from "@/lib/cms/types";

// Force dynamic rendering and no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();

    // Try cache first
    const cached = await getCMSCache<HomepageConfigSchema>('homepage', organizationId);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
      } as CMSResponse<HomepageConfigSchema>, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Fetch from database
    const homepageConfig = await prisma.homepageConfig.findFirst({
      where: { organizationId, isActive: true },
    });

    if (!homepageConfig) {
      return NextResponse.json({
        success: true,
        data: null,
        timestamp: new Date().toISOString(),
      } as CMSResponse<HomepageConfigSchema>, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Cache the result
    await setCMSCache('homepage', organizationId, homepageConfig);

    return NextResponse.json({
      success: true,
      data: homepageConfig,
      timestamp: new Date().toISOString(),
    } as CMSResponse<HomepageConfigSchema>, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("[CMS HOMEPAGE GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch homepage config", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
