// src/app/api/cms/media/route.ts - Media CMS Endpoint (Placeholder)
import { NextRequest, NextResponse } from "next/server";
import type { CMSResponse } from "@/lib/cms/types";

// Force dynamic rendering and no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  // Media sections not implemented yet - return empty
  return NextResponse.json({
    success: true,
    data: [],
    timestamp: new Date().toISOString(),
  } as CMSResponse<any[]>, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
