import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { getDefaultOrganizationId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();
    const { searchParams } = new URL(req.url);

    const priority = searchParams.get("priority");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = { organizationId };
    if (priority) {
      where.priority = priority;
    }

    const [logs, total] = await Promise.all([
      prisma.inventoryUpdateLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
            },
          },
        },
      }),
      prisma.inventoryUpdateLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: { limit, offset, total },
    });
  } catch (error: any) {
    console.error("[INVENTORY_UPDATES_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const {
      productId,
      newStock,
      changeReason,
      priority = "MEDIUM",
    } = body;

    // Get current product stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Log the update
    const log = await prisma.inventoryUpdateLog.create({
      data: {
        organizationId,
        productId,
        previousStock: product.stock,
        newStock,
        changeReason,
        priority,
      },
    });

    // Emit real-time update event
    if (typeof (globalThis as any).inventoryUpdates !== "undefined") {
      ((globalThis as any).inventoryUpdates as Set<any>).forEach((client: any) => {
        client.send(
          JSON.stringify({
            type: "inventory_update",
            productId,
            previousStock: product.stock,
            newStock,
            priority,
            timestamp: new Date().toISOString(),
          })
        );
      });
    }

    return NextResponse.json({
      success: true,
      data: log,
    });
  } catch (error: any) {
    console.error("[INVENTORY_UPDATES_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Stream endpoint for real-time inventory updates
export async function createReadableStream() {
  let clients = new Set();
  (globalThis as any).inventoryUpdates = clients;

  return {
    clients,
  };
}
