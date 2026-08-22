// scripts/check-cart-invalid-product.ts
// Check cart items for invalid product reference 75fd7f58-8b5e-4b12-8da5-4570765ee058
import dotenv from "dotenv";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL || "";
const DATABASE_URL_UNPOOLED = process.env.DATABASE_URL_UNPOOLED || "";

function pickDatabaseUrl() {
  const looksLocalhost = DATABASE_URL.toLowerCase().includes("localhost") || DATABASE_URL.toLowerCase().includes("127.0.0.1");
  if (looksLocalhost && DATABASE_URL_UNPOOLED) return DATABASE_URL_UNPOOLED;
  return DATABASE_URL;
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: pickDatabaseUrl() },
  },
});

async function main() {
  const productId = "75fd7f58-8b5e-4b12-8da5-4570765ee058";
  
  console.log("🔍 Checking cart items for invalid product:", productId);
  console.log("=".repeat(80));

  // 1. Check all cart items
  const allCartItems = await prisma.cartItem.findMany({
    include: { 
      user: { select: { id: true, email: true } },
      product: { select: { id: true, name: true, organizationId: true } },
    },
  });
  
  console.log(`\n🛒 Total cart items in database: ${allCartItems.length}`);

  // 2. Find cart items with the invalid product ID
  const invalidCartItems = allCartItems.filter(item => item.productId === productId);
  console.log(`\n❌ Cart items with invalid product ID ${productId}: ${invalidCartItems.length}`);
  
  if (invalidCartItems.length > 0) {
    invalidCartItems.forEach(item => {
      console.log(`   - Cart Item ID: ${item.id}`);
      console.log(`     User: ${item.user.email} (${item.user.id})`);
      console.log(`     Product ID: ${item.productId}`);
      console.log(`     Variant ID: ${item.variantId || 'none'}`);
      console.log(`     Quantity: ${item.quantity}`);
      console.log(`     Created: ${item.createdAt}`);
    });
  }

  // 3. Check all cart items for ANY invalid product references
  console.log("\n🔍 Checking ALL cart items for invalid product references...");
  const allProductIds = allCartItems.map(item => item.productId);
  const uniqueProductIds = [...new Set(allProductIds)];
  
  const existingProducts = await prisma.product.findMany({
    where: { id: { in: uniqueProductIds } },
    select: { id: true },
  });
  const existingProductIds = new Set(existingProducts.map(p => p.id));
  
  const allInvalidCartItems = allCartItems.filter(item => !existingProductIds.has(item.productId));
  console.log(`\n❌ Total cart items with invalid product references: ${allInvalidCartItems.length}`);
  
  if (allInvalidCartItems.length > 0) {
    console.log("\n📋 Invalid cart items:");
    allInvalidCartItems.forEach(item => {
      console.log(`   - Cart Item ID: ${item.id}`);
      console.log(`     User: ${item.user.email}`);
      console.log(`     Invalid Product ID: ${item.productId}`);
      console.log(`     Quantity: ${item.quantity}`);
    });
  }

  // 4. Clean up invalid cart items
  if (allInvalidCartItems.length > 0) {
    console.log("\n🔧 Cleaning up invalid cart items...");
    const deleteResult = await prisma.cartItem.deleteMany({
      where: {
        id: { in: allInvalidCartItems.map(item => item.id) },
      },
    });
    console.log(`   ✅ Deleted ${deleteResult.count} invalid cart items`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ Diagnosis complete!");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
