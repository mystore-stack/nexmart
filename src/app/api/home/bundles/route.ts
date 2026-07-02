import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";

export async function GET() {
  try {
    const organizationId = await getDefaultOrganizationId();
    
    // Get active bundle deals
    const bundleDeals = await prisma.bundleDeal.findMany({
      where: {
        enabled: true,
        organizationId,
      },
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: bundleDeals.map((bundle) => ({
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        bundlePrice: bundle.bundlePrice,
        discountPercent: bundle.discountPercent,
        backgroundColor: bundle.backgroundColor,
        gradient: bundle.gradient,
        buttonText: bundle.buttonText,
        buttonUrl: bundle.buttonUrl,
        products: bundle.products
          .filter((bp) => bp.product.published)
          .map((bp) => ({
            id: bp.product.id,
            name: bp.product.name,
            slug: bp.product.slug,
            image: bp.product.images[0],
            price: bp.product.price,
          })),
      })),
    });
  } catch (error) {
    console.error("[HOME_BUNDLES_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}
