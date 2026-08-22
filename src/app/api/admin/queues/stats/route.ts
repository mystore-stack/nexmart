import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-api";
import { queueClient } from "@/lib/queue/client";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();

    const stats = await queueClient.getStats();

    return NextResponse.json({
      ...stats,
      queues: [],
    });
  } catch (error) {
    console.error("[ADMIN_QUEUES] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
