import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-api";
import { searchProducts } from "@/lib/services/product-service";

export async function GET(req: NextRequest) {
  console.log("[PRODUCTS_SEARCH] === API CALLED ===");
  
  try {
    console.log("[PRODUCTS_SEARCH] Attempting requireAdmin...");
    const session = await requireAdmin();
    console.log("[PRODUCTS_SEARCH] Auth successful:", {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const published = searchParams.get("published") as "true" | "false" | "all" | undefined;
    const limit = parseInt(searchParams.get("limit") || "50");

    console.log("[PRODUCTS_SEARCH] Request params:", {
      userId: session.userId,
      organizationId: session.organizationId,
      search,
      published,
      limit,
    });

    // Use shared ProductService
    const products = await searchProducts({
      organizationId: session.organizationId,
      search,
      published,
      limit,
    });

    console.log("[PRODUCTS_SEARCH] Found products:", products.length);
    console.log("[PRODUCTS_SEARCH] Sample products:", products.slice(0, 3).map(p => ({ id: p.id, name: p.name, orgId: p.organizationId })));

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("[PRODUCTS_SEARCH] Error:", error);
    console.error("[PRODUCTS_SEARCH] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { success: false, error: "Failed to search products" },
      { status: 500 }
    );
  }
}
