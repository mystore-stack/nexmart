import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { verify } from "jsonwebtoken";

// Server-Sent Events endpoint for real-time admin updates
export async function GET(req: NextRequest) {
  console.log("[SSE] Connection attempt received");
  
  // Get session without strict admin requirement for SSE compatibility
  // EventSource doesn't support custom headers, so we use a lighter auth check
  const { getSession } = await import("@/lib/auth-api");
  
  let session;
  try {
    // First try to get session from cookies
    session = await getSession();
    console.log("[SSE] Session check result from cookies:", { 
      hasSession: !!session, 
      userId: session?.userId,
      role: session?.role 
    });
    
    // If no session from cookies, try query parameter token (for EventSource compatibility)
    if (!session) {
      const token = req.nextUrl.searchParams.get('token');
      if (token) {
        try {
          const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
          const decoded = verify(token, JWT_SECRET) as any;
          console.log("[SSE] Token decoded:", { userId: decoded.userId, role: decoded.role, type: decoded.type });
          
          // Verify this is an SSE token
          if (decoded.type !== 'sse') {
            console.error("[SSE] Invalid token type:", decoded.type);
            throw new Error("Invalid token type");
          }
          
          // Verify user exists in database
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true, organizationId: true }
          });
          
          if (user) {
            session = {
              userId: user.id,
              email: user.email,
              role: user.role,
              organizationId: user.organizationId
            };
            console.log("[SSE] Session from token validated");
          }
        } catch (tokenError) {
          console.error("[SSE] Token validation failed:", tokenError);
        }
      }
    }
  } catch (error) {
    console.error("[SSE] Error getting session:", error);
    session = null;
  }
  
  if (!session) {
    console.error("[SSE] No session found - rejecting connection");
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const message = `event: error\ndata: ${JSON.stringify({ error: "No session found", code: "NO_SESSION" })}\n\n`;
        controller.enqueue(encoder.encode(message));
        controller.close();
      },
    });
    return new Response(stream, {
      status: 401,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "close",
      },
    });
  }

  // Check if user is admin
  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
    console.error("[SSE] User not admin - rejecting connection:", session.role);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const message = `event: error\ndata: ${JSON.stringify({ error: "Admin access required", code: "FORBIDDEN" })}\n\n`;
        controller.enqueue(encoder.encode(message));
        controller.close();
      },
    });
    return new Response(stream, {
      status: 403,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "close",
      },
    });
  }

  console.log("[SSE] Admin session validated - establishing connection");

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

      // Keep-alive ping every 15 seconds (reduced from 30 for better connection detection)
      const keepAliveInterval = setInterval(() => {
        try {
          sendEvent({ ping: true, timestamp: new Date().toISOString() }, "ping");
        } catch (error) {
          console.error("[SSE] Error sending keep-alive ping:", error);
        }
      }, 15000);

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
              user: {
                select: {
                  name: true,
                  email: true
                }
              },
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
                orders: newOrders.map((order: any) => ({
                  id: order.id,
                  orderNumber: order.orderNumber,
                  total: order.total,
                  status: order.status,
                  paymentStatus: order.paymentStatus,
                  paymentMethod: order.paymentMethod,
                  createdAt: order.createdAt,
                  itemCount: order.items.length,
                  user: order.user,
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
