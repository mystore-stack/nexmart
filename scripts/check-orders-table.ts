// scripts/check-orders-table.ts
// Check orders table
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
  console.log("🔍 Checking orders table...\n");

  const USER_ID = "0baf9f5d-38ab-43a0-a601-a669ef94b7a8";
  const ORGANIZATION_ID = "777981b1-a027-49a2-b786-eadee83594e5";

  try {
    console.log("🔧 Step 1: Check all orders in database");
    const allOrders = await prisma.order.findMany({
      select: { id: true, orderNumber: true, userId: true, organizationId: true, status: true },
    });
    console.log(`✅ Total orders: ${allOrders.length}`);
    allOrders.forEach((order) => {
      console.log(`   - ${order.orderNumber}: userId=${order.userId}, orgId=${order.organizationId}, status=${order.status}`);
    });

    console.log("\n🔧 Step 2: Check orders for user's organization");
    const orgOrders = await prisma.order.findMany({
      where: { organizationId: ORGANIZATION_ID },
      select: { id: true, orderNumber: true, userId: true, organizationId: true, status: true },
    });
    console.log(`✅ Orders for org ${ORGANIZATION_ID}: ${orgOrders.length}`);
    orgOrders.forEach((order) => {
      console.log(`   - ${order.orderNumber}: userId=${order.userId}`);
    });

    console.log("\n🔧 Step 3: Check orders for user");
    const userOrders = await prisma.order.findMany({
      where: { userId: USER_ID },
      select: { id: true, orderNumber: true, userId: true, organizationId: true, status: true },
    });
    console.log(`✅ Orders for user ${USER_ID}: ${userOrders.length}`);
    userOrders.forEach((order) => {
      console.log(`   - ${order.orderNumber}: orgId=${order.organizationId}`);
    });

    console.log("\n🔧 Step 4: Check organization details");
    const organization = await prisma.organization.findUnique({
      where: { id: ORGANIZATION_ID },
      select: { id: true, name: true, slug: true },
    });
    console.log("✅ Organization:", organization);

    console.log("\n🎉 Check completed");

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    console.error("📋 Error details:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
