import { prisma } from "@/lib/prisma";
import type { AuthSession } from "@/types";

export const DEFAULT_ORGANIZATION_SLUG =
  process.env.DEFAULT_ORGANIZATION_SLUG || "nexmart";

export const FALLBACK_ORGANIZATION_ID =
  process.env.DEFAULT_ORGANIZATION_ID || "default";

const PUBLIC_ORGANIZATION_LOOKUP_TIMEOUT_MS = Number(
  process.env.PUBLIC_ORGANIZATION_LOOKUP_TIMEOUT_MS || 2500
);

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T | null> {
  let timeout: NodeJS.Timeout;

  return new Promise((resolve, reject) => {
    timeout = setTimeout(() => resolve(null), timeoutMs);
    operation.then(resolve, reject).finally(() => clearTimeout(timeout));
  });
}

async function findDefaultOrganizationId(): Promise<string | null> {
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

  console.error("[TENANT] No organization found in database");
  console.error("[TENANT] DEFAULT_ORGANIZATION_SLUG:", DEFAULT_ORGANIZATION_SLUG);
  console.error("[TENANT] Action: Run 'npm run db:seed' to populate the database");

  return null;
}

/**
 * Get the default organization ID
 * Throws error if no organization exists - requires database seeding
 */
export async function getDefaultOrganizationId(): Promise<string> {
  try {
    const organizationId = await findDefaultOrganizationId();
    if (organizationId) return organizationId;

    throw new Error(
      `No organization found. Run "npm run db:seed" or create an organization before loading tenant-scoped pages.`
    );
  } catch (error) {
    console.error("[TENANT] Critical error in getDefaultOrganizationId:", error);
    // Re-throw with context for error boundaries
    throw new Error(
      `Failed to get organization: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Resolve the default organization for public/read-only pages.
 * Returns null when the database is unavailable so callers can render static defaults.
 */
export async function getOptionalDefaultOrganizationId(): Promise<string | null> {
  try {
    const organizationId = await withTimeout(
      findDefaultOrganizationId(),
      PUBLIC_ORGANIZATION_LOOKUP_TIMEOUT_MS
    );

    if (!organizationId) {
      console.warn("[TENANT] Default organization unavailable; using public fallback data.");
    }

    return organizationId;
  } catch (error) {
    console.warn(
      "[TENANT] Database unavailable while resolving default organization; using public fallback data.",
      error instanceof Error ? error.message : error
    );
    return null;
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

  // AUTO-REPAIR: Create membership to default organization for orphaned users
  console.warn("[TENANT] User has no organization access, attempting auto-repair");
  try {
    const defaultOrgId = await getDefaultOrganizationId();
    const membership = await prisma.membership.create({
      data: {
        userId: payload.userId,
        organizationId: defaultOrgId,
        role: 'MEMBER',
      },
    });
    console.log("[TENANT] Auto-repair successful: Created membership", membership.id);
    return defaultOrgId;
  } catch (repairError) {
    console.error("[TENANT] Auto-repair failed:", repairError);
    throw new Error(
      `User ${payload.userId} has no organization access. ` +
      `Auto-repair failed. Please create a Membership record or assign user as Organization owner. ` +
      `This is required for multi-tenant data isolation.`
    );
  }
}

/**
 * Bootstrap function to ensure at least one organization exists
 * Creates default organization if none exists
 */
export async function bootstrapOrganization(): Promise<string> {
  try {
    const orgId = await getDefaultOrganizationId();
    console.log("[TENANT] Organization already exists:", orgId);
    return orgId;
  } catch {
    console.log("[TENANT] Creating bootstrap organization");
    // Get first user to be the owner
    const firstUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    
    if (!firstUser) {
      throw new Error("Cannot bootstrap organization: No users found in database");
    }
    
    const organization = await prisma.organization.create({
      data: {
        name: 'NexMart Default',
        slug: 'nexmart',
        ownerId: firstUser.id,
        status: 'ACTIVE',
      },
    });
    console.log("[TENANT] Bootstrap organization created:", organization.id);
    return organization.id;
  }
}
