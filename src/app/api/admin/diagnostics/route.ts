// src/app/api/admin/diagnostics/route.ts
// Diagnostic endpoint to debug product visibility issues
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, forbidden, handleApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { organizationId, userId, email, role } = await requireAdmin();

    console.log("[DIAGNOSTICS] Running diagnostics for organization:", organizationId);

    // 1. DATABASE LAYER: Check total products in database (no org filter)
    const totalProductsAll = await prisma.product.count();
    console.log("[DIAGNOSTICS] Total products in database (all orgs):", totalProductsAll);

    // 2. DATABASE LAYER: Check for NULL organizationId
    const productsWithNullOrg = await prisma.product.count({
      where: { organizationId: null }
    });
    console.log("[DIAGNOSTICS] Products with NULL organizationId:", productsWithNullOrg);

    // 3. DATABASE LAYER: Get all distinct organizationIds from products
    const productsByOrg = await prisma.product.groupBy({
      by: ["organizationId"],
      _count: { id: true },
    });
    console.log("[DIAGNOSTICS] Products grouped by organizationId:", productsByOrg);

    // 4. PRISMA LAYER: Check products for this organization
    const totalProductsOrg = await prisma.product.count({ where: { organizationId } });
    console.log("[DIAGNOSTICS] Total products for this organization:", totalProductsOrg);

    // 5. PRISMA LAYER: Check published products for this organization
    const publishedProductsOrg = await prisma.product.count({ 
      where: { organizationId, published: true } 
    });
    console.log("[DIAGNOSTICS] Published products for this organization:", publishedProductsOrg);

    // 6. PRISMA LAYER: Test query WITHOUT WHERE clause (to see if products exist at all)
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
    console.log("[DIAGNOSTICS] Sample of ALL products (no org filter):", allProductsSample);

    // 7. PRISMA LAYER: Get sample products for this organization
    const sampleProducts = await prisma.product.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        sku: true,
        published: true,
        stock: true,
        organizationId: true,
      },
      take: 5,
    });
    console.log("[DIAGNOSTICS] Sample products for this organization:", sampleProducts);

    // 8. AUTHENTICATION: Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, slug: true },
    });
    console.log("[DIAGNOSTICS] Organization:", organization);

    // 9. TENANT RESOLUTION: Check user membership
    const membership = await prisma.membership.findFirst({
      where: { userId, organizationId },
      select: { id: true, role: true },
    });
    console.log("[DIAGNOSTICS] User membership:", membership);

    // 10. TENANT RESOLUTION: Check all user memberships
    const allUserMemberships = await prisma.membership.findMany({
      where: { userId },
      include: { organization: { select: { id: true, name: true, slug: true } } },
    });
    console.log("[DIAGNOSTICS] All user memberships:", allUserMemberships);

    // 11. TENANT RESOLUTION: Check all organizations
    const allOrgs = await prisma.organization.findMany({
      select: { id: true, name: true, slug: true },
    });
    console.log("[DIAGNOSTICS] All organizations:", allOrgs);

    const result = {
      user: {
        userId,
        email,
        role,
      },
      organization: {
        id: organizationId,
        exists: !!organization,
        details: organization,
      },
      membership: {
        exists: !!membership,
        details: membership,
        allMemberships: allUserMemberships,
      },
      products: {
        totalInDatabase: totalProductsAll,
        withNullOrg: productsWithNullOrg,
        byOrganization: productsByOrg,
        totalForOrganization: totalProductsOrg,
        publishedForOrganization: publishedProductsOrg,
        sampleForOrganization: sampleProducts,
        sampleAllProducts: allProductsSample,
      },
      allOrganizations: allOrgs,
    };

    return ok(result);
  } catch (err) {
    console.error("[DIAGNOSTICS] Error:", err);
    return handleApiError(err);
  }
}
