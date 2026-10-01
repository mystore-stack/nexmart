// src/app/api/admin/categories/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, created, forbidden, handleApiError } from "@/lib/api";
import { deleteCache, CACHE_KEYS } from "@/lib/redis";
import { revalidatePath, revalidateTag } from "next/cache";

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const schema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(),
  order: z.number().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const organizationId = session.organizationId;

    const categories = await prisma.category.findMany({
      where: { organizationId },
      orderBy: { order: "asc" },
    });

    return ok({ data: categories });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const organizationId = session.organizationId;
    const body = await req.json();
    const data = schema.parse(body);

    const category = await prisma.category.create({
      data: { ...data, organizationId, slug: toSlug(data.name) },
    });

    await deleteCache(CACHE_KEYS.categories());
    
    // Revalidate homepage to show new category
    revalidatePath('/');
    revalidatePath(`/category/${category.slug}`);
    revalidateTag('categories');
    revalidateTag('homepage');
    
    return created(category);
  } catch (err: any) {
    if (err?.code === "P2002") return handleApiError(new Error("Category already exists."));
    return handleApiError(err);
  }
}
