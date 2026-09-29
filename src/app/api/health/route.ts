// src/app/api/health/route.ts - Health check endpoint for staging
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis if enabled
    let redisStatus = "disabled";
    if (!process.env.DISABLE_REDIS || process.env.DISABLE_REDIS === "false") {
      try {
        const { redis } = await import("@/lib/redis");
        await redis.ping();
        redisStatus = "connected";
      } catch (error) {
        redisStatus = "error";
      }
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      redis: redisStatus,
      environment: process.env.NODE_ENV,
      version: "1.0.0",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}