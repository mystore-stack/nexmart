// scripts/fix-production-user.ts
// Create the production user and give them access to organization with orders
import dotenv from "dotenv";
import "dotenv/config";
import { Pool } from "pg";

dotenv.config({ path: ".env.production" });

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.production");
  process.exit(1);
}

console.log("🔧 Fixing production user in database...\n");
console.log("📋 DATABASE_URL:", DATABASE_URL.substring(0, 50) + "...");

const PRODUCTION_USER_ID = "0baf9f5d-38ab-43a0-a601-a669ef94b7a8";
const PRODUCTION_USER_EMAIL = "admin@nexmart.com";

const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  try {
    // Check if user exists
    console.log("🔧 Step 1: Checking if user exists...");
    const existingUser = await pool.query(`
      SELECT id, email
      FROM "User"
      WHERE id = $1 OR email = $2
    `, [PRODUCTION_USER_ID, PRODUCTION_USER_EMAIL]);

    if (existingUser.rows.length > 0) {
      console.log("⚠️  User already exists in database:");
      console.log(`   - ID: ${existingUser.rows[0].id}`);
      console.log(`   - Email: ${existingUser.rows[0].email}`);
      
      // If the email matches but ID doesn't, we need to update the ID
      if (existingUser.rows[0].email === PRODUCTION_USER_EMAIL && existingUser.rows[0].id !== PRODUCTION_USER_ID) {
        console.log("⚠️  Email matches but ID differs. This is a critical issue.");
        console.log("🔧 The session is using a different ID than the database user.");
        console.log("🔧 This might be a session corruption or database sync issue.");
        console.log("📋 Please log out and log back in to refresh the session.");
        return;
      }
    }

    // Create the user if it doesn't exist
    if (existingUser.rows.length === 0) {
      console.log("🔧 Creating production user in database...");
      
      // Use a placeholder password - user will need to reset it
      const placeholderPassword = "temp_password_change_me";
      
      await pool.query(`
        INSERT INTO "User" (id, email, name, password, role, "emailVerified", "createdAt", "updatedAt")
        VALUES ($1, $2, 'Admin', $3, 'ADMIN', true, NOW(), NOW())
      `, [PRODUCTION_USER_ID, PRODUCTION_USER_EMAIL, placeholderPassword]);
      
      console.log("✅ Production user created with temporary password");
      console.log("⚠️  User will need to reset password");
    }

    // Get organization with orders
    console.log("\n🔧 Step 2: Getting organization with orders...");
    const orgWithOrders = await pool.query(`
      SELECT DISTINCT "organizationId"
      FROM "Order"
      LIMIT 1
    `);

    if (orgWithOrders.rows.length === 0) {
      console.log("⚠️  No orders found in database");
      return;
    }

    const orgId = orgWithOrders.rows[0].organizationId;
    console.log(`✅ Organization with orders: ${orgId}`);

    // Check membership
    console.log("\n🔧 Step 3: Checking membership...");
    const membership = await pool.query(`
      SELECT * FROM "Membership"
      WHERE "userId" = $1 AND "organizationId" = $2
    `, [PRODUCTION_USER_ID, orgId]);

    if (membership.rows.length === 0) {
      console.log("🔧 Creating membership...");
      await pool.query(`
        INSERT INTO "Membership" (id, "userId", "organizationId", role, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, 'OWNER', NOW(), NOW())
      `, [PRODUCTION_USER_ID, orgId]);
      console.log("✅ Membership created");
    } else {
      console.log("✅ Membership already exists");
    }

    // Set as organization owner
    console.log("\n🔧 Step 4: Setting as organization owner...");
    await pool.query(`
      UPDATE "Organization"
      SET "ownerId" = $1, "updatedAt" = NOW()
      WHERE id = $2
    `, [PRODUCTION_USER_ID, orgId]);
    console.log("✅ Organization owner updated");

    // Verify
    console.log("\n🔧 Step 5: Verifying fix...");
    const verifyUser = await pool.query(`
      SELECT id, email, role FROM "User" WHERE id = $1
    `, [PRODUCTION_USER_ID]);
    
    const verifyMembership = await pool.query(`
      SELECT * FROM "Membership" WHERE "userId" = $1
    `, [PRODUCTION_USER_ID]);
    
    const verifyOrders = await pool.query(`
      SELECT COUNT(*) as count FROM "Order"
    `);

    console.log("✅ Verification:");
    console.log(`   - User exists: ${verifyUser.rows.length > 0}`);
    console.log(`   - User email: ${verifyUser.rows[0]?.email}`);
    console.log(`   - Memberships: ${verifyMembership.rows.length}`);
    console.log(`   - Total orders in database: ${verifyOrders.rows[0].count}`);

    console.log("\n🎉 Fix completed!");
    console.log("📋 Next steps:");
    console.log("   1. Log out from the production site");
    console.log("   2. Log back in to refresh the session");
    console.log("   3. Go to /admin/orders");
    console.log("   4. You should now see the orders");

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    console.error("📋 Error details:", err);
  } finally {
    await pool.end();
  }
}

main();
