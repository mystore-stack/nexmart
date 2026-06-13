// src/app/api/health/route.ts — NexMart Health Check
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { eventQueue } from "@/lib/queues/event-processing.queue";
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
  } catch {}

  // Redis health check
  let redisOk = false;
  let redisLatency = 0;
  try {
    const redisStart = Date.now();
    await redis.ping();
    redisLatency = Date.now() - redisStart;
    redisOk = true;
  } catch {}

  // Queue health check
  let queueOk = false;
  let queueStats = null;
  try {
    const waiting = await eventQueue.getWaiting();
    const active = await eventQueue.getActive();
    const failed = await eventQueue.getFailed();
    queueStats = { waiting: waiting.length, active: active.length, failed: failed.length };
    queueOk = true;
  } catch {}

  const overallStatus = dbOk && redisOk && queueOk ? "ok" : "degraded";

  return NextResponse.json({
    status: overallStatus,
    services: {
      database: dbOk ? "connected" : "error",
      databaseLatency: `${dbLatency}ms`,
      redis: redisOk ? "connected" : "error",
      redisLatency: `${redisLatency}ms`,
      queue: queueOk ? "connected" : "error",
      queueStats,
    },
    latency: `${Date.now() - start}ms`,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  }, { status: overallStatus === "ok" ? 200 : 503 });
}
