// src/app/api/admin/deals/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, created, handleApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    
    // Get products with comparePrice as deals
    const products = await prisma.product.findMany({
      where: { 
        organizationId, 
        published: true, 
        comparePrice: { not: null },
        stock: { gt: 0 }
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    
    // Transform to deals format
    const deals = products.map((p) => ({
      id: `deal-${p.id}`,
      productId: p.id,
      product: p,
      productImage: p.images[0],
      productName: p.name,
      discountPercentage: Math.round(((p.comparePrice! - p.price) / p.comparePrice!) * 100),
      regularPrice: p.comparePrice,
      salePrice: p.price,
      stockLimit: p.stock,
      stockRemaining: Math.max(1, Math.floor(p.stock * 0.6)),
      startTime: new Date(Date.now() - 24 * 3600_000).toISOString(),
      endTime: new Date(Date.now() + 3 * 3600_000).toISOString(),
      active: true,
      urgent: p.featured,
      paused: false,
      status: 'active',
      createdAt: p.createdAt.toISOString(),
    }));
    
    return ok({ data: deals });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireAdmin();
    const body = await req.json();
    
    // For now, deals are just products with comparePrice
    // We'll update the product to have comparePrice
    const product = await prisma.product.update({
      where: { id: body.productId },
      data: { comparePrice: body.regularPrice },
      include: { category: true },
    });
    
    return created(product);
  } catch (err) {
    return handleApiError(err);
  }
}
