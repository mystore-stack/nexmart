import { prisma } from "@/lib/prisma";
import type { AuthSession } from "@/types";

export const DEFAULT_ORGANIZATION_SLUG =
  process.env.DEFAULT_ORGANIZATION_SLUG || "nexmart";

/**
 * Get the default organization ID with auto-bootstrap fallback
 * This ensures the app can start even if organization data is missing
 */
export async function getDefaultOrganizationId(): Promise<string> {
  try {
    // Try to find the default organization by slug
    const organization = await prisma.organization.findUnique({
      where: { slug: DEFAULT_ORGANIZATION_SLUG },
      select: { id: true },
    });

    if (organization) {
      return organization.id;
    }

    // Fallback to any existing organization
    const fallbackOrganization = await prisma.organization.findFirst({
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    if (fallbackOrganization) {
      console.warn(`[TENANT] Using fallback organization: ${fallbackOrganization.id} (default slug '${DEFAULT_ORGANIZATION_SLUG}' not found)`);
      return fallbackOrganization.id;
    }

    // Auto-bootstrap: Create default organization if none exists
    // This is a safety mechanism for production environments
    console.warn("[TENANT] No organization found, attempting auto-bootstrap...");
    const newOrganization = await prisma.organization.create({
      data: {
        slug: DEFAULT_ORGANIZATION_SLUG,
        name: "NexMart",
        ownerId: "system", // Will be updated when first admin user is created
        settings: {},
      },
      select: { id: true },
    });

    console.log(`[TENANT] Auto-bootstrapped organization: ${newOrganization.id}`);
    return newOrganization.id;
  } catch (error) {
    console.error("[TENANT] Critical error in getDefaultOrganizationId:", error);
    // Re-throw with context for error boundaries
    throw new Error(
      `Failed to get or create organization: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if the application has valid organization data
 * Use this for health checks and startup validation
 */
export async function validateOrganizationSetup(): Promise<{
  valid: boolean;
  organizationId?: string;
  error?: string;
}> {
  try {
    const organizationId = await getDefaultOrganizationId();
    return { valid: true, organizationId };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getOrganizationIdForUser(payload: Pick<AuthSession, "userId">) {
  console.log("[TENANT] Getting organizationId for userId:", payload.userId);
  
  const membership = await prisma.membership.findFirst({
    where: { userId: payload.userId },
    select: { organizationId: true },
    orderBy: { createdAt: "asc" },
  });

  if (membership) {
    console.log("[TENANT] Found membership, organizationId:", membership.organizationId);
    return membership.organizationId;
  }

  const ownedOrganization = await prisma.organization.findFirst({
    where: { ownerId: payload.userId },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (ownedOrganization) {
    console.log("[TENANT] Found owned organization, id:", ownedOrganization.id);
    return ownedOrganization.id;
  }

  // CRITICAL FIX: DO NOT fallback to default organization
  // This prevents data isolation issues where users see wrong data
  console.error("[TENANT] CRITICAL: User has no membership and does not own any organization");
  console.error("[TENANT] userId:", payload.userId);
  console.error("[TENANT] Action: Create a Membership record or assign user as Organization owner");
  throw new Error(
    `User ${payload.userId} has no organization access. ` +
    `Please create a Membership record or assign the user as an Organization owner. ` +
    `This is required for multi-tenant data isolation.`
  );
}
