// scripts/check-organizations.ts
// Check what organizations exist
import dotenv from "dotenv";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.production" });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("🔍 Checking organizations...\n");

  try {
    console.log("🔧 Step 1: Check all organizations");
    const allOrgs = await prisma.organization.findMany({
      select: { id: true, name: true, slug: true, ownerId: true },
    });
    console.log(`✅ Total organizations: ${allOrgs.length}`);
    allOrgs.forEach((org) => {
      console.log(`   - ${org.id}: ${org.name} (${org.slug}) - owner: ${org.ownerId}`);
    });

    console.log("\n🔧 Step 2: Check user's membership");
    const USER_ID = "0baf9f5d-38ab-43a0-a601-a669ef94b7a8";
    const memberships = await prisma.membership.findMany({
      where: { userId: USER_ID },
      include: { Organization: true },
    });
    console.log(`✅ User memberships: ${memberships.length}`);
    memberships.forEach((membership) => {
      console.log(`   - ${membership.organizationId}: ${membership.Organization?.name} (${membership.Organization?.slug}) - role: ${membership.role}`);
    });

    console.log("\n🔧 Step 3: Check if user owns any organization");
    const ownedOrgs = await prisma.organization.findMany({
      where: { ownerId: USER_ID },
      select: { id: true, name: true, slug: true },
    });
    console.log(`✅ Organizations owned by user: ${ownedOrgs.length}`);
    ownedOrgs.forEach((org) => {
      console.log(`   - ${org.id}: ${org.name} (${org.slug})`);
    });

    console.log("\n🎉 Check completed");

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    console.error("📋 Error details:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
