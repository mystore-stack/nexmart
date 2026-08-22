// src/app/api/auth/login/route.ts
// DEPRECATED: Use NextAuth for authentication
// Login via: POST /api/auth/signin with credentials provider
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: "DEPRECATED: Use NextAuth for authentication. Login via POST /api/auth/signin with credentials provider.",
      redirectTo: "/api/auth/signin",
    },
    { status: 410 }
  );
}
