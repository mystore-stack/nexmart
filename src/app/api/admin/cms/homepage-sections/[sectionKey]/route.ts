import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { normalizeToCanonicalKey, getCanonicalSection, normalizeSectionType } from "@/lib/homepage/canonical-contract";
import { ok, fail, handleApiError } from "@/lib/api-response";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    await requireAdmin();
    const { sectionKey: rawKey } = await params;
    const { section, normalizedKey, lookupKey } = await resolveSectionRecord(rawKey);

    console.log("[SECTION GET] RAW KEY:", rawKey);
    console.log("[SECTION GET] NORMALIZED KEY:", normalizedKey);
    console.log("[SECTION GET] LOOKUP KEY:", lookupKey);

    if (!section) {
      console.error("[SECTION GET] Section key not found in DB:", rawKey);
      return fail("Section not found", 404);
    }

    const sectionWithProducts = await prisma.homePageSection.findFirst({
      where: { 
        sectionKey: section.sectionKey
      },
      include: {
        products: {
          orderBy: { order: "asc" },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                comparePrice: true,
                images: true,
                stock: true,
                published: true,
              }
            }
          }
        }
      }
    });

    return ok(sectionWithProducts);
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
    const { sectionKey: rawKey } = await params;
    const body = await req.json();
    const { section, normalizedKey, lookupKey } = await resolveSectionRecord(rawKey);

    console.log("[SECTION PATCH] RAW KEY:", rawKey);
    console.log("[SECTION PATCH] NORMALIZED KEY:", normalizedKey);
    console.log("[SECTION PATCH] LOOKUP KEY:", lookupKey);
    console.log("[SECTION PATCH] Request body:", body);

    if (!section) {
      console.error("[SECTION PATCH] Section key not found in DB:", rawKey);
      return fail("Section not found", 404);
    }

    // Update section directly for immediate effect on public homepage
    const updatedSection = await prisma.homePageSection.update({
      where: { sectionKey: section.sectionKey },
      data: {
        ...(body.active !== undefined ? { active: body.active } : {}),
        ...(body.displayOrder !== undefined ? { displayOrder: body.displayOrder } : {}),
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.subtitle !== undefined ? { subtitle: body.subtitle } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.bannerImage !== undefined ? { bannerImage: body.bannerImage } : {}),
        ...(body.viewAllButton !== undefined ? { viewAllButton: body.viewAllButton } : {}),
        ...(body.destinationUrl !== undefined ? { destinationUrl: body.destinationUrl } : {}),
        ...(body.sectionKey !== undefined ? { sectionType: normalizeSectionType(getCanonicalSection(body.sectionKey)?.sectionType ?? body.sectionKey) ?? section.sectionType } : {}),
      }
    });

    console.log("[SECTION PATCH] Updated section:", updatedSection);
    console.log("[SECTION PATCH] Response will be:", { success: true, data: updatedSection });
    
    // Revalidate public homepage
    revalidatePath("/");
    
    return ok(updatedSection);
  } catch (err) {
    console.error("[SECTION PATCH] Error:", err);
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
    const { section, normalizedKey, lookupKey } = await resolveSectionRecord(rawKey);

    console.log("[SECTION DELETE] RAW KEY:", rawKey);
    console.log("[SECTION DELETE] NORMALIZED KEY:", normalizedKey);
    console.log("[SECTION DELETE] LOOKUP KEY:", lookupKey);

    if (!section) {
      console.error("[SECTION DELETE] Section key not found in DB:", rawKey);
      return fail("Section not found", 404);
    }

    // Prisma cascade will delete related HomepageSectionProduct records
    // due to onDelete: Cascade in schema
    await prisma.homePageSection.delete({
      where: { sectionKey: section.sectionKey }
    });

    revalidatePath("/");
    revalidatePath("/admin/cms/homepage");
    return ok({ sectionKey: section.sectionKey });
  } catch (err) {
    return handleApiError(err);
  }
}

// DUPLICATE endpoint
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sectionKey: string }> }
) {
  try {
    await requireAdmin();
    const { sectionKey: rawKey } = await params;
    const { section, normalizedKey, lookupKey } = await resolveSectionRecord(rawKey);

    if (!section) {
      return fail("Section not found", 404);
    }

    // Get the max displayOrder to place the duplicate at the end
    const maxOrder = await prisma.homePageSection.findFirst({
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    // Create duplicate with new unique sectionKey
    const duplicateKey = `${section.sectionKey}-copy-${randomUUID().slice(0, 8)}`;
    const duplicate = await prisma.homePageSection.create({
      data: {
        sectionKey: duplicateKey,
        title: `${section.title} (Copy)`,
        subtitle: section.subtitle,
        description: section.description,
        bannerImage: section.bannerImage,
        viewAllButton: section.viewAllButton,
        destinationUrl: section.destinationUrl,
        order: section.order,
        displayOrder: (maxOrder?.displayOrder ?? 0) + 1,
        active: false, // Duplicates start as inactive
        maxProducts: section.maxProducts,
        hideIfEmpty: section.hideIfEmpty,
      },
    });

    // Duplicate products if any
    const products = await prisma.homePageSectionProduct.findMany({
      where: { sectionId: section.id },
    });

    if (products.length > 0) {
      await prisma.homePageSectionProduct.createMany({
        data: products.map((p: { productId: string; order: number; customPrice: number | null; customBadge: string | null; active: boolean }) => ({
          sectionId: duplicate.id,
          productId: p.productId,
          order: p.order,
          customPrice: p.customPrice,
          customBadge: p.customBadge,
          active: p.active,
        })),
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/cms/homepage");
    return ok(duplicate);
  } catch (err) {
    return handleApiError(err);
  }
}
