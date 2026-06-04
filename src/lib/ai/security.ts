import { NextRequest } from "next/server";

export function assertAiRequestAllowed(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return;

  try {
    const originHost = new URL(origin).host;
    if (originHost !== host && process.env.NODE_ENV === "production") {
      throw new Error("Cross-origin AI request blocked");
    }
  } catch {
    throw new Error("Invalid AI request origin");
  }
}

export function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
