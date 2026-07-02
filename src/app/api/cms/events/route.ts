import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`;
      controller.enqueue(encoder.encode(data));

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        const heartbeatData = `data: ${JSON.stringify({ type: "heartbeat", timestamp: Date.now() })}\n\n`;
        try {
          controller.enqueue(encoder.encode(heartbeatData));
        } catch (error) {
          clearInterval(heartbeat);
        }
      }, 30000); // 30 seconds heartbeat

      // Clean up on connection close
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
