import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { ok, unauthorized, notFound, error, handleApiError, rateLimit } from "@/lib/api";

const paramsSchema = z.object({ id: z.string().uuid() });

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getAuthFromRequest(req);
    if (!payload) return unauthorized();

    const rl = await rateLimit(`review-helpful:${payload.userId}`, 30, 60 * 60 * 1000);
    if (!rl.success) {
      return error("Rate limit exceeded", 429);
    }

    const { id } = paramsSchema.parse(params);
    const review = await prisma.review.findUnique({ where: { id }, select: { id: true } });
    if (!review) return notFound("Review not found");

    await prisma.review.update({
      where: { id },
      data: { helpful: { increment: 1 } },
    });

    return ok({ message: "Marked as helpful" });
  } catch (err) {
    return handleApiError(err);
  }
}
