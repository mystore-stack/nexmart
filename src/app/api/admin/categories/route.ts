// src/app/api/admin/categories/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { created, forbidden, handleApiError, ok } from "@/lib/api";
import { deleteCache, CACHE_KEYS } from "@/lib/redis";
import { uploadImage } from "@/lib/cloudinary";

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const schema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    
    const categories = await prisma.category.findMany({
      where: { organizationId },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
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
    
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await req.formData();
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const imageFile = formData.get("image") as File | null;
      
      let imageUrl: string | undefined;
      if (imageFile) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const result = await uploadImage(buffer, "nexmart/categories", {
          transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
        });
        imageUrl = result.url;
      }
      
      const category = await prisma.category.create({
        data: { 
          name: name.trim(),
          description: description.trim(),
          image: imageUrl,
          organizationId, 
          slug: toSlug(name) 
        },
        include: { _count: { select: { products: true } } },
      });
      
      await deleteCache(CACHE_KEYS.categories());
      return created(category);
    } else {
      // Handle JSON upload (legacy)
      const body = await req.json();
      const data = schema.parse(body);
      
      const category = await prisma.category.create({
        data: { ...data, organizationId, slug: toSlug(data.name) },
        include: { _count: { select: { products: true } } },
      });
      
      await deleteCache(CACHE_KEYS.categories());
      return created(category);
    }
  } catch (err: any) {
    if (err?.code === "P2002") return handleApiError(new Error("Category already exists."));
    return handleApiError(err);
  }
}
