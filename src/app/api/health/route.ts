// src/app/api/health/route.ts — NexMart Health Check
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateOrganizationSetup } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  // Database health check
  let dbOk = false;
  let dbLatency = 0;
  try {
    const dbStart = Date.now();
    await (prisma as any).$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
    dbOk = true;
  } catch (error) {
    console.error("[HEALTH] Database check failed:", error);
  }

  // Organization setup validation
  let orgOk = false;
  let orgError = null;
  try {
    const validation = await validateOrganizationSetup();
    orgOk = validation.valid;
    orgError = validation.error;
  } catch (error) {
    console.error("[HEALTH] Organization validation failed:", error);
    orgError = error instanceof Error ? error.message : "Unknown error";
  }

  const overallStatus = dbOk && orgOk ? "ok" : "degraded";

  return NextResponse.json({
    status: overallStatus,
    services: {
      database: dbOk ? "connected" : "error",
      databaseLatency: `${dbLatency}ms`,
      organization: orgOk ? "configured" : "error",
      organizationError: orgError,
    },
    latency: `${Date.now() - start}ms`,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  }, { status: overallStatus === "ok" ? 200 : 503 });
}
