// scripts/diagnose-orders-api.ts
// Diagnostic script to test orders API queries individually
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

async function main() {
  console.log("🔍 Diagnosing Orders API queries...\n");

  const ORGANIZATION_ID = "777981b1-a027-49a2-b786-eadee83594e5";
  const USER_ID = "0baf9f5d-38ab-43a0-a601-a669ef94b7a8";

  try {
    // Test 1: Minimal query - no includes
    console.log("🔧 Test 1: Minimal query (no includes)");
    const test1 = await prisma.order.findMany({
      where: { organizationId: ORGANIZATION_ID },
      take: 1,
    });
    console.log("✅ Test 1 passed:", test1.length, "orders found");

    // Test 2: With user relation
    console.log("\n🔧 Test 2: With user relation");
    const test2 = await prisma.order.findMany({
      where: { organizationId: ORGANIZATION_ID },
      take: 1,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    console.log("✅ Test 2 passed:", test2.length, "orders found");

    // Test 3: With items relation
    console.log("\n🔧 Test 3: With items relation");
    const test3 = await prisma.order.findMany({
      where: { organizationId: ORGANIZATION_ID },
      take: 1,
      include: {
        items: { include: { product: { select: { name: true, images: true } } } },
      },
    });
    console.log("✅ Test 3 passed:", test3.length, "orders found");

    // Test 4: With address relation
    console.log("\n🔧 Test 4: With address relation");
    const test4 = await prisma.order.findMany({
      where: { organizationId: ORGANIZATION_ID },
      take: 1,
      include: {
        address: true,
      },
    });
    console.log("✅ Test 4 passed:", test4.length, "orders found");

    // Test 5: With coupon relation
    console.log("\n🔧 Test 5: With coupon relation");
    const test5 = await prisma.order.findMany({
      where: { organizationId: ORGANIZATION_ID },
      take: 1,
      include: {
        coupon: { select: { code: true } },
      },
    });
    console.log("✅ Test 5 passed:", test5.length, "orders found");

    // Test 6: With trackingHistory relation
    console.log("\n🔧 Test 6: With trackingHistory relation");
    const test6 = await prisma.order.findMany({
      where: { organizationId: ORGANIZATION_ID },
      take: 1,
      include: {
        trackingHistory: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    console.log("✅ Test 6 passed:", test6.length, "orders found");

    // Test 7: Full admin orders query
    console.log("\n🔧 Test 7: Full admin orders query");
    const test7 = await prisma.order.findMany({
      where: { organizationId: ORGANIZATION_ID },
      take: 1,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        items: { include: { product: { select: { name: true, images: true } } } },
        address: true,
        coupon: { select: { code: true } },
        trackingHistory: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    console.log("✅ Test 7 passed:", test7.length, "orders found");

    // Test 8: Full user orders query
    console.log("\n🔧 Test 8: Full user orders query");
    const test8 = await prisma.order.findMany({
      where: { userId: USER_ID, organizationId: ORGANIZATION_ID },
      take: 1,
      include: { items: { include: { product: true, variant: true } }, address: true },
      orderBy: { createdAt: "desc" },
    });
    console.log("✅ Test 8 passed:", test8.length, "orders found");

    console.log("\n🎉 All tests passed! The queries work correctly in isolation.");

  } catch (err: any) {
    console.error("❌ Test failed:", err.message);
    console.error("📋 Error details:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
