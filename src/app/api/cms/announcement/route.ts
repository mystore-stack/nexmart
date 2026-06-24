// src/app/api/cms/announcement/route.ts - Announcement Bar CMS Endpoint
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { getCMSCache, setCMSCache } from "@/lib/cms/cache";
import type { AnnouncementBarSchema, CMSResponse } from "@/lib/cms/types";

// Force dynamic rendering and no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();

    // Try cache first
    const cached = await getCMSCache<AnnouncementBarSchema>('announcement', organizationId);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
      } as CMSResponse<AnnouncementBarSchema>, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Fetch from database
    const announcement = await prisma.announcementBar.findFirst({
      where: { 
        organizationId,
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } }
        ],
        AND: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      },
      orderBy: { displayOrder: "asc" },
    });

    if (!announcement) {
      return NextResponse.json({
        success: true,
        data: null,
        timestamp: new Date().toISOString(),
      } as CMSResponse<AnnouncementBarSchema>, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Cache the result
    await setCMSCache('announcement', organizationId, announcement);

    return NextResponse.json({
      success: true,
      data: announcement,
      timestamp: new Date().toISOString(),
    } as CMSResponse<AnnouncementBarSchema>, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("[CMS ANNOUNCEMENT GET ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch announcement bar", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
