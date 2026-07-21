import { prisma } from "@/lib/prisma";
import type { AuthSession } from "@/types";

export const DEFAULT_ORGANIZATION_SLUG =
  process.env.DEFAULT_ORGANIZATION_SLUG || "nexmart";

export async function getDefaultOrganizationId() {
  const organization = await prisma.organization.findUnique({
    where: { slug: DEFAULT_ORGANIZATION_SLUG },
    select: { id: true },
  });

  if (organization) return organization.id;

  const fallbackOrganization = await prisma.organization.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (fallbackOrganization) return fallbackOrganization.id;

  throw new Error(
    `No organization found. Run "npm run db:seed" or create an organization before loading tenant-scoped pages.`
  );
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
