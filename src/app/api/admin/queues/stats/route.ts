import { NextRequest, NextResponse } from "next/server";
import { requireAuthFromRequest } from "@/lib/auth";
import { queueClient } from "@/lib/queue/client";

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuthFromRequest(req);
    if (authUser.role !== "ADMIN" && authUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
