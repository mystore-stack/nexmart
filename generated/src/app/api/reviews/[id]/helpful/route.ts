// src/app/api/reviews/[id]/helpful/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.review.update({
      where: { id: params.id },
      data: { helpful: { increment: 1 } },
    });
    return ok({ message: "Marked as helpful" });
  } catch (err) {
    return handleApiError(err);
  }
}
