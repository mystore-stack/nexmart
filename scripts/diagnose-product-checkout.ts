// scripts/diagnose-product-checkout.ts
// Diagnostic script to check product 75fd7f58-8b5e-4b12-8da5-4570765ee058
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
  console.log("🔍 Diagnosing product checkout failure...\n");

  const PRODUCT_ID = "75fd7f58-8b5e-4b12-8da5-4570765ee058";
  const USER_ID = "0baf9f5d-38ab-43a0-a601-a669ef94b7a8";
  const ORGANIZATION_ID = "777981b1-a027-49a2-b786-eadee83594e5";

  try {
    console.log("🔧 Step 1: Check if product exists (no filters)");
    const rawProduct = await prisma.product.findUnique({
      where: { id: PRODUCT_ID },
    });
    console.log("✅ Raw product:", rawProduct);

    if (!rawProduct) {
      console.log("\n❌ Product does not exist in database");
      console.log("🔧 Step 2: Check if CartItem references this product");
      const cartItem = await prisma.cartItem.findFirst({
        where: { productId: PRODUCT_ID, userId: USER_ID },
      });
      console.log("✅ CartItem:", cartItem);
      
      console.log("\n🔧 Step 3: Check all CartItems for user");
      const allCartItems = await prisma.cartItem.findMany({
        where: { userId: USER_ID },
        include: { product: true },
      });
      console.log(`✅ Total CartItems: ${allCartItems.length}`);
      allCartItems.forEach((item) => {
        console.log(`   - ${item.productId}: ${item.product?.name || 'N/A'} (published: ${item.product?.published})`);
      });
      
      console.log("\n🔧 Step 4: Check all products in database");
      const allProducts = await prisma.product.findMany({
        select: { id: true, name: true, organizationId: true, published: true },
        take: 10,
      });
      console.log(`✅ Total products: ${allProducts.length}`);
      allProducts.forEach((product) => {
        console.log(`   - ${product.id}: ${product.name} (org: ${product.organizationId}, published: ${product.published})`);
      });
      
      console.log("\n🎉 Diagnostic completed");
      return;
    }

    console.log("\n🔧 Step 2: Check product with checkout filters");
    const filteredProduct = await prisma.product.findFirst({
      where: {
        id: PRODUCT_ID,
        organizationId: ORGANIZATION_ID,
        published: true,
      },
    });
    console.log("✅ Filtered product:", filteredProduct);

    console.log("\n🔧 Step 3: Compare product organizationId");
    console.log(`   Product organizationId: ${rawProduct.organizationId}`);
    console.log(`   Checkout organizationId: ${ORGANIZATION_ID}`);
    console.log(`   Match: ${rawProduct.organizationId === ORGANIZATION_ID}`);

    console.log("\n🔧 Step 4: Check product published status");
    console.log(`   Product published: ${rawProduct.published}`);

    console.log("\n🔧 Step 5: Check product stock");
    console.log(`   Product stock: ${rawProduct.stock}`);

    console.log("\n🔧 Step 6: Check CartItem for this product");
    const cartItem = await prisma.cartItem.findFirst({
      where: { productId: PRODUCT_ID, userId: USER_ID },
      include: { product: true },
    });
    console.log("✅ CartItem:", cartItem);

    console.log("\n🔧 Step 7: Check all CartItems for user");
    const allCartItems = await prisma.cartItem.findMany({
      where: { userId: USER_ID },
      include: { product: true },
    });
    console.log(`✅ Total CartItems: ${allCartItems.length}`);
    allCartItems.forEach((item) => {
      console.log(`   - ${item.productId}: ${item.product?.name || 'N/A'} (published: ${item.product?.published})`);
    });

    console.log("\n🔧 Step 8: Check all products in database");
    const allProducts = await prisma.product.findMany({
      select: { id: true, name: true, organizationId: true, published: true },
      take: 10,
    });
    console.log(`✅ Total products: ${allProducts.length}`);
    allProducts.forEach((product) => {
      console.log(`   - ${product.id}: ${product.name} (org: ${product.organizationId}, published: ${product.published})`);
    });

    console.log("\n🎉 Diagnostic completed");

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    console.error("📋 Error details:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
