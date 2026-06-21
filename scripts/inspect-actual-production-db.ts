// scripts/inspect-actual-production-db.ts
// Direct inspection of ACTUAL production database using .env.production
import dotenv from "dotenv";
import "dotenv/config";
import { Pool } from "pg";

// Load .env.production specifically
dotenv.config({ path: ".env.production" });

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.production");
  process.exit(1);
}

console.log("🔍 Inspecting ACTUAL PRODUCTION database from .env.production...\n");
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

    // 2. Check Order table paymentStatus values
    console.log("\n🔧 Step 2: Checking Order table paymentStatus values...");
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

    // 3. Count orders by paymentStatus
    console.log("\n🔧 Step 3: Counting orders by paymentStatus...");
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

    // 4. Check for UNPAID specifically
    console.log("\n🔧 Step 4: Checking for UNPAID paymentStatus...");
    const unpaidResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM "Order"
      WHERE "paymentStatus" = 'UNPAID'
    `);
    console.log(`📊 Orders with paymentStatus='UNPAID': ${unpaidResult.rows[0].count}`);

  } catch (err: any) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
