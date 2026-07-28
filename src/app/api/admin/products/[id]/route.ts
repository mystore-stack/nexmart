// src/app/api/admin/products/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, noContent, forbidden, notFound, handleApiError } from "@/lib/api";
import { invalidateProductCache } from "@/lib/redis";
import { uploadImage } from "@/lib/cloudinary";

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { organizationId } = await requireAdmin();
    const product = await prisma.product.findFirst({
      where: { id, organizationId },
      include: { category: true, variants: true, reviews: { take: 10, include: { user: { select: { name: true } } } } },
    });
    if (!product) return notFound("Product not found");
    return ok(product);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { organizationId } = await requireAdmin();
    const body = await req.json();
    const data = updateSchema.parse(body);

    const product = await prisma.product.update({
      where: { id, organizationId },
      data,
      include: { category: true, variants: true },
    });

    await invalidateProductCache(id);
    return ok(product);
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2025") return notFound("Product not found");
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { organizationId } = await requireAdmin();

    const formData = await req.formData();
    const contentType = req.headers.get("content-type") || "";

    let updateData: any = {};

    if (contentType.includes("multipart/form-data")) {
      updateData.name = formData.get("name") as string;
      updateData.description = formData.get("description") as string;
      updateData.categoryId = formData.get("categoryId") as string;
      updateData.price = parseFloat(formData.get("price") as string);
      
      const comparePrice = formData.get("comparePrice");
      if (comparePrice) updateData.comparePrice = parseFloat(comparePrice as string);
      
      const cost = formData.get("cost");
      if (cost) updateData.cost = parseFloat(cost as string);
      
      updateData.sku = formData.get("sku") as string;
      updateData.stock = parseInt(formData.get("stock") as string);
      updateData.lowStockAt = parseInt(formData.get("lowStockAt") as string);
      
      const weight = formData.get("weight");
      if (weight) updateData.weight = parseFloat(weight as string);
      
      updateData.published = formData.get("published") === "true";
      updateData.featured = formData.get("featured") === "true";

      const tags: string[] = [];
      let tagIdx = 0;
      while (formData.has(`tags_${tagIdx}`)) {
        const tag = formData.get(`tags_${tagIdx}`) as string;
        if (tag) tags.push(tag.trim());
        tagIdx++;
      }
      if (tags.length > 0) updateData.tags = tags;

      const imageUrls: string[] = [];
      let imgIdx = 0;
      while (formData.has(`image_${imgIdx}`)) {
        const file = formData.get(`image_${imgIdx}`) as File;
        if (file) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const url = await uploadImage(buffer, file.name);
          imageUrls.push(url);
        }
        imgIdx++;
      }

      let existingImgIdx = 0;
      while (formData.has(`existingImage_${existingImgIdx}`)) {
        const url = formData.get(`existingImage_${existingImgIdx}`) as string;
        if (url) imageUrls.push(url);
        existingImgIdx++;
      }

      if (imageUrls.length > 0) updateData.images = imageUrls;

      const variantsStr = formData.get("variants");
      if (variantsStr) {
        updateData.variants = {
          create: JSON.parse(variantsStr as string)
        };
      }
    } else {
      const body = await req.json();
      const data = updateSchema.parse(body);
      updateData = data;
    }

    const product = await prisma.product.update({
      where: { id, organizationId },
      data: updateData,
      include: { category: true, variants: true },
    });

    await invalidateProductCache(id);
    return ok(product);
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2025") return notFound("Product not found");
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { organizationId } = await requireAdmin();

    // Soft delete by unpublishing, or hard delete
    const force = req.nextUrl.searchParams.get("force") === "true";

    if (force) {
      await prisma.product.delete({ where: { id, organizationId } });
    } else {
      await prisma.product.update({
        where: { id, organizationId },
        data: { published: false },
      });
    }

    await invalidateProductCache(id);
    return noContent();
  } catch (err: any) {
    if ((err as Error).message === "Forbidden") return forbidden();
    if (err?.code === "P2025") return notFound("Product not found");
    return handleApiError(err);
  }
}
