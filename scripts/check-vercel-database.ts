// scripts/check-vercel-database.ts
// Check the actual DATABASE_URL that Vercel is using
import dotenv from "dotenv";
import "dotenv/config";
import { Pool } from "pg";

dotenv.config({ path: ".env.production" });

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.production");
  process.exit(1);
}

console.log("🔍 Checking Vercel DATABASE_URL...\n");
console.log("📋 DATABASE_URL:", DATABASE_URL.substring(0, 50) + "...");

const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  try {
    // Check if Order table exists
    console.log("🔧 Step 1: Checking if Order table exists...");
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Order'
      );
    `);
    console.log(`📊 Order table exists: ${tableExists.rows[0].exists}`);

    if (!tableExists.rows[0].exists) {
      console.log("❌ Order table does not exist in Vercel database!");
      console.log("⚠️  This means Vercel is using a different database than expected");
      return;
    }

    // Count total orders
    console.log("\n🔧 Step 2: Counting total orders...");
    const countResult = await pool.query(`SELECT COUNT(*) as count FROM "Order"`);
    console.log(`📊 Total orders in Vercel database: ${countResult.rows[0].count}`);

    // Check organizations
    console.log("\n🔧 Step 3: Checking organizations...");
    const orgResult = await pool.query(`
      SELECT id, name, slug, "ownerId" 
      FROM "Organization" 
      LIMIT 5
    `);
    console.log(`📊 Organizations in Vercel database: ${orgResult.rows.length}`);
    orgResult.rows.forEach((org: any) => {
      console.log(`   - ${org.name} (${org.slug}): ${org.id}`);
    });

    // Check users
    console.log("\n🔧 Step 4: Checking users...");
    const userResult = await pool.query(`
      SELECT id, email, name, role 
      FROM "User" 
      LIMIT 5
    `);
    console.log(`📊 Users in Vercel database: ${userResult.rows.length}`);
    userResult.rows.forEach((user: any) => {
      console.log(`   - ${user.email} (${user.role}): ${user.id}`);
    });

    // Check orders by organization
    console.log("\n🔧 Step 5: Checking orders by organization...");
    const ordersByOrg = await pool.query(`
      SELECT "organizationId", COUNT(*) as count
      FROM "Order"
      GROUP BY "organizationId"
    `);
    console.log(`📊 Orders by organization:`);
    if (ordersByOrg.rows.length === 0) {
      console.log("   ⚠️  No orders found in any organization");
    } else {
      ordersByOrg.rows.forEach((row: any) => {
        console.log(`   - Organization ${row.organizationId}: ${row.count} orders`);
      });
    }

    // CRITICAL: Compare with expected database
    console.log("\n🔧 Step 6: CRITICAL CHECK - Is this the correct database?");
    console.log("⚠️  If orders count is 0, Vercel is using a different database");
    console.log("⚠️  You need to either:");
    console.log("   1. Update DATABASE_URL in Vercel to point to the correct database");
    console.log("   2. Or migrate data to the database Vercel is using");

  } catch (err: any) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
