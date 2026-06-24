// scripts/check-users.ts
// Check what users exist in database
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
  console.log("🔍 Checking users in database...\n");

  try {
    console.log("🔧 Step 1: Check all users");
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
    });
    console.log(`✅ Total users: ${allUsers.length}`);
    allUsers.forEach((user) => {
      console.log(`   - ${user.id}: ${user.email} (${user.name}) - role: ${user.role}`);
    });

    console.log("\n🔧 Step 2: Check for admin@nexmart.com");
    const adminUser = await prisma.user.findFirst({
      where: { email: "admin@nexmart.com" },
    });
    console.log("✅ Admin user:", adminUser);

    console.log("\n🔧 Step 3: Check for user ID 0baf9f5d-38ab-43a0-a601-a669ef94b7a8");
    const targetUser = await prisma.user.findUnique({
      where: { id: "0baf9f5d-38ab-43a0-a601-a669ef94b7a8" },
    });
    console.log("✅ Target user:", targetUser);

    console.log("\n🎉 Check completed");

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    console.error("📋 Error details:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
