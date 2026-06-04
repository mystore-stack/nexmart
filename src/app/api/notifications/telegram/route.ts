// src/app/api/notifications/telegram/route.ts
// إرسال إشعارات Telegram يدوياً أو من cron
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import {
  sendDailyReport,
  notifyLowStock,
  sendTelegramMessage,
} from "@/lib/notifications/telegram";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthFromRequest(req);
    const isCron = req.headers.get("x-cron-secret") === process.env.CRON_SECRET;
    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    if (!isCron && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type } = await req.json();

    switch (type) {
      // ─── تقرير يومي ──────────────────────────────
      case "daily_report": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [ordersCount, revenueResult, newUsersCount, topProductResult] =
          await Promise.all([
            prisma.order.count({ where: { createdAt: { gte: today } } }),
            prisma.order.aggregate({
              where: { createdAt: { gte: today }, status: "DELIVERED" },
              _sum: { total: true },
            }),
            prisma.user.count({ where: { createdAt: { gte: today } } }),
            prisma.orderItem.groupBy({
              by: ["productId"],
              where: { order: { createdAt: { gte: today } } },
              _sum: { quantity: true },
              orderBy: { _sum: { quantity: "desc" } },
              take: 1,
            }),
          ]);

        let topProduct: string | undefined;
        if (topProductResult[0]) {
          const prod = await prisma.product.findUnique({
            where: { id: topProductResult[0].productId },
            select: { name: true },
          });
          topProduct = prod?.name;
        }

        await sendDailyReport({
          orders: ordersCount,
          revenue: revenueResult._sum.total || 0,
          newUsers: newUsersCount,
          topProduct,
        });

        return NextResponse.json({ success: true, type: "daily_report" });
      }

      // ─── تنبيه مخزون ناقص ────────────────────────
      case "low_stock": {
        const products = await prisma.product.findMany({
          where: { stock: { lte: 10 }, published: true },
          select: { id: true, name: true, sku: true, stock: true, lowStockAt: true },
          take: 20,
        });

        if (products.length === 0) {
          await sendTelegramMessage("✅ <b>المخزون بخير</b> — لا توجد منتجات ناقصة.");
        } else {
          for (const product of products) {
            await notifyLowStock({
              name: product.name,
              sku: product.sku || "N/A",
              stock: product.stock,
              threshold: product.lowStockAt || 10,
              productId: product.id,
            });
            // تأخير صغير لتجنب rate limit
            await new Promise((r) => setTimeout(r, 300));
          }
        }

        return NextResponse.json({ success: true, count: products.length });
      }

      // ─── رسالة مخصصة ─────────────────────────────
      case "custom": {
        const { message } = await req.json().catch(() => ({ message: "" }));
        if (!message) {
          return NextResponse.json({ error: "Message required" }, { status: 400 });
        }
        await sendTelegramMessage(message);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
