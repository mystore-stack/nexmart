import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const organizationId = await getDefaultOrganizationId();
    
    const allProducts = await prisma.product.findMany({
      where: {
        organizationId,
        published: true,
        isVisible: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { soldCount: 'desc' },
        { rating: 'desc' },
      ],
      take: 20,
    });

    const bestSellers = allProducts.slice(0, 4);

    return NextResponse.json({ success: true, products: bestSellers });
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch best sellers' }, { status: 500 });
  }
}
