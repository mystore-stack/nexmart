// src/app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user  = await requireAuth();
    const items = await prisma.cartItem.findMany({
      where:   { userId: user.userId },
      include: { product: { include: { category: true, variants: true } }, variant: true },
    });
    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { productId, variantId, quantity = 1 } = await req.json();

    const item = await prisma.cartItem.upsert({
      where: { userId_productId_variantId: { userId: user.userId, productId, variantId: variantId ?? null } },
      update: { quantity: { increment: quantity } },
      create: { userId: user.userId, productId, variantId, quantity },
      include: { product: true, variant: true },
    });

    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
