// scripts/check-product-75fd7f58.ts
// Diagnostic script to check product 75fd7f58-8b5e-4b12-8da5-4570765ee058
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
  
  console.log("🔍 Checking product:", productId);
  console.log("=" .repeat(80));

  // 1. Check if product exists (no filters)
  const rawProduct = await prisma.product.findUnique({
    where: { id: productId },
  });
  
  console.log("\n📦 RAW PRODUCT (no filters):");
  if (rawProduct) {
    console.log("   ✅ Product exists");
    console.log("   ID:", rawProduct.id);
    console.log("   Name:", rawProduct.name);
    console.log("   Organization ID:", rawProduct.organizationId);
    console.log("   Published:", rawProduct.published);
    console.log("   Featured:", rawProduct.featured);
    console.log("   Stock:", rawProduct.stock);
    console.log("   Low Stock At:", rawProduct.lowStockAt);
    console.log("   SKU:", rawProduct.sku);
    console.log("   Category ID:", rawProduct.categoryId);
  } else {
    console.log("   ❌ Product does NOT exist in database");
    return;
  }

  // 2. Get default organization
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true, slug: true },
  });
  const defaultOrg = organizations[0];
  console.log("\n🏢 DEFAULT ORGANIZATION:");
  console.log("   ID:", defaultOrg.id);
  console.log("   Name:", defaultOrg.name);

  // 3. Check with organization filter
  const productWithOrgFilter = await prisma.product.findFirst({
    where: {
      id: productId,
      organizationId: defaultOrg.id,
    },
  });
  
  console.log("\n🔍 PRODUCT WITH ORGANIZATION FILTER:");
  console.log("   Filter: organizationId =", defaultOrg.id);
  console.log("   Result:", productWithOrgFilter ? "✅ Found" : "❌ Not found");

  // 4. Check with published filter
  const productWithPublishedFilter = await prisma.product.findFirst({
    where: {
      id: productId,
      organizationId: defaultOrg.id,
      published: true,
    },
  });
  
  console.log("\n🔍 PRODUCT WITH ORGANIZATION + PUBLISHED FILTER:");
  console.log("   Filter: organizationId =", defaultOrg.id, ", published = true");
  console.log("   Result:", productWithPublishedFilter ? "✅ Found" : "❌ Not found");

  // 5. Check all filter combinations
  console.log("\n🔍 ALL FILTER COMBINATIONS:");
  
  const filters = [
    { name: "No filters", where: { id: productId } },
    { name: "organizationId only", where: { id: productId, organizationId: defaultOrg.id } },
    { name: "organizationId + published", where: { id: productId, organizationId: defaultOrg.id, published: true } },
    { name: "organizationId + published + featured", where: { id: productId, organizationId: defaultOrg.id, published: true, featured: true } },
  ];

  for (const filter of filters) {
    const result = await prisma.product.findFirst({
      where: filter.where as any,
    });
    console.log(`   ${filter.name}: ${result ? "✅ Found" : "❌ Not found"}`);
  }

  // 6. Check cart items for this product
  console.log("\n🛒 CART ITEMS FOR THIS PRODUCT:");
  const cartItems = await prisma.cartItem.findMany({
    where: { productId },
    include: { user: { select: { id: true, email: true } } },
  });
  console.log(`   Found ${cartItems.length} cart items`);
  cartItems.forEach(item => {
    console.log(`   - User: ${item.user.email}, Quantity: ${item.quantity}`);
  });

  console.log("\n" + "=".repeat(80));
  console.log("✅ Diagnosis complete!");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
