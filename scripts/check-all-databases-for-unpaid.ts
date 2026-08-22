// scripts/check-all-databases-for-unpaid.ts
// Check all potential database URLs for UNPAID enum issue
import dotenv from "dotenv";
import "dotenv/config";
import { Pool } from "pg";

dotenv.config({ path: ".env.production" });

const DATABASE_URLS = [
  process.env.DATABASE_URL,
  process.env.DIRECT_URL,
  process.env.NEXMART_STORAGE_DATABASE_URL,
  process.env.NEXMART_STORAGE_POSTGRES_URL,
  process.env.NEXMART_STORAGE_POSTGRES_PRISMA_URL,
].filter(Boolean) as string[];

async function checkDatabase(url: string, name: string) {
  console.log(`\n🔧 Checking ${name}...`);
  console.log(`📋 URL: ${url.substring(0, 50)}...`);

  const pool = new Pool({ connectionString: url });

  try {
    // Check for UNPAID in Order table
    const unpaidOrders = await pool.query(`
      SELECT id, "orderNumber", "paymentStatus"
      FROM "Order"
      WHERE "paymentStatus"::text = 'UNPAID'
    `);

    if (unpaidOrders.rows.length > 0) {
      console.log(`❌ FOUND ${unpaidOrders.rows.length} UNPAID orders in ${name}:`);
      unpaidOrders.rows.forEach((row: any) => {
        console.log(`   - ${row.orderNumber}: ${row.paymentStatus}`);
      });
      return { name, hasUnpaid: true, count: unpaidOrders.rows.length, orders: unpaidOrders.rows };
    } else {
      console.log(`✅ No UNPAID orders in ${name}`);
      return { name, hasUnpaid: false, count: 0, orders: [] };
    }
  } catch (err: any) {
    console.log(`⚠️  Error checking ${name}:`, err.message);
    return { name, hasUnpaid: false, error: err.message };
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log("🔍 Checking all potential databases for UNPAID enum issue...\n");

  const results = [];

  for (const url of DATABASE_URLS) {
    const name = url === process.env.DATABASE_URL ? "DATABASE_URL" :
                 url === process.env.DIRECT_URL ? "DIRECT_URL" :
                 url === process.env.NEXMART_STORAGE_DATABASE_URL ? "NEXMART_STORAGE_DATABASE_URL" :
                 url === process.env.NEXMART_STORAGE_POSTGRES_URL ? "NEXMART_STORAGE_POSTGRES_URL" :
                 "NEXMART_STORAGE_POSTGRES_PRISMA_URL";
    
    const result = await checkDatabase(url, name);
    results.push(result);
  }

  console.log("\n🎉 Summary:");
  results.forEach((result: any) => {
    if (result.hasUnpaid) {
      console.log(`❌ ${result.name}: ${result.count} UNPAID orders found`);
    } else if (result.error) {
      console.log(`⚠️  ${result.name}: Error - ${result.error}`);
    } else {
      console.log(`✅ ${result.name}: No UNPAID orders`);
    }
  });

  const withUnpaid = results.filter((r: any) => r.hasUnpaid);
  if (withUnpaid.length > 0) {
    console.log("\n🔧 UNPAID found in:", withUnpaid.map((r: any) => r.name).join(", "));
  } else {
    console.log("\n✅ No UNPAID found in any database");
  }
}

main();
