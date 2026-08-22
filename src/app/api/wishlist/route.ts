// src/app/api/wishlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";

const wishlistSchema = z.object({
  productId: z.string().min(1),
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();
    const organizationId = session.organizationId;
    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.userId, product: { organizationId } },
      include: { product: { include: { category: true, variants: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = session.organizationId;
    const { productId } = wishlistSchema.parse(await req.json());

    const product = await prisma.product.findFirst({
      where: { id: productId, organizationId, published: true },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: session.userId, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, action: "removed" });
    }

    await prisma.wishlistItem.create({ data: { userId: session.userId, productId } });
    return NextResponse.json({ success: true, action: "added" }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
