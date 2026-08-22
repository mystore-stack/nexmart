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
        comparePrice: {
          not: null,
        },
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
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 20,
    });

    const flashDeals = allProducts.filter(p => p.comparePrice && p.comparePrice > p.price).slice(0, 4);

    return NextResponse.json({ success: true, products: flashDeals });
  } catch (error) {
    console.error('Error fetching flash deals:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch flash deals' }, { status: 500 });
  }
}
