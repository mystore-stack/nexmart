// src/app/api/cron/low-stock-check/route.ts — Low Stock Alert Cron Job
import { NextRequest, NextResponse } from "next/server";
import { checkLowStock } from "@/lib/automation/stock-alerts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting low stock check...");

    await checkLowStock();

    console.log("[Cron] Low stock check completed");

    return NextResponse.json({ success: true, message: "Low stock alerts sent" });
  } catch (error) {
    console.error("[CRON_LOW_STOCK] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
