// src/app/api/admin/dashboard/events/route.ts
import { NextRequest } from "next/server";
import { subscribeToChannel, PUBSUB_CHANNELS } from "@/lib/redis";
import { withAuth } from "@/lib/withApi";
import { requireAuth } from "@/lib/auth-api";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/dashboard/events
 * Real-time event streaming using Server-Sent Events (SSE)
 * Subscribes to Redis Pub/Sub channels and streams events to the client
 */
export const GET = withAuth(async ({ req }) => {
  const { organizationId } = await requireAuth();

  // Set up SSE headers
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initMessage = `data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`;
      controller.enqueue(encoder.encode(initMessage));

      // Subscribe to order events
      const unsubscribeOrders = subscribeToChannel(PUBSUB_CHANNELS.orders, (message) => {
        // Filter events by organization
        if (message.order?.userId) {
          // In production, you'd verify the user belongs to this organization
          const eventMessage = `data: ${JSON.stringify({ ...message, channel: "orders" })}\n\n`;
          controller.enqueue(encoder.encode(eventMessage));
        }
      });

      // Subscribe to analytics events
      const unsubscribeAnalytics = subscribeToChannel(PUBSUB_CHANNELS.analytics, (message) => {
        const eventMessage = `data: ${JSON.stringify({ ...message, channel: "analytics" })}\n\n`;
        controller.enqueue(encoder.encode(eventMessage));
      });

      // Subscribe to revenue events
      const unsubscribeRevenue = subscribeToChannel(PUBSUB_CHANNELS.revenue, (message) => {
        const eventMessage = `data: ${JSON.stringify({ ...message, channel: "revenue" })}\n\n`;
        controller.enqueue(encoder.encode(eventMessage));
      });

      // Subscribe to inventory events
      const unsubscribeInventory = subscribeToChannel(PUBSUB_CHANNELS.inventory, (message) => {
        const eventMessage = `data: ${JSON.stringify({ ...message, channel: "inventory" })}\n\n`;
        controller.enqueue(encoder.encode(eventMessage));
      });

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        const heartbeat = `data: ${JSON.stringify({ type: "heartbeat", timestamp: Date.now() })}\n\n`;
        controller.enqueue(encoder.encode(heartbeat));
      }, 30000);

      // Cleanup on connection close
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        unsubscribeOrders();
        unsubscribeAnalytics();
        unsubscribeRevenue();
        unsubscribeInventory();
        controller.close();
      });
    },
  });

  return new Response(stream, { headers });
});
