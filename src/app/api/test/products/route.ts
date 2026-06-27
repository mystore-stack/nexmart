import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("[TEST_PRODUCTS] Fetching all products");
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        organizationId: true,
        published: true,
        price: true,
      },
      take: 10,
    });

    console.log("[TEST_PRODUCTS] Found products:", products.length);

    return NextResponse.json({ success: true, data: products, count: products.length });
  } catch (error) {
    console.error("[TEST_PRODUCTS] Error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
