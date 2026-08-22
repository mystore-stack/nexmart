import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

// GET - Fetch all products with featured status
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = (session as any).organizationId;

    const { searchParams } = new URL(req.url);
    const onlyFeatured = searchParams.get("onlyFeatured") === "true";

    const where: any = { organizationId };
    if (onlyFeatured) {
      where.featured = true;
      where.isVisible = true;
      where.published = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
      },
      orderBy: [
        { featured: "desc" },
        { displayOrder: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ success: true, products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    console.error("[FEATURED PRODUCTS API] GET error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}

// POST - Update product featured status and display order
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = (session as any).organizationId;

    const body = await req.json();
    const { productId, featured, isVisible, displayOrder } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "productId is required" }, { status: 400 });
    }

    // Verify product belongs to organization
    const product = await prisma.product.findFirst({
      where: { id: productId, organizationId },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(featured !== undefined && { featured }),
        ...(isVisible !== undefined && { isVisible }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
      include: {
        category: true,
        variants: true,
      },
    });

    console.log("[FEATURED PRODUCTS API] Updated product:", {
      productId,
      featured,
      isVisible,
      displayOrder,
    });

    // Revalidate homepage cache
    revalidatePath("/");
    revalidateTag("homepage");

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    console.error("[FEATURED PRODUCTS API] POST error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}

// PUT - Bulk update display order for multiple products
export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const organizationId = (session as any).organizationId;

    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ success: false, error: "products array is required" }, { status: 400 });
    }

    // Update each product's display order
    const updates = await Promise.all(
      products.map(async ({ productId, displayOrder }: { productId: string; displayOrder: number }) => {
        // Verify product belongs to organization
        const product = await prisma.product.findFirst({
          where: { id: productId, organizationId },
        });

        if (!product) {
          return null;
        }

        return prisma.product.update({
          where: { id: productId },
          data: { displayOrder },
        });
      })
    );

    console.log("[FEATURED PRODUCTS API] Bulk updated display order for", updates.length, "products");

    // Revalidate homepage cache
    revalidatePath("/");
    revalidateTag("homepage");

    return NextResponse.json({ success: true, updated: updates.filter(Boolean).length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    console.error("[FEATURED PRODUCTS API] PUT error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}
