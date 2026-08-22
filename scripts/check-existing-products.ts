// scripts/check-existing-products.ts
// Check existing products to understand the product ID issue
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
  console.log("🔍 Checking existing products in database");
  console.log("=".repeat(80));

  const invalidProductId = "75fd7f58-8b5e-4b12-8da5-4570765ee058";
  
  // 1. Get all products
  const allProducts = await prisma.product.findMany({
    select: { 
      id: true, 
      name: true, 
      organizationId: true, 
      published: true,
      stock: true,
      sku: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  
  console.log(`\n📦 Total products in database: ${allProducts.length}`);
  console.log(`\n📋 Recent products:`);
  allProducts.forEach(product => {
    console.log(`   - ${product.name}`);
    console.log(`     ID: ${product.id}`);
    console.log(`     SKU: ${product.sku}`);
    console.log(`     Published: ${product.published}`);
    console.log(`     Stock: ${product.stock}`);
    console.log(`     Org ID: ${product.organizationId}`);
    console.log("");
  });

  // 2. Check if any product ID starts with similar prefix
  console.log(`\n🔍 Checking for products with similar ID prefix to ${invalidProductId.substring(0, 8)}...`);
  const similarProducts = allProducts.filter(p => p.id.startsWith(invalidProductId.substring(0, 8)));
  console.log(`   Found ${similarProducts.length} products with similar prefix`);

  // 3. Get total product count
  const totalCount = await prisma.product.count();
  console.log(`\n📊 Total product count in database: ${totalCount}`);

  console.log("\n" + "=".repeat(80));
  console.log("✅ Diagnosis complete!");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
