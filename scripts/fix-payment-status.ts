// scripts/fix-payment-status.ts
// Migration script to fix UNPAID paymentStatus values in orders
import dotenv from "dotenv";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

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

// Use direct PostgreSQL connection to bypass Prisma enum validation
const pool = new Pool({ connectionString: pickDatabaseUrl() });

async function main() {
  console.log("🔍 Fixing PaymentStatus enum mismatch...\n");

  console.log("📋 Current PaymentStatus enum values: PENDING, PAID, FAILED");
  console.log("📋 Invalid value in database: UNPAID\n");

  // Step 1: Temporarily add UNPAID to the enum
  console.log("� Step 1: Adding UNPAID to PaymentStatus enum...");
  try {
    await pool.query(`ALTER TYPE "PaymentStatus" ADD VALUE 'UNPAID'`);
    console.log("✅ Added UNPAID to PaymentStatus enum");
  } catch (err: any) {
    if (err.code === '42710') {
      console.log("⚠️  UNPAID already exists in enum (skipping)");
    } else {
      console.error("❌ Error adding UNPAID to enum:", err.message);
      throw err;
    }
  }

  // Step 2: Find orders with UNPAID paymentStatus
  console.log("\n🔧 Step 2: Finding orders with UNPAID paymentStatus...");
  const unpaidOrdersResult = await pool.query(`
    SELECT id, "orderNumber", "paymentStatus"
    FROM "Order"
    WHERE "paymentStatus" = 'UNPAID'
  `);

  const unpaidOrders = unpaidOrdersResult.rows;
  console.log(`📦 Found ${unpaidOrders.length} orders with paymentStatus = 'UNPAID':`);
  
  if (unpaidOrders.length === 0) {
    console.log("✅ No orders with UNPAID paymentStatus found!");
  } else {
    unpaidOrders.forEach((order: any) => {
      console.log(`   - ${order.orderNumber} (${order.id}): ${order.paymentStatus}`);
    });

    // Step 3: Migrate UNPAID to PENDING
    console.log(`\n🔧 Step 3: Migrating UNPAID → PENDING...`);
    const result = await pool.query(`
      UPDATE "Order"
      SET "paymentStatus" = 'PENDING'
      WHERE "paymentStatus" = 'UNPAID'
    `);

    console.log(`✅ Updated ${result.rowCount} orders from UNPAID to PENDING`);
  }

  // Step 4: Remove UNPAID from the enum
  console.log("\n🔧 Step 4: Removing UNPAID from PaymentStatus enum...");
  try {
    // PostgreSQL doesn't support dropping enum values directly
    // We need to recreate the enum
    await pool.query(`
      BEGIN;
      
      -- Rename old enum
      ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
      
      -- Create new enum without UNPAID
      CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');
      
      -- Drop default constraint temporarily
      ALTER TABLE "Order" ALTER COLUMN "paymentStatus" DROP DEFAULT;
      
      -- Update column to use new enum
      ALTER TABLE "Order" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus" 
        USING "paymentStatus"::text::"PaymentStatus";
      
      -- Restore default constraint
      ALTER TABLE "Order" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING';
      
      -- Drop old enum
      DROP TYPE "PaymentStatus_old";
      
      COMMIT;
    `);
    console.log("✅ Removed UNPAID from PaymentStatus enum");
  } catch (err: any) {
    console.error("❌ Error removing UNPAID from enum:", err.message);
    console.log("⚠️  You may need to manually remove UNPAID from the enum");
    console.log("⚠️  The data has been migrated, so the API should work now");
  }

  // Step 5: Verify the fix
  console.log("\n🔧 Step 5: Verifying paymentStatus values...");
  const statusCountsResult = await pool.query(`
    SELECT "paymentStatus", COUNT(*) as count
    FROM "Order"
    GROUP BY "paymentStatus"
    ORDER BY "paymentStatus"
  `);

  console.log("📊 Current paymentStatus distribution:");
  statusCountsResult.rows.forEach((row: any) => {
    console.log(`   - ${row.paymentStatus}: ${row.count} orders`);
  });

  console.log("\n🎉 Migration complete!");
  console.log("✅ The analytics API should now work without errors");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => { 
    await prisma.$disconnect();
    await pool.end();
  });
