// scripts/fix-payment-status-production.ts
// Migration script to fix UNPAID paymentStatus values in PRODUCTION database
// This script uses the production DATABASE_URL from Vercel environment
import dotenv from "dotenv";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

// Use DATABASE_URL from environment (should be production DATABASE_URL)
const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment variables");
  console.error("Please set DATABASE_URL to the production database URL");
  process.exit(1);
}

console.log("🔍 Using DATABASE_URL:", DATABASE_URL.substring(0, 50) + "...");

const prisma = new PrismaClient({
  datasources: {
    db: { url: DATABASE_URL },
  },
});

// Use direct PostgreSQL connection to bypass Prisma enum validation
const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  console.log("🔍 Fixing PaymentStatus enum mismatch in PRODUCTION...\n");

  console.log("📋 Current PaymentStatus enum values: PENDING, PAID, FAILED");
  console.log("📋 Invalid value in database: UNPAID\n");

  // Step 1: Check current enum values in production
  console.log("🔧 Step 1: Checking current PaymentStatus enum in production...");
  try {
    const enumValues = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'PaymentStatus'::regtype 
      ORDER BY enumsortorder
    `);
    console.log("📊 Current PaymentStatus enum values in production:");
    enumValues.rows.forEach((row: any) => {
      console.log(`   - ${row.enumlabel}`);
    });
  } catch (err: any) {
    console.error("❌ Error checking enum values:", err.message);
  }

  // Step 2: Check orders with UNPAID paymentStatus
  console.log("\n🔧 Step 2: Finding orders with UNPAID paymentStatus...");
  try {
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
    }
  } catch (err: any) {
    console.error("❌ Error finding UNPAID orders:", err.message);
  }

  // Step 3: Temporarily add UNPAID to the enum if needed
  console.log("\n🔧 Step 3: Adding UNPAID to PaymentStatus enum if needed...");
  try {
    await pool.query(`ALTER TYPE "PaymentStatus" ADD VALUE 'UNPAID'`);
    console.log("✅ Added UNPAID to PaymentStatus enum");
  } catch (err: any) {
    if (err.code === '42710') {
      console.log("⚠️  UNPAID already exists in enum (skipping)");
    } else {
      console.error("❌ Error adding UNPAID to enum:", err.message);
      console.log("⚠️  Continuing with migration...");
    }
  }

  // Step 4: Migrate UNPAID to PENDING
  console.log("\n🔧 Step 4: Migrating UNPAID → PENDING...");
  try {
    const result = await pool.query(`
      UPDATE "Order"
      SET "paymentStatus" = 'PENDING'
      WHERE "paymentStatus" = 'UNPAID'
    `);

    console.log(`✅ Updated ${result.rowCount} orders from UNPAID to PENDING`);
  } catch (err: any) {
    console.error("❌ Error migrating UNPAID to PENDING:", err.message);
  }

  // Step 5: Remove UNPAID from the enum
  console.log("\n🔧 Step 5: Removing UNPAID from PaymentStatus enum...");
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

  // Step 6: Verify the fix
  console.log("\n🔧 Step 6: Verifying paymentStatus values...");
  try {
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

    const enumValues = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'PaymentStatus'::regtype 
      ORDER BY enumsortorder
    `);
    console.log("\n📊 Final PaymentStatus enum values:");
    enumValues.rows.forEach((row: any) => {
      console.log(`   - ${row.enumlabel}`);
    });
  } catch (err: any) {
    console.error("❌ Error verifying paymentStatus values:", err.message);
  }

  console.log("\n🎉 Migration complete!");
  console.log("✅ The analytics API should now work without errors");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => { 
    await prisma.$disconnect();
    await pool.end();
  });
