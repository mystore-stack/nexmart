import { NextRequest, NextResponse } from "next/server";
import { processAbandonedCarts } from "@/lib/notifications/abandonedCart";

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await processAbandonedCarts();

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CRON_ABANDONED_CART] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
