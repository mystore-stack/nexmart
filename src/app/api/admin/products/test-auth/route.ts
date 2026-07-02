import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  console.log("[PRODUCTS_TEST_AUTH] === TEST AUTH ENDPOINT ===");
  
  try {
    console.log("[PRODUCTS_TEST_AUTH] Attempting requireAdmin...");
    const session = await requireAdmin();
    console.log("[PRODUCTS_TEST_AUTH] Auth successful:", {
      userId: session.userId,
      email: session.email,
      role: session.role,
      organizationId: session.organizationId,
    });

    // Test query without any filters
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        organizationId: true,
        published: true,
      },
      take: 5,
    });

    console.log("[PRODUCTS_TEST_AUTH] All products in DB:", allProducts.length);
    console.log("[PRODUCTS_TEST_AUTH] Sample products:", allProducts.map(p => ({
      id: p.id,
      name: p.name,
      orgId: p.organizationId,
      published: p.published,
    })));

    // Test query with organization filter
    const orgProducts = await prisma.product.findMany({
      where: { organizationId: session.organizationId },
      select: {
        id: true,
        name: true,
        organizationId: true,
        published: true,
      },
      take: 5,
    });

    console.log("[PRODUCTS_TEST_AUTH] Products for org:", orgProducts.length);
    console.log("[PRODUCTS_TEST_AUTH] Org products:", orgProducts.map(p => ({
      id: p.id,
      name: p.name,
      orgId: p.organizationId,
      published: p.published,
    })));

    return NextResponse.json({
      success: true,
      auth: {
        userId: session.userId,
        email: session.email,
        role: session.role,
        organizationId: session.organizationId,
      },
      allProductsCount: allProducts.length,
      orgProductsCount: orgProducts.length,
      allProducts,
      orgProducts,
    });
  } catch (error) {
    console.error("[PRODUCTS_TEST_AUTH] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
