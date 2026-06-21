// scripts/check-production-user-id.ts
// Check the actual production userId from session
import dotenv from "dotenv";
import "dotenv/config";
import { Pool } from "pg";

dotenv.config({ path: ".env.production" });

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.production");
  process.exit(1);
}

console.log("🔍 Checking production userId from session...\n");
console.log("📋 DATABASE_URL:", DATABASE_URL.substring(0, 50) + "...");

const PRODUCTION_USER_ID = "0baf9f5d-38ab-43a0-a601-a669ef94b7a8";

const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  try {
    console.log("🔧 Step 1: Checking if production userId exists in database...");
    const user = await pool.query(`
      SELECT id, email, name, role
      FROM "User"
      WHERE id = $1
    `, [PRODUCTION_USER_ID]);

    if (user.rows.length === 0) {
      console.log("❌ Production userId does NOT exist in database!");
      console.log("⚠️  This is the root cause - session has invalid userId");
      console.log("🔧 Need to create this user or fix the session");
      return;
    }

    console.log("✅ Production userId exists in database:");
    console.log(`   - Email: ${user.rows[0].email}`);
    console.log(`   - Name: ${user.rows[0].name}`);
    console.log(`   - Role: ${user.rows[0].role}`);
    console.log(`   - ID: ${user.rows[0].id}`);

    // Check membership
    console.log("\n🔧 Step 2: Checking membership for production userId...");
    const membership = await pool.query(`
      SELECT * FROM "Membership"
      WHERE "userId" = $1
    `, [PRODUCTION_USER_ID]);

    if (membership.rows.length === 0) {
      console.log("⚠️  Production userId has NO membership in any organization");
      console.log("🔧 This is why they see 'No orders found'");
      
      // Get the organization that has orders
      const orgWithOrders = await pool.query(`
        SELECT DISTINCT "organizationId"
        FROM "Order"
        LIMIT 1
      `);

      if (orgWithOrders.rows.length > 0) {
        const orgId = orgWithOrders.rows[0].organizationId;
        console.log(`🔧 Creating membership to organization ${orgId}...`);
        
        await pool.query(`
          INSERT INTO "Membership" (id, "userId", "organizationId", role, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, 'OWNER', NOW(), NOW())
        `, [PRODUCTION_USER_ID, orgId]);
        
        console.log("✅ Membership created for production userId");
      }
    } else {
      console.log("✅ Production userId has membership:");
      membership.rows.forEach((m: any) => {
        console.log(`   - Organization: ${m.organizationId}, Role: ${m.role}`);
      });
    }

    // Check orders for this user
    console.log("\n🔧 Step 3: Checking orders for production userId...");
    const orders = await pool.query(`
      SELECT id, "orderNumber", "organizationId", status
      FROM "Order"
      WHERE "userId" = $1
    `, [PRODUCTION_USER_ID]);

    console.log(`📊 Orders for production userId: ${orders.rows.length}`);
    orders.rows.forEach((order: any) => {
      console.log(`   - ${order.orderNumber}: Org ${order.organizationId}, Status ${order.status}`);
    });

    // Check all orders in database
    console.log("\n🔧 Step 4: Checking all orders in database...");
    const allOrders = await pool.query(`
      SELECT id, "orderNumber", "organizationId", "userId", status
      FROM "Order"
    `);

    console.log(`📊 Total orders in database: ${allOrders.rows.length}`);
    allOrders.rows.forEach((order: any) => {
      console.log(`   - ${order.orderNumber}: Org ${order.organizationId}, User ${order.userId}, Status ${order.status}`);
    });

    // Check if production userId is the owner of any organization
    console.log("\n🔧 Step 5: Checking if production userId owns any organization...");
    const ownedOrg = await pool.query(`
      SELECT id, name, slug
      FROM "Organization"
      WHERE "ownerId" = $1
    `, [PRODUCTION_USER_ID]);

    if (ownedOrg.rows.length === 0) {
      console.log("⚠️  Production userId does NOT own any organization");
      console.log("🔧 Setting them as owner of the organization with orders...");
      
      const orgWithOrders = await pool.query(`
        SELECT DISTINCT "organizationId"
        FROM "Order"
        LIMIT 1
      `);

      if (orgWithOrders.rows.length > 0) {
        const orgId = orgWithOrders.rows[0].organizationId;
        await pool.query(`
          UPDATE "Organization"
          SET "ownerId" = $1, "updatedAt" = NOW()
          WHERE id = $2
        `, [PRODUCTION_USER_ID, orgId]);
        
        console.log("✅ Production userId set as organization owner");
      }
    } else {
      console.log("✅ Production userId owns organization:");
      ownedOrg.rows.forEach((org: any) => {
        console.log(`   - ${org.name} (${org.slug}): ${org.id}`);
      });
    }

    console.log("\n🎉 Fix completed!");
    console.log("📋 Please refresh the page and check if orders appear");

  } catch (err: any) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
