// scripts/fix-direct-url-unpaid.ts
// Fix UNPAID enum issue in DIRECT_URL
import dotenv from "dotenv";
import "dotenv/config";
import { Pool } from "pg";

dotenv.config({ path: ".env.production" });

const DIRECT_URL = process.env.DIRECT_URL || "";

if (!DIRECT_URL) {
  console.error("❌ DIRECT_URL not found in .env.production");
  process.exit(1);
}

console.log("🔧 Fixing UNPAID enum issue in DIRECT_URL...\n");
console.log("📋 DIRECT_URL:", DIRECT_URL.substring(0, 50) + "...");

const pool = new Pool({ connectionString: DIRECT_URL });

async function main() {
  try {
    console.log("🔧 Step 1: Check database enum values for PaymentStatus");
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

    console.log("\n🔧 Step 2: Check for UNPAID values in Order table");
    const unpaidOrders = await pool.query(`
      SELECT id, "orderNumber", "paymentStatus"
      FROM "Order"
      WHERE "paymentStatus"::text = 'UNPAID'
    `);
    console.log(`✅ Orders with UNPAID: ${unpaidOrders.rows.length}`);
    unpaidOrders.rows.forEach((row: any) => {
      console.log(`   - ${row.orderNumber}: ${row.paymentStatus}`);
    });

    if (unpaidOrders.rows.length > 0) {
      console.log("\n🔧 Step 3: Update UNPAID orders to PENDING");
      const updateResult = await pool.query(`
        UPDATE "Order"
        SET "paymentStatus" = 'PENDING', "updatedAt" = NOW()
        WHERE "paymentStatus"::text = 'UNPAID'
        RETURNING id, "orderNumber", "paymentStatus"
      `);
      console.log(`✅ Updated ${updateResult.rows.length} orders to PENDING`);
      updateResult.rows.forEach((row: any) => {
        console.log(`   - ${row.orderNumber}: ${row.paymentStatus}`);
      });
    } else {
      console.log("✅ No UNPAID orders found (already fixed)");
    }

    console.log("\n🔧 Step 5: Check if enum contains UNPAID");
    const hasUnpaidInEnum = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE typname = 'PaymentStatus' AND enumlabel = 'UNPAID'
      )
    `);
    console.log(`✅ UNPAID in enum: ${hasUnpaidInEnum.rows[0].exists}`);

    if (hasUnpaidInEnum.rows[0].exists) {
      console.log("\n🔧 Step 6: Remove UNPAID from enum (with default value handling)");
      
      // Get current default value
      const defaultVal = await pool.query(`
        SELECT column_default
        FROM information_schema.columns
        WHERE table_name = 'Order' AND column_name = 'paymentStatus'
      `);
      console.log(`✅ Current default value: ${defaultVal.rows[0]?.column_default || 'none'}`);

      // Drop default value
      await pool.query(`
        ALTER TABLE "Order" ALTER COLUMN "paymentStatus" DROP DEFAULT
      `);
      console.log("✅ Dropped default value");

      // Alter enum
      await pool.query(`
        ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
        CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
        ALTER TABLE "Order" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus" USING "paymentStatus"::text::"PaymentStatus";
        DROP TYPE "PaymentStatus_old";
      `);
      console.log("✅ Removed UNPAID from enum");

      // Re-add default value if it existed
      if (defaultVal.rows[0]?.column_default) {
        await pool.query(`
          ALTER TABLE "Order" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING'
        `);
        console.log("✅ Re-added default value");
      }
    }

    console.log("\n🎉 Fix completed successfully");

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    console.error("📋 Error details:", err);
  } finally {
    await pool.end();
  }
}

main();
