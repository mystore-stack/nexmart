// scripts/check-all-database-urls.ts
// Check all possible database URLs to find the actual production database
import dotenv from "dotenv";
import "dotenv/config";
import { Pool } from "pg";

dotenv.config({ path: ".env.production" });

const databaseUrls = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  DIRECT_URL: process.env.DIRECT_URL || "",
  NEXMART_STORAGE_DATABASE_URL: process.env.NEXMART_STORAGE_DATABASE_URL || "",
  NEXMART_STORAGE_POSTGRES_URL: process.env.NEXMART_STORAGE_POSTGRES_URL || "",
  NEXMART_STORAGE_POSTGRES_PRISMA_URL: process.env.NEXMART_STORAGE_POSTGRES_PRISMA_URL || "",
};

async function checkDatabase(name: string, connectionString: string) {
  if (!connectionString) {
    console.log(`⏭️  Skipping ${name} (not set)`);
    return null;
  }

  console.log(`\n🔍 Checking ${name}...`);
  console.log(`📋 URL: ${connectionString.substring(0, 50)}...`);

  const pool = new Pool({ connectionString });

  try {
    // Check if PaymentStatus enum exists
    const enumResult = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'PaymentStatus'::regtype 
      ORDER BY enumsortorder
    `);

    if (enumResult.rows.length === 0) {
      console.log(`   ❌ No PaymentStatus enum found`);
      return null;
    }

    console.log(`   ✅ PaymentStatus enum found with ${enumResult.rows.length} values:`);
    enumResult.rows.forEach((row: any) => {
      console.log(`      - ${row.enumlabel}`);
    });

    // Check for UNPAID
    const hasUnpaid = enumResult.rows.some((row: any) => row.enumlabel === 'UNPAID');
    if (hasUnpaid) {
      console.log(`   ⚠️  UNPAID found in enum!`);
    }

    // Check orders
    const orderResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM "Order"
    `);
    console.log(`   📊 Total orders: ${orderResult.rows[0].count}`);

    // Check paymentStatus values
    const statusResult = await pool.query(`
      SELECT DISTINCT "paymentStatus"
      FROM "Order"
      ORDER BY "paymentStatus"
    `);
    console.log(`   📊 PaymentStatus values in orders:`);
    statusResult.rows.forEach((row: any) => {
      console.log(`      - ${row.paymentStatus}`);
    });

    return { name, connectionString, hasUnpaid };

  } catch (err: any) {
    console.log(`   ❌ Error: ${err.message}`);
    return null;
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log("🔍 Checking all database URLs to find actual production database...\n");

  const results = [];
  for (const [name, connectionString] of Object.entries(databaseUrls)) {
    const result = await checkDatabase(name, connectionString);
    if (result) {
      results.push(result);
    }
  }

  console.log("\n🎯 SUMMARY:");
  if (results.length === 0) {
    console.log("❌ No database with PaymentStatus enum found!");
  } else {
    results.forEach((result) => {
      console.log(`✅ ${result.name}: ${result.hasUnpaid ? 'HAS UNPAID' : 'CLEAN'}`);
    });
  }
}

main();
