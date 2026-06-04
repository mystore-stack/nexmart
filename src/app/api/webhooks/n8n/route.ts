import { OrderStatus } from "@prisma/client";
// src/app/api/webhooks/n8n/route.ts — NexMart ↔ n8n Bridge
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const N8N_SECRET = process.env.N8N_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-n8n-secret");
  if (N8N_SECRET && secret !== N8N_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { action } = await req.json();
    switch (action) {
      case "get_daily_stats": {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const [orders, revenue, newUsers] = await Promise.all([
          prisma.order.count({ where: { createdAt: { gte: today } } }),
          prisma.order.aggregate({ where: { createdAt: { gte: today }, status: OrderStatus.DELIVERED }, _sum: { total: true } }),
          prisma.user.count({ where: { createdAt: { gte: today } } }),
        ]);
        return NextResponse.json({ success: true, stats: { orders, revenue: revenue._sum.total || 0, newUsers } });
      }
      default:
        return NextResponse.json({ success: true, message: "Event received" });
    }
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
