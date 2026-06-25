import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-api";
import { getMarketingAnalytics } from "@/lib/marketing/data";

export async function GET() {
  try {
    const { organizationId } = await requireAdmin();
    const analytics = await getMarketingAnalytics(organizationId);
    return NextResponse.json({ success: true, data: analytics });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message ?? "Failed to fetch analytics" },
      { status: err.statusCode ?? 500 }
    );
  }
}
