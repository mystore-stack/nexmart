import { NextRequest, NextResponse } from "next/server";
import { GoogleIntegrationService } from "@/lib/google";
import { requireAdmin } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get("organizationId") || organizationId;

    const dashboard = await GoogleIntegrationService.getDashboardData(orgId);

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Google dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Google integration dashboard" },
      { status: 500 }
    );
  }
}
