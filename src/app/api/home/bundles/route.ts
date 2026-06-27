import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get active bundle deals
    const bundleDeals = await (prisma as any).bundleDeal.findMany({
      where: {
        enabled: true,
      },
      include: {
        products: {
          include: {
            product: {
              where: {
                published: true,
              },
            },
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
      data: bundleDeals.map((bundle: any) => ({
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        bundlePrice: bundle.bundlePrice,
        discountPercent: bundle.discountPercent,
        backgroundColor: bundle.backgroundColor,
        gradient: bundle.gradient,
        buttonText: bundle.buttonText,
        buttonUrl: bundle.buttonUrl,
        products: bundle.products.map((bp: any) => ({
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
