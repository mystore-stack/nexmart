import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const organizationId = await getDefaultOrganizationId();

    const bundle = await (prisma as any).bundleDeal.findFirst({
      where: { 
        id,
        organizationId,
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
    });

    if (!bundle) {
      return NextResponse.json(
        { success: false, error: "Bundle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        bundlePrice: bundle.bundlePrice,
        discountPercent: bundle.discountPercent,
        backgroundColor: bundle.backgroundColor,
        gradient: bundle.gradient,
        buttonText: bundle.buttonText,
        buttonUrl: bundle.buttonUrl,
        image: bundle.image,
        order: bundle.order,
        enabled: bundle.enabled,
        products: bundle.products.map((bp: any) => ({
          id: bp.product.id,
          name: bp.product.name,
          slug: bp.product.slug,
          images: bp.product.images,
          price: bp.product.price,
          comparePrice: bp.product.comparePrice,
          stock: bp.product.stock,
        })),
      },
    });
  } catch (error) {
    console.error("[BUNDLE_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundle" },
      { status: 500 }
    );
  }
}
