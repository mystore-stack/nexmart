// src/app/api/cron/low-stock-check/route.ts â€” Vercel Cron 9h
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexstore.ma";
  const res = await fetch(`${appUrl}/api/notifications/telegram`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-cron-secret": process.env.CRON_SECRET || "" },
    body: JSON.stringify({ type: "low_stock" }),
  });
  return NextResponse.json(await res.json());
}

