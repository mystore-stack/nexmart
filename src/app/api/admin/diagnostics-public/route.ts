// src/app/api/admin/diagnostics-public/route.ts
// Public diagnostic endpoint (no auth required) for quick database state check
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    console.log("[DIAGNOSTICS-PUBLIC] Running public diagnostics");

    // Test basic database connectivity
    const totalProductsAll = await prisma.product.count();
    console.log("[DIAGNOSTICS-PUBLIC] Total products in database:", totalProductsAll);

    const totalOrgs = await prisma.organization.count();
    console.log("[DIAGNOSTICS-PUBLIC] Total organizations:", totalOrgs);

    // Get all distinct organizationIds from products
    const productsByOrg = await prisma.product.groupBy({
      by: ["organizationId"],
      _count: { id: true },
    });
    console.log("[DIAGNOSTICS-PUBLIC] Products grouped by organizationId:", productsByOrg);

    // Get sample products (no org filter)
    const allProductsSample = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        published: true,
        stock: true,
        organizationId: true,
      },
      take: 10,
    });
    console.log("[DIAGNOSTICS-PUBLIC] Sample of ALL products (no org filter):", allProductsSample);

    // Get all organizations
    const allOrgs = await prisma.organization.findMany({
      select: { id: true, name: true, slug: true },
    });
    console.log("[DIAGNOSTICS-PUBLIC] All organizations:", allOrgs);

    const result = {
      products: {
        totalInDatabase: totalProductsAll,
        byOrganization: productsByOrg,
        sampleAllProducts: allProductsSample,
      },
      organizations: {
        total: totalOrgs,
        all: allOrgs,
      },
    };

    return ok(result);
  } catch (err) {
    console.error("[DIAGNOSTICS-PUBLIC] Error:", err);
    return handleApiError(err);
  }
}
