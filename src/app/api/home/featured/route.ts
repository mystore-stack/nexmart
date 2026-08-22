import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const organizationId = await getDefaultOrganizationId();
    
    const products = await prisma.product.findMany({
      where: {
        organizationId,
        published: true,
        isVisible: true,
        featured: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        comparePrice: true,
        images: true,
        tags: true,
        sku: true,
        stock: true,
        lowStockAt: true,
        rating: true,
        reviewCount: true,
        soldCount: true,
        published: true,
        featured: true,
        isVisible: true,
        displayOrder: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 8,
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch featured products' }, { status: 500 });
  }
}
