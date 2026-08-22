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
        { createdAt: 'desc' },
        { displayOrder: 'asc' },
      ],
      take: 20,
    });

    const newArrivals = allProducts.slice(0, 4);

    return NextResponse.json({ success: true, products: newArrivals });
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch new arrivals' }, { status: 500 });
  }
}
