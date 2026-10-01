// src/app/api/auth/logout/route.ts
// DEPRECATED: Use /api/auth/logout-manual which uses NextAuth signOut()
// This endpoint is kept for backward compatibility but redirects to the correct one
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log("[LOGOUT] /api/auth/logout called - DEPRECATED, redirecting to /api/auth/logout-manual");
  console.log("[LOGOUT] Caller information:", {
    userAgent: req.headers.get("user-agent"),
    referer: req.headers.get("referer"),
    origin: req.headers.get("origin"),
  });
  return NextResponse.json(
    {
      success: false,
      error: "DEPRECATED: Use /api/auth/logout-manual which uses NextAuth signOut()",
      redirectTo: "/api/auth/logout-manual",
    },
    { status: 410 }
  );
}
