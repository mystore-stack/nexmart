import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-api";
import { z } from "zod";
import { rateLimit } from "@/lib/api";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().max(120).optional(),
  body: z.string().min(10).max(2000).optional(),
});

// GET /api/reviews/[id] - Get single review
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        product: { select: { id: true, name: true, images: true } },
      },
    });

    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("[REVIEW_GET_ERROR]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// PUT /api/reviews/[id] - Update review (within 7 days)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const organizationId = session.organizationId;
    const { id } = await params;
    
    const rl = await rateLimit(`review:update:${session.userId}`, 5, 60 * 1000);
    if (!rl.success) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!existingReview) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    if (existingReview.userId !== session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // Check if review is within 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (existingReview.createdAt < sevenDaysAgo) {
      return NextResponse.json(
        { success: false, error: "Reviews can only be edited within 7 days" },
        { status: 400 }
      );
    }

    const body = updateSchema.parse(await req.json());

    const updatedReview = await prisma.review.update({
      where: { id },
      data: body,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        product: { select: { id: true, name: true, images: true } },
      },
    });

    // Update product rating
    const stats = await prisma.review.aggregate({
      where: { productId: existingReview.productId, product: { organizationId } },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: existingReview.productId, organizationId },
      data: {
        rating: stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    });

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error("[REVIEW_UPDATE_ERROR]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!existingReview) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    if (existingReview.userId !== session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await prisma.review.delete({ where: { id } });

    // Update product rating
    const organizationId = existingReview.product.organizationId;
    const stats = await prisma.review.aggregate({
      where: { productId: existingReview.productId, product: { organizationId } },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: existingReview.productId, organizationId },
      data: {
        rating: stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    });

    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("[REVIEW_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
