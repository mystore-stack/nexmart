import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cleanup expired inventory reservations
// This should be called periodically (e.g., via cron job)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find expired reservations
    const expiredReservations = await prisma.inventoryReservation.findMany({
      where: {
        status: "RESERVED",
        expiresAt: { lt: now },
      },
    });

    console.log(`[INVENTORY_CLEANUP] Found ${expiredReservations.length} expired reservations`);

    if (expiredReservations.length === 0) {
      return NextResponse.json({ success: true, cleaned: 0 }, { status: 200 });
    }

    // Mark expired reservations as EXPIRED
    const result = await prisma.inventoryReservation.updateMany({
      where: {
        id: { in: expiredReservations.map((r) => r.id) },
        status: "RESERVED",
        expiresAt: { lt: now },
      },
      data: {
        status: "EXPIRED",
      },
    });

    console.log(`[INVENTORY_CLEANUP] Marked ${result.count} reservations as EXPIRED`);

    return NextResponse.json(
      {
        success: true,
        cleaned: result.count,
        reservations: expiredReservations.map((r) => ({
          id: r.id,
          productId: r.productId,
          variantId: r.variantId,
          quantity: r.quantity,
          expiresAt: r.expiresAt,
        })),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[INVENTORY_CLEANUP] Error:", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
