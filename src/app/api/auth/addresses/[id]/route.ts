// src/app/api/auth/addresses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUnifiedAuth } from "@/lib/unified-auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireUnifiedAuth(req);
    const { id } = params;

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id, userId: session.userId },
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      );
    }

    // Check if address is used by any order
    const orderCount = await prisma.order.count({
      where: { addressId: id },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete address used in orders" },
        { status: 400 }
      );
    }

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
