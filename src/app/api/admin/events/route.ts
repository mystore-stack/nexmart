import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";

// Server-Sent Events endpoint for real-time admin updates
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  const organizationId = session.organizationId;

  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any, event = "message") => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial connection message
      sendEvent({ connected: true, timestamp: new Date().toISOString() }, "connected");

      // Keep-alive ping every 30 seconds
      const keepAliveInterval = setInterval(() => {
        sendEvent({ ping: true, timestamp: new Date().toISOString() }, "ping");
      }, 30000);

      // Poll for new orders every 2 seconds
      let lastOrderTimestamp = new Date();
      
      const pollInterval = setInterval(async () => {
        try {
          // Check for new orders
          const newOrders = await prisma.order.findMany({
            where: {
              organizationId,
              createdAt: { gt: lastOrderTimestamp },
            },
            include: {
              user: { select: { name: true, email: true } },
              items: { take: 3 },
              address: true,
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          });

          if (newOrders.length > 0) {
            lastOrderTimestamp = new Date();
            sendEvent(
              {
                type: "new_orders",
                orders: newOrders.map((order) => ({
                  id: order.id,
                  orderNumber: order.orderNumber,
                  total: order.total,
                  status: order.status,
                  paymentStatus: order.paymentStatus,
                  paymentMethod: order.paymentMethod,
                  createdAt: order.createdAt,
                  user: order.user,
                  itemCount: order.items.length,
                })),
              },
              "orders"
            );
          }

          // Check for order status updates
          const updatedOrders = await prisma.order.findMany({
            where: {
              organizationId,
              updatedAt: { gt: lastOrderTimestamp },
            },
            select: {
              id: true,
              orderNumber: true,
              status: true,
              paymentStatus: true,
              updatedAt: true,
            },
            orderBy: { updatedAt: "desc" },
            take: 10,
          });

          if (updatedOrders.length > 0) {
            sendEvent(
              {
                type: "order_updates",
                orders: updatedOrders,
              },
              "updates"
            );
          }

          // Check for low stock alerts
          const lowStockProducts = await prisma.product.findMany({
            where: {
              organizationId,
              published: true,
              stock: { lte: 5 },
            },
            select: {
              id: true,
              name: true,
              stock: true,
              lowStockAt: true,
            },
            take: 5,
          });

          if (lowStockProducts.length > 0) {
            sendEvent(
              {
                type: "inventory_alert",
                products: lowStockProducts,
              },
              "inventory"
            );
          }
        } catch (error) {
          console.error("[SSE] Polling error:", error);
        }
      }, 2000);

      // Cleanup on client disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(keepAliveInterval);
        clearInterval(pollInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
