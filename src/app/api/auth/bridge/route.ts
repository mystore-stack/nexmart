import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/next-auth.config";

export const dynamic = "force-dynamic";

/**
 * Auth Bridge Endpoint
 * 
 * This endpoint serves as a bridge between the client-side AuthProvider
 * and the server-side NextAuth session. It's called after successful
 * authentication to ensure the session is properly established.
 * 
 * This is a no-op endpoint that simply returns the current session status.
 * The act of calling this endpoint with credentials ensures cookies are
 * properly sent and received, establishing the session bridge.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    return NextResponse.json({
      success: true,
      authenticated: !!session,
      user: session?.user || null,
    });
  } catch (error) {
    console.error("[AUTH_BRIDGE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to bridge session",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    return NextResponse.json({
      success: true,
      authenticated: !!session,
      user: session?.user || null,
    });
  } catch (error) {
    console.error("[AUTH_BRIDGE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get session",
      },
      { status: 500 }
    );
  }
}
