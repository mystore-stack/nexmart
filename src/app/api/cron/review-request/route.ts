import { NextRequest, NextResponse } from "next/server";
import { processReviewRequests } from "@/lib/notifications/reviewRequest";

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await processReviewRequests();

    return NextResponse.json(result);
  } catch (error) {
    console.error("[CRON_REVIEW_REQUEST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
