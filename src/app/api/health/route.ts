// src/app/api/health/route.ts — NexMart Health Check
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() {
  const start = Date.now();
  let dbOk = false;
  try { await (prisma as any).$queryRaw`SELECT 1`; dbOk = true; } catch {}
  return NextResponse.json({
    status: dbOk ? "ok" : "degraded",
    db: dbOk ? "connected" : "error",
    latency: `${Date.now() - start}ms`,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  }, { status: dbOk ? 200 : 503 });
}
