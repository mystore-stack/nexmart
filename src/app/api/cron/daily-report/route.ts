// src/app/api/cron/daily-report/route.ts — Vercel Cron 8h
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";
  const res = await fetch(`${appUrl}/api/notifications/telegram`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-cron-secret": process.env.CRON_SECRET || "" },
    body: JSON.stringify({ type: "daily_report" }),
  });
  return NextResponse.json(await res.json());
}
