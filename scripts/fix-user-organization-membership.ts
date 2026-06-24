// scripts/fix-user-organization-membership.ts
// Fix user organization membership by adding user to existing NexMart organization
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
  console.log("🔧 Fixing user organization membership...\n");

  const ACTUAL_USER_ID = "483091ca-89c6-44c2-b9b7-c3334abf678e"; // Actual admin user in database
  const EXISTING_ORG_ID = "7eb67cec-969d-4428-8b30-1edfa5af5748"; // NexMart organization

  try {
    console.log("🔧 Step 1: Check if user exists in database");
    const user = await prisma.user.findUnique({
      where: { id: ACTUAL_USER_ID },
    });

    if (!user) {
      console.log("❌ User does not exist in database");
      return;
    }

    console.log("✅ User exists:", user.email);

    console.log("\n🔧 Step 2: Check if user already has membership");
    const existingMembership = await prisma.membership.findFirst({
      where: { userId: ACTUAL_USER_ID, organizationId: EXISTING_ORG_ID },
    });
    
    if (existingMembership) {
      console.log("✅ User already has membership to NexMart organization");
      console.log(`   Role: ${existingMembership.role}`);
      return;
    }

    console.log("🔧 Step 3: Add user as ADMIN member of NexMart organization");
    const membership = await prisma.membership.create({
      data: {
        userId: ACTUAL_USER_ID,
        organizationId: EXISTING_ORG_ID,
        role: "ADMIN",
      },
    });
    console.log("✅ Membership created:", membership.id);

    console.log("\n🔧 Step 4: Verify membership was created");
    const verifyMembership = await prisma.membership.findFirst({
      where: { userId: ACTUAL_USER_ID, organizationId: EXISTING_ORG_ID },
      include: { Organization: true },
    });
    console.log("✅ Membership verified:", {
      id: verifyMembership?.id,
      organization: verifyMembership?.Organization?.name,
      role: verifyMembership?.role,
    });

    console.log("\n🎉 Fix completed successfully");
    console.log("📋 User can now access orders for NexMart organization");

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    console.error("📋 Error details:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
