// scripts/check-session-organization.ts
// Check and fix session organizationId mismatch
import dotenv from "dotenv";
import "dotenv/config";
import { Pool } from "pg";

dotenv.config({ path: ".env.production" });

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.production");
  process.exit(1);
}

console.log("🔍 Checking session organizationId issue...\n");
console.log("📋 DATABASE_URL:", DATABASE_URL.substring(0, 50) + "...");

const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  try {
    // Get admin user
    console.log("🔧 Step 1: Getting admin user...");
    const adminUser = await pool.query(`
      SELECT id, email, role
      FROM "User"
      WHERE email = 'admin@nexmart.com'
    `);

    if (adminUser.rows.length === 0) {
      console.log("❌ Admin user not found!");
      return;
    }

    const adminId = adminUser.rows[0].id;
    console.log(`✅ Admin user: ${adminUser.rows[0].email} (${adminId})`);

    // Get organization
    console.log("\n🔧 Step 2: Getting organization...");
    const organization = await pool.query(`
      SELECT id, name, slug, "ownerId"
      FROM "Organization"
      WHERE slug = 'nexmart'
    `);

    if (organization.rows.length === 0) {
      console.log("❌ Organization not found!");
      return;
    }

    const orgId = organization.rows[0].id;
    console.log(`✅ Organization: ${organization.rows[0].name} (${orgId})`);

    // Check membership
    console.log("\n🔧 Step 3: Checking membership...");
    const membership = await pool.query(`
      SELECT * FROM "Membership"
      WHERE "userId" = $1 AND "organizationId" = $2
    `, [adminId, orgId]);

    if (membership.rows.length === 0) {
      console.log("⚠️  No membership found. Creating membership...");
      await pool.query(`
        INSERT INTO "Membership" (id, "userId", "organizationId", role, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, 'OWNER', NOW(), NOW())
      `, [adminId, orgId]);
      console.log("✅ Membership created");
    } else {
      console.log("✅ Membership exists");
      console.log(`   Role: ${membership.rows[0].role}`);
    }

    // Check if organization owner is admin
    console.log("\n🔧 Step 4: Checking organization owner...");
    if (organization.rows[0].ownerId !== adminId) {
      console.log("⚠️  Organization owner is not admin. Updating...");
      await pool.query(`
        UPDATE "Organization"
        SET "ownerId" = $1, "updatedAt" = NOW()
        WHERE id = $2
      `, [adminId, orgId]);
      console.log("✅ Organization owner updated to admin");
    } else {
      console.log("✅ Organization owner is admin");
    }

    // Check orders
    console.log("\n🔧 Step 5: Checking orders...");
    const orders = await pool.query(`
      SELECT id, "orderNumber", "organizationId", "userId", status
      FROM "Order"
      ORDER BY "createdAt" DESC
    `);
    
    console.log(`📊 Total orders: ${orders.rows.length}`);
    orders.rows.forEach((order: any) => {
      console.log(`   - ${order.orderNumber}: Org ${order.organizationId}, User ${order.userId}`);
    });

    // CRITICAL: Check if there's a default organization issue
    console.log("\n🔧 Step 6: CRITICAL - Checking for default organization issue...");
    
    // Check if there's a DEFAULT_ORGANIZATION_SLUG env var
    const defaultOrgSlug = process.env.DEFAULT_ORGANIZATION_SLUG;
    console.log(`📊 DEFAULT_ORGANIZATION_SLUG: ${defaultOrgSlug || 'Not set'}`);

    if (defaultOrgSlug && defaultOrgSlug !== 'nexmart') {
      console.log("⚠️  DEFAULT_ORGANIZATION_SLUG is set to:", defaultOrgSlug);
      console.log("⚠️  This might cause session to use wrong organization");
      console.log("🔧 You need to update DEFAULT_ORGANIZATION_SLUG in Vercel to 'nexmart'");
    }

    // Check if there are multiple organizations
    const allOrgs = await pool.query(`
      SELECT id, name, slug
      FROM "Organization"
    `);
    
    console.log(`📊 All organizations in database: ${allOrgs.rows.length}`);
    allOrgs.rows.forEach((org: any) => {
      console.log(`   - ${org.name} (${org.slug}): ${org.id}`);
    });

    if (allOrgs.rows.length > 1) {
      console.log("⚠️  Multiple organizations exist!");
      console.log("⚠️  Session might be using wrong organization");
    }

    console.log("\n🎉 Analysis complete!");
    console.log("📋 If you're logged in but still see 'No orders found':");
    console.log("   1. Check browser console for errors");
    console.log("   2. Check Network tab for API response");
    console.log("   3. The session might be using wrong organizationId");
    console.log("   4. Try logging out and logging back in");

  } catch (err: any) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
