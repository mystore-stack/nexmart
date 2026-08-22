// scripts/check-current-user-state.ts
// Check current state of users in database
import dotenv from "dotenv";
import "dotenv/config";
import { Pool } from "pg";

dotenv.config({ path: ".env.production" });

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.production");
  process.exit(1);
}

console.log("🔍 Checking current user state in database...\n");

const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  try {
    // Check all users
    console.log("🔧 Step 1: Checking all users in database...");
    const allUsers = await pool.query(`
      SELECT id, email, name, role
      FROM "User"
    `);

    console.log(`📊 Total users: ${allUsers.rows.length}`);
    allUsers.rows.forEach((user: any) => {
      console.log(`   - ID: ${user.id}`);
      console.log(`     Email: ${user.email}`);
      console.log(`     Name: ${user.name}`);
      console.log(`     Role: ${user.role}`);
    });

    // Check for session userId
    const SESSION_USER_ID = "0baf9f5d-38ab-43a0-a601-a669ef94b7a8";
    console.log("\n🔧 Step 2: Checking for session userId...");
    const sessionUser = await pool.query(`
      SELECT id, email, name, role
      FROM "User"
      WHERE id = $1
    `, [SESSION_USER_ID]);

    if (sessionUser.rows.length > 0) {
      console.log("✅ Session userId exists in database:");
      console.log(`   - ID: ${sessionUser.rows[0].id}`);
      console.log(`   - Email: ${sessionUser.rows[0].email}`);
    } else {
      console.log("❌ Session userId does NOT exist in database");
    }

    // Check for old userId
    const OLD_USER_ID = "7d9a9118-6253-435a-a072-bb91b40fc517";
    console.log("\n🔧 Step 3: Checking for old userId...");
    const oldUser = await pool.query(`
      SELECT id, email, name, role
      FROM "User"
      WHERE id = $1
    `, [OLD_USER_ID]);

    if (oldUser.rows.length > 0) {
      console.log("✅ Old userId exists in database:");
      console.log(`   - ID: ${oldUser.rows[0].id}`);
      console.log(`   - Email: ${oldUser.rows[0].email}`);
    } else {
      console.log("❌ Old userId does NOT exist in database");
    }

    // Check orders
    console.log("\n🔧 Step 4: Checking orders...");
    const orders = await pool.query(`
      SELECT id, "orderNumber", "userId", "organizationId"
      FROM "Order"
    `);

    console.log(`📊 Total orders: ${orders.rows.length}`);
    orders.rows.forEach((order: any) => {
      console.log(`   - ${order.orderNumber}: User ${order.userId}, Org ${order.organizationId}`);
    });

    // Check membership
    console.log("\n🔧 Step 5: Checking memberships...");
    const memberships = await pool.query(`
      SELECT id, "userId", "organizationId", role
      FROM "Membership"
    `);

    console.log(`📊 Total memberships: ${memberships.rows.length}`);
    memberships.rows.forEach((m: any) => {
      console.log(`   - User ${m.userId}, Org ${m.organizationId}, Role ${m.role}`);
    });

    // Check organization owner
    console.log("\n🔧 Step 6: Checking organization owners...");
    const orgs = await pool.query(`
      SELECT id, name, slug, "ownerId"
      FROM "Organization"
    `);

    console.log(`📊 Total organizations: ${orgs.rows.length}`);
    orgs.rows.forEach((org: any) => {
      console.log(`   - ${org.name} (${org.slug}): Owner ${org.ownerId}`);
    });

  } catch (err: any) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
