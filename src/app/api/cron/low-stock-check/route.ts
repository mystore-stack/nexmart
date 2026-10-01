// src/app/api/cron/low-stock-check/route.ts — Vercel Cron 9h
import { NextRequest, NextResponse } from "next/server";
import { generateAuthRequestId, authDebug } from "@/lib/auth-debug";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const requestId = generateAuthRequestId();
  authDebug("CRON_START", { requestId, type: "low_stock_check" });
  
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    authDebug("CRON_AUTH_401", { requestId, reason: "invalid_secret" });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  authDebug("CRON_AUTHORIZED", { requestId });
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";
  authDebug("CRON_TELEGRAM_START", { requestId });
  
  const res = await fetch(`${appUrl}/api/notifications/telegram`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-cron-secret": process.env.CRON_SECRET || "" },
    body: JSON.stringify({ type: "low_stock" }),
  });
  
  const result = await res.json();
  authDebug("CRON_TELEGRAM_SUCCESS", { requestId });
  authDebug("CRON_COMPLETE", { requestId });
  
  return NextResponse.json(result);
}
