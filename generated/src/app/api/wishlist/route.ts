// src/app/api/wishlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user  = await requireAuth();
    const items = await prisma.wishlistItem.findMany({
      where:   { userId: user.userId },
      include: { product: { include: { category: true, variants: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user      = await requireAuth();
    const { productId } = await req.json();

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: user.userId, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, action: "removed" });
    }

    await prisma.wishlistItem.create({ data: { userId: user.userId, productId } });
    return NextResponse.json({ success: true, action: "added" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
