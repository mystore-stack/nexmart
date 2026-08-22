// src/app/api/admin/cms/homepage-sections/[sectionKey]/products/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-api";
import { normalizeToCanonicalKey, getCanonicalSection } from "@/lib/homepage/canonical-contract";
import { revalidatePath } from "next/cache";

const buildSectionLookupCandidates = (rawKey: string) => {
  const normalizedKey = normalizeToCanonicalKey(rawKey);
  const dashedKey = rawKey.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
  const normalizedDashedKey = normalizedKey?.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();

  return Array.from(
    new Set(
      [
        rawKey,
        rawKey.toLowerCase(),
        dashedKey,
        normalizedKey,
        normalizedKey?.toLowerCase(),
        normalizedDashedKey,
      ].filter((value): value is string => Boolean(value))
    )
  );
};

const resolveSectionRecord = async (rawKey: string) => {
  const normalizedKey = normalizeToCanonicalKey(rawKey);
  const candidates = buildSectionLookupCandidates(rawKey);

  const section = await prisma.homePageSection.findFirst({
    where: {
      sectionKey: {
        in: candidates,
      },
    },
  });

  return {
    section,
    normalizedKey,
    lookupKey: section?.sectionKey ?? normalizedKey ?? rawKey,
  };
};

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
    const { sectionKey: rawKey } = await params;
    const { section, normalizedKey, lookupKey } = await resolveSectionRecord(rawKey);

    console.log("[SECTION PRODUCTS GET] RAW KEY:", rawKey);
    console.log("[SECTION PRODUCTS GET] NORMALIZED KEY:", normalizedKey);
    console.log("[SECTION PRODUCTS GET] LOOKUP KEY:", lookupKey);

    if (!section) {
      console.error("[SECTION PRODUCTS GET] Section key not found in DB:", rawKey);
      return ok({ data: [], section: null, error: "Section not found" }, 404);
    }

    console.log("[SECTION PRODUCTS GET] Fetching products for section:", section.sectionKey);

    if (!section) {
      console.log("[SECTION PRODUCTS] Section not found:", rawKey);
      return ok({ 
        data: [],
        section: null,
        error: "Section not found" 
      });
    }

    console.log("[SECTION PRODUCTS] Section found:", section.id, "maxProducts:", section.maxProducts);

    // Get products for this section with optimized query
    const sectionProducts = await prisma.homepageSectionProduct.findMany({
      where: { 
        sectionId: section.id,
        active: true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            comparePrice: true,
            images: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // Also return the productIds array for easier client-side usage
    const productIds = sectionProducts.map((sp: any) => sp.product?.id || sp.productId).filter(Boolean);

    console.log("[SECTION PRODUCTS GET] Returning productIds:", productIds);
    console.log("[SECTION PRODUCTS GET] Section products count:", sectionProducts.length);

    return ok({ 
      data: sectionProducts.map((sp: any) => ({
        id: sp.id,
        order: sp.order,
        customPrice: sp.customPrice,
        customBadge: sp.customBadge,
        active: sp.active,
        startDate: sp.startDate,
        endDate: sp.endDate,
        product: sp.product,
        productId: sp.productId, // Include productId directly
      })),
      productIds: productIds, // Include productIds array directly
      section: {
        id: section.id,
        sectionKey: section.sectionKey,
        title: section.title,
        maxProducts: section.maxProducts,
        hideIfEmpty: section.hideIfEmpty,
      },
    });
  } catch (err) {
    console.error("[SECTION PRODUCTS] Error:", err);
    return handleApiError(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    await requireAdmin();
    const { sectionKey: rawKey } = await params;
    const body = await req.json();
    const data = addProductSchema.parse(body);

    const { section, normalizedKey, lookupKey } = await resolveSectionRecord(rawKey);

    console.log("[SECTION PRODUCTS POST] RAW KEY:", rawKey);
    console.log("[SECTION PRODUCTS POST] NORMALIZED KEY:", normalizedKey);
    console.log("[SECTION PRODUCTS POST] LOOKUP KEY:", lookupKey);

    if (!section) {
      console.error("[SECTION PRODUCTS POST] Section key not found in DB:", rawKey);
      return ok({ error: "Section not found" }, 404);
    }

    if (!section) {
      return ok({ error: "Section not found" }, 404);
    }

    // Check if max products limit is reached
    const currentCount = await prisma.homepageSectionProduct.count({
      where: { sectionId: section.id, active: true },
    });

    if (currentCount >= section.maxProducts) {
      return ok({ 
        error: `Maximum ${section.maxProducts} products allowed for this section` 
      }, 400);
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return ok({ error: "Product not found" }, 404);
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

    // Revalidate homepage to reflect product changes
    revalidatePath("/");

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
    const { userId, organizationId } = await requireAdmin();
    const { sectionKey: rawKey } = await params;
    const body = await req.json();

    const { section, normalizedKey, lookupKey } = await resolveSectionRecord(rawKey);

    console.log("[SECTION PRODUCTS PATCH] RAW KEY:", rawKey);
    console.log("[SECTION PRODUCTS PATCH] NORMALIZED KEY:", normalizedKey);
    console.log("[SECTION PRODUCTS PATCH] LOOKUP KEY:", lookupKey);

    if (!section) {
      console.error("[SECTION PRODUCTS PATCH] Section key not found in DB:", rawKey);
      return ok({ error: "Section not found" }, 404);
    }

    console.log("[SECTION PRODUCTS PATCH] Section:", section.sectionKey, "Body:", body);

    if (!section) {
      console.log("[SECTION PRODUCTS PATCH] Section not found:", rawKey);
      return ok({ error: "Section not found" }, 404);
    }

    // Handle bulk product selection sync
    if (body.products && Array.isArray(body.products)) {
      const { products } = body;
      const safeProductIds = [...new Set(products.filter((id: unknown): id is string => typeof id === "string" && id.length > 0))];

      console.log("[SECTION PRODUCTS PATCH] Bulk sync products:", {
        sectionId: section.id,
        sectionKey: section.sectionKey,
        productIds: safeProductIds,
        maxProducts: section.maxProducts
      });

      if (safeProductIds.length > section.maxProducts) {
        return ok({ error: `Maximum ${section.maxProducts} products allowed for this section` }, 400);
      }

      // Verify all products exist before proceeding
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: safeProductIds } },
        select: { id: true }
      });

      if (existingProducts.length !== safeProductIds.length) {
        const missingIds = safeProductIds.filter(id => !existingProducts.some(p => p.id === id));
        console.error("[SECTION PRODUCTS PATCH] Some products don't exist:", missingIds);
        return ok({ error: `Some products don't exist: ${missingIds.join(", ")}` }, 400);
      }

      await prisma.$transaction(async (tx: any) => {
        console.log("[SECTION PRODUCTS PATCH] Starting transaction for product sync");
        
        // Delete existing products for this section
        const deleteResult = await tx.homepageSectionProduct.deleteMany({
          where: { sectionId: section.id },
        });
        console.log("[SECTION PRODUCTS PATCH] Deleted existing products:", deleteResult.count);

        // Add new products if any
        if (safeProductIds.length > 0) {
          const createResult = await tx.homepageSectionProduct.createMany({
            data: safeProductIds.map((productId, index) => ({
              sectionId: section.id,
              productId,
              order: index,
              active: true,
            })),
          });
          console.log("[SECTION PRODUCTS PATCH] Created new product relations:", createResult.count);
        }
      });

      console.log("[SECTION PRODUCTS PATCH] Transaction completed successfully");

      // Verify the save by querying the database
      const verification = await prisma.homepageSectionProduct.findMany({
        where: { sectionId: section.id },
        orderBy: { order: "asc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      console.log("[SECTION PRODUCTS PATCH] Verification result:", {
        count: verification.length,
        products: verification.map((v: any) => ({ id: v.productId, name: v.product?.name, order: v.order })),
        productIds: verification.map((v: any) => v.productId)
      });

      // Revalidate homepage to reflect product changes
      revalidatePath("/");

      // Return the actual saved product IDs from database verification
      const actualSavedIds = verification.map((v: any) => v.productId);
      return ok({ 
        data: actualSavedIds, // Return actual saved IDs from database
        requested: safeProductIds, // Return what was requested for comparison
        verification: verification.length 
      });
    }

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

      // Revalidate homepage to reflect product reordering
      revalidatePath("/");

      return ok({});
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
    console.error("[SECTION PRODUCTS PATCH] Error:", err);
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    await requireAdmin();
    const { sectionKey: rawKey } = await params;
    const body = await req.json();
    const { sectionProductId } = body;

    // Normalize section key
    const sectionKey = normalizeToCanonicalKey(rawKey);
    const canonicalSection = getCanonicalSection(rawKey);
    console.log("[SECTION PRODUCTS DELETE] RAW KEY:", rawKey);
    console.log("[SECTION PRODUCTS DELETE] NORMALIZED KEY:", sectionKey);
    console.log("[SECTION PRODUCTS DELETE] sectionProductId:", sectionProductId);

    if (!sectionKey || !canonicalSection) {
      console.error("[SECTION PRODUCTS DELETE] Invalid section key:", rawKey);
      return ok({ error: "Invalid section key" }, 400);
    }

    // Warn about legacy usage
    if (rawKey !== sectionKey) {
      console.warn("[SECTION PRODUCTS DELETE] Legacy section key used:", rawKey, "->", sectionKey);
    }

    if (!sectionProductId) {
      return ok({ error: "sectionProductId is required" }, 400);
    }

    // Verify the product relation exists before deleting
    const existingRelation = await prisma.homepageSectionProduct.findUnique({
      where: { id: sectionProductId },
      include: {
        product: {
          select: { id: true, name: true }
        }
      }
    });

    if (!existingRelation) {
      console.error("[SECTION PRODUCTS DELETE] Product relation not found:", sectionProductId);
      return ok({ error: "Product relation not found" }, 404);
    }

    console.log("[SECTION PRODUCTS DELETE] Deleting product relation:", {
      id: existingRelation.id,
      productId: existingRelation.productId,
      productName: existingRelation.product?.name
    });

    await prisma.homepageSectionProduct.delete({
      where: { id: sectionProductId },
    });

    console.log("[SECTION PRODUCTS DELETE] Product relation deleted successfully");

    return ok({ deletedProductId: existingRelation.productId });
  } catch (err) {
    console.error("[SECTION PRODUCTS DELETE] Error:", err);
    return handleApiError(err);
  }
}
