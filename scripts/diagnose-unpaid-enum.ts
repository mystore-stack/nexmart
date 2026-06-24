// scripts/diagnose-unpaid-enum.ts
// Diagnostic script to check for UNPAID in production database
import dotenv from "dotenv";
import "dotenv/config";
import { Pool } from "pg";

dotenv.config({ path: ".env.production" });

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.production");
  process.exit(1);
}

console.log("🔍 Diagnosing UNPAID enum issue in production database...\n");
console.log("📋 DATABASE_URL:", DATABASE_URL.substring(0, 50) + "...");

const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  try {
    console.log("🔧 Step 1: Check DATABASE_URL host");
    const dbHost = DATABASE_URL.match(/@([^:]+)/)?.[1] || "unknown";
    console.log("✅ Database host:", dbHost);

    console.log("\n🔧 Step 2: Check distinct paymentStatus values in Order table");
    const distinctStatuses = await pool.query(`
      SELECT DISTINCT "paymentStatus"
      FROM "Order"
    `);
    console.log("✅ Distinct paymentStatus values:");
    distinctStatuses.rows.forEach((row: any) => {
      console.log(`   - ${row.paymentStatus}`);
    });

    console.log("\n🔧 Step 3: Check for UNPAID values in Order table");
    const unpaidOrders = await pool.query(`
      SELECT id, "orderNumber", "paymentStatus"
      FROM "Order"
      WHERE "paymentStatus"::text = 'UNPAID'
    `);
    console.log(`✅ Orders with UNPAID: ${unpaidOrders.rows.length}`);
    if (unpaidOrders.rows.length > 0) {
      unpaidOrders.rows.forEach((row: any) => {
        console.log(`   - ${row.orderNumber}: ${row.paymentStatus}`);
      });
    }

    console.log("\n🔧 Step 4: Check database enum values for PaymentStatus");
    const enumValues = await pool.query(`
      SELECT enumlabel
      FROM pg_enum
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
      WHERE typname = 'PaymentStatus'
    `);
    console.log("✅ Database enum values:");
    enumValues.rows.forEach((row: any) => {
      console.log(`   - ${row.enumlabel}`);
    });

    console.log("\n🔧 Step 5: Check all orders with their paymentStatus");
    const allOrders = await pool.query(`
      SELECT id, "orderNumber", "paymentStatus"
      FROM "Order"
    `);
    console.log(`✅ Total orders: ${allOrders.rows.length}`);
    allOrders.rows.forEach((row: any) => {
      console.log(`   - ${row.orderNumber}: ${row.paymentStatus}`);
    });

    console.log("\n🔧 Step 6: Check if PaymentStatus enum type exists");
    const enumExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus'
      )
    `);
    console.log("✅ PaymentStatus enum exists:", enumExists.rows[0].exists);

    console.log("\n🎉 Diagnostic completed");

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    console.error("📋 Error details:", err);
  } finally {
    await pool.end();
  }
}

main();
