import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authErrorResponse, requireAiEngineerAccess } from "@/lib/admin-ai/auth";
import { getDatabaseOverview, getDatabaseSnapshot } from "@/lib/admin-ai/database";

export const dynamic = "force-dynamic";

const tableSchema = z.enum(["users", "products", "orders", "categories", "settings"]);

export async function GET(req: NextRequest) {
  try {
    const session = await requireAiEngineerAccess();
    const table = tableSchema.catch("users").parse(req.nextUrl.searchParams.get("table") || "users");
    const take = Number(req.nextUrl.searchParams.get("take") || 25);
    const [overview, snapshot] = await Promise.all([
      getDatabaseOverview(session.organizationId),
      getDatabaseSnapshot(session.organizationId, table, take),
    ]);
    return NextResponse.json({ success: true, overview, snapshot });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
