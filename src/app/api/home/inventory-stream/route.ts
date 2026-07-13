import { NextRequest, NextResponse } from "next/server";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Map to store active SSE connections
const activeConnections = new Map<string, ResponseInit>();

export async function GET(req: NextRequest) {
  try {
    const organizationId = await getDefaultOrganizationId();

    // Create a custom readable stream for SSE
    const encoder = new TextEncoder();
    let isClosed = false;

    const responseStream = new ReadableStream({
      async start(controller) {
        // Send initial connection message
        controller.enqueue(encoder.encode("data: {\"type\":\"connected\"}\n\n"));

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          if (!isClosed) {
            controller.enqueue(encoder.encode(":heartbeat\n\n"));
          }
        }, 30000); // 30 seconds

        // Subscribe to inventory updates
        const pollInventory = setInterval(async () => {
          try {
            if (isClosed) {
              clearInterval(pollInventory);
              clearInterval(heartbeat);
              controller.close();
              return;
            }

            // Get recent inventory updates
            const updates = await prisma.inventoryUpdateLog.findMany({
              where: {
                organizationId,
                createdAt: {
                  gte: new Date(Date.now() - 5000), // Last 5 seconds
                },
              },
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
              take: 10,
            });

            if (updates.length > 0) {
              updates.forEach((update) => {
                const message = {
                  type: "inventory_update",
                  productId: update.productId,
                  productName: update.product.name,
                  previousStock: update.previousStock,
                  newStock: update.newStock,
                  changeReason: update.changeReason,
                  priority: update.priority,
                  timestamp: update.createdAt.toISOString(),
                };
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
                );
              });
            }
          } catch (error) {
            console.error("[INVENTORY_STREAM] Error:", error);
          }
        }, 5000); // Check every 5 seconds

        // Cleanup on connection close
        req.signal.addEventListener("abort", () => {
          isClosed = true;
          clearInterval(pollInventory);
          clearInterval(heartbeat);
          controller.close();
        });
      },
    });

    return new NextResponse(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("[INVENTORY_STREAM]", error);
    return NextResponse.json(
      { error: "Failed to establish stream" },
      { status: 500 }
    );
  }
}
