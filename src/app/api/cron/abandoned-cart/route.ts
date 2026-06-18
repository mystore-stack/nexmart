import { NextRequest, NextResponse } from "next/server";
import { detectAbandonedCarts } from "@/lib/automation/cart-abandonment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting abandoned cart detection...");

    await detectAbandonedCarts();

    console.log("[Cron] Abandoned cart detection completed");

    return NextResponse.json({ success: true, message: "Abandoned cart emails sent" });
  } catch (error) {
    console.error("[CRON_ABANDONED_CART] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
