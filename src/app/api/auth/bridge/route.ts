import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/next-auth.config";
import { getOrganizationIdForUser } from "@/lib/tenant";

export const dynamic = "force-dynamic";

async function handleBridgeRequest(req: NextRequest, method: string) {
  try {
    console.log(`[AUTH BRIDGE] ${method} - Starting request`);

    const session = await auth();

    console.log("[AUTH BRIDGE] Session retrieved:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role,
    });

    if (!session?.user) {
      console.log("[AUTH BRIDGE] No session found, returning 401");
      return NextResponse.json(
        { success: false, error: "Unauthorized", authenticated: false },
        { status: 401 }
      );
    }

    // Get organizationId for the user
    let organizationId: string | null = null;
    try {
      organizationId = await getOrganizationIdForUser({ userId: session.user.id });
      console.log("[AUTH BRIDGE] OrganizationId resolved:", organizationId);
    } catch (error) {
      console.error("[AUTH BRIDGE] Error getting organizationId:", error);
      // Don't fail the request if organizationId can't be resolved
      // This allows the frontend to still work even if organization setup is incomplete
    }

    const response = {
      success: true,
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        image: session.user.image,
      },
      organizationId,
    };

    console.log("[AUTH BRIDGE] Response:", {
      success: response.success,
      authenticated: response.authenticated,
      userId: response.user.id,
      organizationId: response.organizationId,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[AUTH BRIDGE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", authenticated: false },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleBridgeRequest(req, "GET");
}

export async function POST(req: NextRequest) {
  return handleBridgeRequest(req, "POST");
}
