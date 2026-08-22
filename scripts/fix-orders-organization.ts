// scripts/fix-orders-organization.ts
// Diagnostic script to check and fix organizationId mismatch in orders
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
  console.log("🔍 Diagnosing orders organizationId issue...\n");

  // 1. Check organizations
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true, slug: true, ownerId: true },
  });
  console.log(`📊 Found ${organizations.length} organizations:`);
  organizations.forEach(org => {
    console.log(`   - ${org.name} (${org.slug}): ${org.id}, Owner: ${org.ownerId}`);
  });

  if (organizations.length === 0) {
    console.error("❌ No organizations found! Please run: npm run db:seed");
    return;
  }

  const defaultOrg = organizations[0];
  console.log(`\n🎯 Using default organization: ${defaultOrg.name} (${defaultOrg.id})\n`);

  // 2. Check users and their memberships
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
  });
  console.log(`👥 Found ${users.length} users:`);

  for (const user of users) {
    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
      select: { organizationId: true, role: true },
    });
    console.log(`   - ${user.email} (${user.role}): ${memberships.length} membership(s)`);
    memberships.forEach(m => {
      console.log(`     → Org: ${m.organizationId}, Role: ${m.role}`);
    });
  }

  // 3. Check orders and their organizationId
  const orders = await prisma.order.findMany({
    select: { 
      id: true, 
      orderNumber: true, 
      organizationId: true, 
      userId: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  console.log(`\n📦 Found ${orders.length} recent orders:`);
  const ordersWithoutOrg = [];
  const ordersWithWrongOrg = [];

  for (const order of orders) {
    const orgMatch = order.organizationId === defaultOrg.id;
    console.log(`   - ${order.orderNumber}: OrgId=${order.organizationId} ${orgMatch ? '✅' : '❌'}`);
    
    if (!order.organizationId) {
      ordersWithoutOrg.push(order);
    } else if (!orgMatch) {
      ordersWithWrongOrg.push(order);
    }
  }

  // 4. Summary
  console.log(`\n📋 Summary:`);
  console.log(`   - Orders without organizationId: ${ordersWithoutOrg.length}`);
  console.log(`   - Orders with wrong organizationId: ${ordersWithWrongOrg.length}`);

  // 5. Fix options
  if (ordersWithoutOrg.length > 0 || ordersWithWrongOrg.length > 0) {
    console.log(`\n🔧 Fixing orders...`);
    
    let fixedCount = 0;
    
    // Fix orders without organizationId
    for (const order of ordersWithoutOrg) {
      await prisma.order.update({
        where: { id: order.id },
        data: { organizationId: defaultOrg.id },
      });
      console.log(`   ✅ Fixed ${order.orderNumber}: set organizationId to ${defaultOrg.id}`);
      fixedCount++;
    }
    
    // Fix orders with wrong organizationId
    for (const order of ordersWithWrongOrg) {
      await prisma.order.update({
        where: { id: order.id },
        data: { organizationId: defaultOrg.id },
      });
      console.log(`   ✅ Fixed ${order.orderNumber}: updated organizationId to ${defaultOrg.id}`);
      fixedCount++;
    }
    
    console.log(`\n🎉 Fixed ${fixedCount} orders!`);
  } else {
    console.log(`\n✅ All orders have correct organizationId!`);
  }

  // 6. Check products organizationId as well
  const products = await prisma.product.findMany({
    select: { id: true, name: true, organizationId: true },
    take: 10,
  });
  
  console.log(`\n🏷️  Sample products organizationId:`);
  const productsWithoutOrg = [];
  
  for (const product of products) {
    const orgMatch = product.organizationId === defaultOrg.id;
    console.log(`   - ${product.name}: OrgId=${product.organizationId} ${orgMatch ? '✅' : '❌'}`);
    
    if (!product.organizationId) {
      productsWithoutOrg.push(product);
    }
  }
  
  if (productsWithoutOrg.length > 0) {
    console.log(`\n🔧 Fixing products without organizationId...`);
    for (const product of productsWithoutOrg) {
      await prisma.product.update({
        where: { id: product.id },
        data: { organizationId: defaultOrg.id },
      });
      console.log(`   ✅ Fixed ${product.name}: set organizationId to ${defaultOrg.id}`);
    }
  }

  console.log("\n✅ Diagnosis complete!");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
