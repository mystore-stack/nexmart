// src/app/api/admin/cms/homepage-sections/[sectionKey]/products/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";

const addProductSchema = z.object({
  productId: z.string().uuid(),
  order: z.number().int().default(0),
  customPrice: z.number().optional(),
  customBadge: z.string().optional(),
  active: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const updateProductSchema = z.object({
  id: z.string().uuid(),
  order: z.number().int().optional(),
  customPrice: z.number().optional(),
  customBadge: z.string().optional(),
  active: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    await requireAdmin();
    const { sectionKey } = await params;

    // Get the section
    const section = await prisma.homePageSection.findUnique({
      where: { sectionKey },
    });

    if (!section) {
      return ok({ data: [], error: "Section not found" });
    }

    // Get products for this section with full product details
    const sectionProducts = await prisma.homepageSectionProduct.findMany({
      where: { 
        sectionId: section.id,
        active: true,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return ok({ 
      data: sectionProducts.map(sp => ({
        id: sp.id,
        order: sp.order,
        customPrice: sp.customPrice,
        customBadge: sp.customBadge,
        active: sp.active,
        startDate: sp.startDate,
        endDate: sp.endDate,
        product: sp.product,
      })),
      section: {
        id: section.id,
        sectionKey: section.sectionKey,
        title: section.title,
        maxProducts: section.maxProducts,
        hideIfEmpty: section.hideIfEmpty,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    await requireAdmin();
    const { sectionKey } = await params;
    const body = await req.json();
    const data = addProductSchema.parse(body);

    // Get the section
    const section = await prisma.homePageSection.findUnique({
      where: { sectionKey },
    });

    if (!section) {
      return ok({ error: "Section not found" }, { status: 404 });
    }

    // Check if max products limit is reached
    const currentCount = await prisma.homepageSectionProduct.count({
      where: { sectionId: section.id, active: true },
    });

    if (currentCount >= section.maxProducts) {
      return ok({ 
        error: `Maximum ${section.maxProducts} products allowed for this section` 
      }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return ok({ error: "Product not found" }, { status: 404 });
    }

    // Check if product already in section
    const existing = await prisma.homepageSectionProduct.findUnique({
      where: {
        sectionId_productId: {
          sectionId: section.id,
          productId: data.productId,
        },
      },
    });

    if (existing) {
      // Reactivate if exists but inactive
      const updated = await prisma.homepageSectionProduct.update({
        where: { id: existing.id },
        data: { 
          active: true,
          order: data.order,
          customPrice: data.customPrice,
          customBadge: data.customBadge,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
        },
      });
      return ok(updated);
    }

    // Add product to section
    const sectionProduct = await prisma.homepageSectionProduct.create({
      data: {
        sectionId: section.id,
        productId: data.productId,
        order: data.order,
        customPrice: data.customPrice,
        customBadge: data.customBadge,
        active: data.active,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      include: {
        product: true,
      },
    });

    return ok(sectionProduct);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    await requireAdmin();
    const { sectionKey } = await params;
    const body = await req.json();

    // Handle bulk reorder
    if (body.items && Array.isArray(body.items)) {
      const { items } = body;
      
      await prisma.$transaction(
        items.map((item: { id: string; order: number }) =>
          prisma.homepageSectionProduct.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      );

      return ok({ success: true });
    }

    // Handle single product update
    const data = updateProductSchema.parse(body);
    
    const sectionProduct = await prisma.homepageSectionProduct.update({
      where: { id: data.id },
      data: {
        ...(data.order !== undefined && { order: data.order }),
        ...(data.customPrice !== undefined && { customPrice: data.customPrice }),
        ...(data.customBadge !== undefined && { customBadge: data.customBadge }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      },
      include: {
        product: true,
      },
    });

    return ok(sectionProduct);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    await requireAdmin();
    const { sectionKey } = await params;
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return ok({ error: "Product ID is required" }, { status: 400 });
    }

    await prisma.homepageSectionProduct.delete({
      where: { id },
    });

    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
