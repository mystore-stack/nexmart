// src/app/api/admin/categories/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { created, forbidden, handleApiError } from "@/lib/api";
import { deleteCache, CACHE_KEYS } from "@/lib/redis";

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const schema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(),
});

async function requireAdmin(req: NextRequest) {
  const payload = await getAuthFromRequest(req);
  if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
    throw new Error("Forbidden");
  }
  return { payload, organizationId: await getOrganizationIdForUser(payload) };
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin(req);
    const body = await req.json();
    const data = schema.parse(body);

    const category = await prisma.category.create({
      data: { ...data, organizationId, slug: toSlug(data.name) },
      include: { _count: { select: { products: true } } },
    });

    await deleteCache(CACHE_KEYS.categories());
    return created(category);
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2002") return handleApiError(new Error("Category already exists."));
    return handleApiError(err);
  }
}
