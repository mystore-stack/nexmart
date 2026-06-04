// src/app/api/admin/categories/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { ok, noContent, forbidden, notFound, handleApiError } from "@/lib/api";
import { deleteCache, CACHE_KEYS } from "@/lib/redis";

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().nullable().optional(),
  image: z.string().url().nullable().optional(),
});

async function requireAdmin(req: NextRequest) {
  const payload = await getAuthFromRequest(req);
  if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
    throw new Error("Forbidden");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const data = updateSchema.parse(body);

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(data.name ? { slug: toSlug(data.name) } : {}),
      },
      include: { _count: { select: { products: true } } },
    });

    await deleteCache(CACHE_KEYS.categories());
    return ok(category);
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2025") return notFound("Category not found");
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(req);
    await prisma.category.delete({ where: { id: params.id } });
    await deleteCache(CACHE_KEYS.categories());
    return noContent();
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2025") return notFound("Category not found");
    return handleApiError(err);
  }
}
