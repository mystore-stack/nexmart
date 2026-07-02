import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";

// GET - List all bundle deals
export async function GET() {
  try {
    const organizationId = await getDefaultOrganizationId();
    
    const bundleDeals = await (prisma as any).bundleDeal.findMany({
      where: { organizationId },
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
      data: bundleDeals,
    });
  } catch (error) {
    console.error("[BUNDLE_DEALS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundle deals" },
      { status: 500 }
    );
  }
}

// POST - Create bundle deal
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const organizationId = await getDefaultOrganizationId();
    const body = await req.json();

    const { name, description, bundlePrice, discountPercent, enabled, backgroundColor, gradient, buttonText, buttonUrl, order, products } = body;

    const bundleDeal = await (prisma as any).bundleDeal.create({
      data: {
        organizationId,
        name,
        description,
        bundlePrice,
        discountPercent,
        enabled: enabled !== undefined ? enabled : true,
        backgroundColor,
        gradient,
        buttonText,
        buttonUrl,
        order: order || 0,
        products: {
          create: products?.map((p: any) => ({
            product: {
              connect: { id: p.productId },
            },
            order: p.order || 0,
          })) || [],
        },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: bundleDeal,
    });
  } catch (error) {
    console.error("[BUNDLE_DEALS_POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create bundle deal" },
      { status: 500 }
    );
  }
}
