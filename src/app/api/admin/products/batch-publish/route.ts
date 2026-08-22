import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";
import { invalidateProductCache } from "@/lib/redis";

const batchPublishSchema = z.object({
  productIds: z.array(z.string()).min(1),
  published: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    
    const body = await req.json();
    const { productIds, published } = batchPublishSchema.parse(body);

    // Update all products
    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds },
        organizationId,
      },
      data: {
        published,
      },
    });

    // Invalidate cache for all updated products
    for (const productId of productIds) {
      await invalidateProductCache(productId);
    }

    return ok({ 
      success: true, 
      updated: result.count,
      published 
    });
  } catch (err) {
    return handleApiError(err);
  }
}