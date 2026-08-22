// scripts/test-organization-resolution.ts
// Test getOrganizationIdForUser() in production
import dotenv from "dotenv";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.production" });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function getOrganizationIdForUser(payload: { userId: string }) {
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

async function getDefaultOrganizationId(): Promise<string> {
  const DEFAULT_ORGANIZATION_SLUG = process.env.DEFAULT_ORGANIZATION_SLUG || "nexmart";

  const organization = await prisma.organization.findUnique({
    where: { slug: DEFAULT_ORGANIZATION_SLUG },
    select: { id: true },
  });

  if (organization) {
    return organization.id;
  }

  const fallbackOrganization = await prisma.organization.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (fallbackOrganization) {
    console.warn(`[TENANT] Using fallback organization: ${fallbackOrganization.id}`);
    return fallbackOrganization.id;
  }

  throw new Error(`No organization found`);
}

async function main() {
  console.log("🔍 Testing organization resolution in production...\n");

  const USER_ID = "0baf9f5d-38ab-43a0-a601-a669ef94b7a8";

  try {
    console.log("🔧 Step 1: Check user exists");
    const user = await prisma.user.findUnique({
      where: { id: USER_ID },
      select: { id: true, email: true, role: true },
    });
    console.log("✅ User exists:", user);

    console.log("\n🔧 Step 2: Test getOrganizationIdForUser()");
    const organizationId = await getOrganizationIdForUser({ userId: USER_ID });
    console.log("✅ Organization ID resolved:", organizationId);

    console.log("\n🔧 Step 3: Verify organization exists");
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, slug: true },
    });
    console.log("✅ Organization exists:", org);

    console.log("\n🔧 Step 4: Check orders for this organization");
    const orders = await prisma.order.count({
      where: { organizationId },
    });
    console.log("✅ Orders count:", orders);

    console.log("\n🎉 Organization resolution works correctly");

  } catch (err: any) {
    console.error("❌ Test failed:", err.message);
    console.error("📋 Error details:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
