// src/app/api/admin/products/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, noContent, forbidden, notFound, handleApiError } from "@/lib/api";
import { invalidateProductCache } from "@/lib/redis";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().nullable().optional(),
  cost: z.number().positive().nullable().optional(),
  categoryId: z.string().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
  lowStockAt: z.number().int().min(0).optional(),
  weight: z.number().positive().nullable().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
}).partial();

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { organizationId } = await requireAdmin();
    const product = await prisma.product.findFirst({
      where: { id: params.id, organizationId },
      include: { category: true, variants: true, reviews: { take: 10, include: { user: { select: { name: true } } } } },
    });
    if (!product) return notFound("Product not found");
    return ok(product);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { organizationId } = await requireAdmin();
    const body = await req.json();
    const data = updateSchema.parse(body);

    const product = await prisma.product.update({
      where: { id: params.id, organizationId },
      data,
      include: { category: true, variants: true },
    });

    await invalidateProductCache(params.id);
    return ok(product);
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2025") return notFound("Product not found");
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { organizationId } = await requireAdmin();

    // Soft delete by unpublishing, or hard delete
    const force = req.nextUrl.searchParams.get("force") === "true";

    if (force) {
      await prisma.product.delete({ where: { id: params.id, organizationId } });
    } else {
      await prisma.product.update({
        where: { id: params.id, organizationId },
        data: { published: false },
      });
    }

    await invalidateProductCache(params.id);
    return noContent();
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2025") return notFound("Product not found");
    return handleApiError(err);
  }
}
