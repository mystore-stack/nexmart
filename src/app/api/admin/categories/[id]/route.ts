// src/app/api/admin/categories/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, noContent, forbidden, notFound, handleApiError } from "@/lib/api";
import { deleteCache, CACHE_KEYS } from "@/lib/redis";
import { revalidatePath, revalidateTag } from "next/cache";

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().nullable().optional(),
  image: z.string().url().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const category = await prisma.category.update({
      where: { id, organizationId },
      data: {
        ...data,
        ...(data.name ? { slug: toSlug(data.name) } : {}),
      },
    });

    await deleteCache(CACHE_KEYS.categories());
    
    // Revalidate homepage and category page to reflect image changes
    revalidatePath('/');
    revalidatePath(`/category/${category.slug}`);
    revalidateTag('categories');
    revalidateTag('homepage');
    
    return ok(category);
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2025") return notFound("Category not found");
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organizationId } = await requireAdmin();
    const { id } = await params;
    const category = await prisma.category.findUnique({ where: { id, organizationId } });
    await prisma.category.delete({ where: { id, organizationId } });
    await deleteCache(CACHE_KEYS.categories());
    
    // Revalidate homepage if category was deleted
    if (category) {
      revalidatePath('/');
      revalidatePath(`/category/${category.slug}`);
      revalidateTag('categories');
      revalidateTag('homepage');
    }
    
    return noContent();
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2025") return notFound("Category not found");
    return handleApiError(err);
  }
}
