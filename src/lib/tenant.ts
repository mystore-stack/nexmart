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
  const membership = await prisma.membership.findFirst({
    where: { userId: payload.userId },
    select: { organizationId: true },
    orderBy: { createdAt: "asc" },
  });

  if (membership) return membership.organizationId;

  const ownedOrganization = await prisma.organization.findFirst({
    where: { ownerId: payload.userId },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (ownedOrganization) return ownedOrganization.id;

  return getDefaultOrganizationId();
}
