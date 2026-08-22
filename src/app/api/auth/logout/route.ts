// src/app/api/auth/logout/route.ts
// DEPRECATED: Use NextAuth for authentication
// Logout via: POST /api/auth/signout
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: "DEPRECATED: Use NextAuth for authentication. Logout via POST /api/auth/signout.",
      redirectTo: "/api/auth/signout",
    },
    { status: 410 }
  );
}
