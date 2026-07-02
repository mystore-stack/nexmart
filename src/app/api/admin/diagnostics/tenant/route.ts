// src/app/api/admin/diagnostics/tenant/route.ts
// Diagnostic endpoint to check tenant resolution for the current user
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const userId = session.userId;
    
    // Check user's memberships
    const memberships = await prisma.membership.findMany({
      where: { userId },
      select: {
        id: true,
        organizationId: true,
        role: true,
        Organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Check organizations owned by user
    const ownedOrganizations = await prisma.organization.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    // Get the resolved organizationId from tenant resolution
    const resolvedOrganizationId = await getOrganizationIdForUser({ userId });

    // Count orders in the resolved organization
    const orderCount = await prisma.order.count({
      where: { organizationId: resolvedOrganizationId },
    });

    // Check if there are orders in other organizations
    const ordersInOtherOrgs = await prisma.order.groupBy({
      by: ['organizationId'],
      _count: { id: true },
      where: {
        organizationId: { not: resolvedOrganizationId },
      },
    });

    const diagnostics = {
      userId,
      userEmail: session.email,
      userRole: session.role,
      memberships,
      ownedOrganizations,
      resolvedOrganizationId,
      orderCountInResolvedOrg: orderCount,
      ordersInOtherOrganizations: ordersInOtherOrgs.map((group) => ({
        organizationId: group.organizationId,
        count: group._count.id,
      })),
      warnings: [],
    };

    // Add warnings
    if (memberships.length === 0 && ownedOrganizations.length === 0) {
      (diagnostics.warnings as any[]).push(
        "User has no memberships and does not own any organizations. Using default organization fallback."
      );
    }

    if (orderCount === 0 && ordersInOtherOrgs.length > 0) {
      (diagnostics.warnings as any[]).push(
        `No orders found in resolved organization, but ${ordersInOtherOrgs.length} other organization(s) have orders. The user may need a membership to access those organizations.`
      );
    }

    return ok(diagnostics);
  } catch (err) {
    console.error("[DIAGNOSTICS] Error:", err);
    throw err;
  }
}
