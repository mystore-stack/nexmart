import { NextRequest, NextResponse } from "next/server";
import { GoogleIntegrationService } from "@/lib/google";
import { requireAdmin } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get("organizationId") || organizationId;

    const dashboard = await GoogleIntegrationService.getDashboardData(orgId);

    const connectedServices = dashboard.integrations
      .filter((i: any) => i.status === "CONNECTED")
      .map((i: any) => i.service);

    const disconnectedServices = dashboard.integrations
      .filter((i: any) => i.status === "DISCONNECTED")
      .map((i: any) => i.service);

    const configurationErrors = dashboard.integrations
      .filter((i: any) => i.status === "ERROR")
      .map((i: any) => ({
        service: i.service,
        error: i.error || "Unknown error",
      }));

    const serviceStatus = dashboard.integrations.map((i: any) => ({
      service: i.service,
      status: i.status,
      lastSync: i.lastSyncAt,
      error: i.error,
    }));

    const report = {
      connectedServices,
      disconnectedServices,
      configurationErrors,
      recommendations: dashboard.recommendations,
      healthScore: dashboard.healthScore,
      lastSync: dashboard.lastSync,
      serviceStatus,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Google reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Google integration reports" },
      { status: 500 }
    );
  }
}
