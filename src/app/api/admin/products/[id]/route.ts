// src/app/api/admin/products/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, noContent, forbidden, notFound, handleApiError } from "@/lib/api";
import { invalidateProductCache } from "@/lib/redis";

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;
    
    // Support both UUID and slug lookups
    const lookup: Array<{ id?: string; slug?: string }> = [{ id }];
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      lookup.unshift({ slug: id });
    }
    
    const product = await prisma.product.findFirst({
      where: { organizationId, OR: lookup },
      include: { category: true, variants: true, reviews: { include: { user: { select: { id: true, name: true, avatar: true } } }, take: 10 } },
    });
    if (!product) return notFound("Product not found");
    return ok(product);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    // Support both UUID and slug lookups - need to find product first
    const lookup: Array<{ id?: string; slug?: string }> = [{ id }];
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      lookup.unshift({ slug: id });
    }
    
    const existingProduct = await prisma.product.findFirst({
      where: { organizationId, OR: lookup },
      select: { id: true },
    });
    
    if (!existingProduct) return notFound("Product not found");

    const product = await prisma.product.update({
      where: { id: existingProduct.id },
      data,
      include: { category: true, variants: true },
    });

    await invalidateProductCache(existingProduct.id);
    return ok(product);
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2025") return notFound("Product not found");
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;

    // Support both UUID and slug lookups
    const lookup: Array<{ id?: string; slug?: string }> = [{ id }];
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      lookup.unshift({ slug: id });
    }
    
    const existingProduct = await prisma.product.findFirst({
      where: { organizationId, OR: lookup },
      select: { id: true },
    });
    
    if (!existingProduct) return notFound("Product not found");

    // Soft delete by unpublishing, or hard delete
    const force = req.nextUrl.searchParams.get("force") === "true";

    if (force) {
      await prisma.product.delete({ where: { id: existingProduct.id } });
    } else {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: { published: false },
      });
    }

    await invalidateProductCache(existingProduct.id);
    return noContent();
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2025") return notFound("Product not found");
    return handleApiError(err);
  }
}
