// scripts/inspect-production-db.ts
// Direct inspection of production database enum values
import dotenv from "dotenv";
import "dotenv/config";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment variables");
  process.exit(1);
}

console.log("🔍 Inspecting PRODUCTION database...\n");
console.log("📋 DATABASE_URL:", DATABASE_URL.substring(0, 50) + "...");

const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  try {
    // 1. Check PaymentStatus enum definition
    console.log("🔧 Step 1: Checking PaymentStatus enum definition...");
    const enumResult = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'PaymentStatus'::regtype 
      ORDER BY enumsortorder
    `);
    console.log("📊 PaymentStatus enum values:");
    if (enumResult.rows.length === 0) {
      console.log("   ⚠️  NO PaymentStatus enum found!");
    } else {
      enumResult.rows.forEach((row: any) => {
        console.log(`   - ${row.enumlabel}`);
      });
    }

    // 2. Check all enum types in database
    console.log("\n🔧 Step 2: Checking all enum types in database...");
    const allEnums = await pool.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e'
      ORDER BY typname
    `);
    console.log("📊 All enum types:");
    allEnums.rows.forEach((row: any) => {
      console.log(`   - ${row.typname}`);
    });

    // 3. Check Order table paymentStatus values
    console.log("\n🔧 Step 3: Checking Order table paymentStatus values...");
    const orderStatusResult = await pool.query(`
      SELECT DISTINCT "paymentStatus"
      FROM "Order"
      ORDER BY "paymentStatus"
    `);
    console.log("📊 Distinct paymentStatus values in Order table:");
    if (orderStatusResult.rows.length === 0) {
      console.log("   ⚠️  NO orders found!");
    } else {
      orderStatusResult.rows.forEach((row: any) => {
        console.log(`   - ${row.paymentStatus}`);
      });
    }

    // 4. Count orders by paymentStatus
    console.log("\n🔧 Step 4: Counting orders by paymentStatus...");
    const statusCounts = await pool.query(`
      SELECT "paymentStatus", COUNT(*) as count
      FROM "Order"
      GROUP BY "paymentStatus"
      ORDER BY "paymentStatus"
    `);
    console.log("📊 Order count by paymentStatus:");
    statusCounts.rows.forEach((row: any) => {
      console.log(`   - ${row.paymentStatus}: ${row.count} orders`);
    });

    // 5. Check for any UNPAID in any table
    console.log("\n🔧 Step 5: Searching for UNPAID in any text column...");
    const searchResult = await pool.query(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE data_type LIKE '%char%' OR data_type LIKE '%text%'
      ORDER BY table_name, column_name
    `);
    console.log(`📊 Found ${searchResult.rows.length} text columns to check`);

    // 6. Check Prisma migrations
    console.log("\n🔧 Step 6: Checking Prisma migrations...");
    try {
      const migrations = await pool.query(`
        SELECT migration_name, rolled_back_at
        FROM _prisma_migrations
        ORDER BY started_at
      `);
      console.log("📊 Prisma migrations:");
      migrations.rows.forEach((row: any) => {
        console.log(`   - ${row.migration_name} ${row.rolled_back_at ? '(rolled back)' : ''}`);
      });
    } catch (err: any) {
      console.log("⚠️  No _prisma_migrations table found");
    }

  } catch (err: any) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
