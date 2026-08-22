import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-api";
import { sign } from "jsonwebtoken";

/**
 * Generate temporary SSE token for EventSource authentication
 * EventSource doesn't support custom headers, so we use query parameter
 */
export async function GET() {
  try {
    const session = await requireAuth();
    
    // Generate short-lived token (15 minutes) for SSE connection
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
    const token = sign(
      {
        userId: session.userId,
        email: session.email,
        role: session.role,
        organizationId: session.organizationId,
        type: 'sse'
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error("[SSE Token] Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate SSE token" },
      { status: 401 }
    );
  }
}