// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  productId: z.string(),
  rating:    z.number().min(1).max(5),
  title:     z.string().max(120).optional(),
  body:      z.string().min(10).max(2000),
});

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get("productId");
    const page      = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit     = 10;
    if (!productId) return NextResponse.json({ success: false, error: "productId requis" }, { status: 400 });

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where:   { productId },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    return NextResponse.json({ success: true, reviews, pagination: { page, limit, total } });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user   = await requireAuth();
    const body   = schema.parse(await req.json());

    const review = await prisma.review.create({
      data: { ...body, userId: user.userId, images: [] },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    // Update product rating
    const stats = await prisma.review.aggregate({
      where:   { productId: body.productId },
      _avg:    { rating: true },
      _count:  { rating: true },
    });
    await prisma.product.update({
      where: { id: body.productId },
      data: {
        rating:      stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
