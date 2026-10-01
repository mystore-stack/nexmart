// src/app/api/notifications/telegram/route.ts
// إرسال إشعارات Telegram يدوياً أو من cron
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/withApi";
import { ok } from "@/lib/api-response";
import {
  sendDailyReport,
  notifyLowStock,
  sendTelegramMessage,
} from "@/lib/notifications/telegram";
import { generateAuthRequestId, authDebug } from "@/lib/auth-debug";

export const dynamic = "force-dynamic";

// Handler for cron requests (no auth required, just secret validation)
async function handleCronRequest(req: NextRequest) {
  const requestId = generateAuthRequestId();
  console.log("[TELEGRAM] CRON request authorized");
  authDebug("TELEGRAM_CRON_AUTHORIZED", { requestId });
  
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

      return ok({ type: "daily_report" });
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

      return ok({ count: products.length });
    }

    // ─── رسالة مخصصة ─────────────────────────────
    case "custom": {
      const { message } = await req.json().catch(() => ({ message: "" }));
      if (!message) {
        throw new Error("Message required");
      }
      await sendTelegramMessage(message);
      return ok({ success: true });
    }

    default:
      throw new Error("Unknown type");
  }
}

// Handler for admin requests (requires NextAuth session)
const handleAdminRequest = withAdmin(async ({ req }) => {
  const requestId = generateAuthRequestId();
  console.log("[TELEGRAM] ADMIN request authorized");
  authDebug("TELEGRAM_ADMIN_AUTHORIZED", { requestId });
  
  const { type } = await req.json();

  switch (type) {
    case "custom": {
      const { message } = await req.json().catch(() => ({ message: "" }));
      if (!message) {
        throw new Error("Message required");
      }
      await sendTelegramMessage(message);
      return ok({ success: true });
    }

    default:
      throw new Error("Only 'custom' type is supported for admin requests. Use cron for daily_report and low_stock.");
  }
});

export async function POST(req: NextRequest) {
  // Check cron secret FIRST
  const isCron = req.headers.get("x-cron-secret") === process.env.CRON_SECRET;
  
  if (isCron) {
    // Cron path: no auth required, just secret validation
    return handleCronRequest(req);
  }
  
  // Admin path: require NextAuth session
  return handleAdminRequest(req);
}
