// scripts/check-user-organization.ts
// Check user organization mapping in production
import dotenv from "dotenv";
import "dotenv/config";
import { Pool } from "pg";

dotenv.config({ path: ".env.production" });

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.production");
  process.exit(1);
}

console.log("🔍 Checking user-organization mapping in production...\n");
console.log("📋 DATABASE_URL:", DATABASE_URL.substring(0, 50) + "...");

const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  try {
    // Check all users and their organizations
    console.log("🔧 Step 1: Checking users and their organization memberships...");
    const userOrgs = await pool.query(`
      SELECT u.id, u.email, u.role, 
             o.id as "orgId", o.name as "orgName", o.slug,
             m.role as membershipRole
      FROM "User" u
      LEFT JOIN "Membership" m ON u.id = m."userId"
      LEFT JOIN "Organization" o ON m."organizationId" = o.id
      ORDER BY u.email
    `);
    console.log(`📊 User-Organization mappings:`);
    userOrgs.rows.forEach((row: any) => {
      console.log(`   - ${row.email} (${row.role}):`);
      console.log(`     Org: ${row.orgName || 'None'} (${row.orgId || 'None'})`);
      console.log(`     Role: ${row.membershipRole || 'None'}`);
    });

    // Check orders with their organization
    console.log("\n🔧 Step 2: Checking orders and their organizations...");
    const orderOrgs = await pool.query(`
      SELECT o.id, o."orderNumber", o."organizationId", o."userId",
             org.name as "orgName", u.email as "userEmail"
      FROM "Order" o
      LEFT JOIN "Organization" org ON o."organizationId" = org.id
      LEFT JOIN "User" u ON o."userId" = u.id
      ORDER BY o."createdAt" DESC
    `);
    console.log(`📊 Order-Organization mappings:`);
    orderOrgs.rows.forEach((row: any) => {
      console.log(`   - ${row.orderNumber}:`);
      console.log(`     Org: ${row.orgName} (${row.organizationId})`);
      console.log(`     User: ${row.userEmail} (${row.userId})`);
    });

    // Check if admin user has membership in the organization that has orders
    console.log("\n🔧 Step 3: Checking if admin user can access orders...");
    const adminUser = await pool.query(`
      SELECT u.id, u.email, u.role
      FROM "User" u
      WHERE u.email = 'admin@nexmart.com'
    `);
    
    if (adminUser.rows.length > 0) {
      const adminId = adminUser.rows[0].id;
      console.log(`📊 Admin user found: ${adminUser.rows[0].email} (${adminId})`);
      
      const adminOrgs = await pool.query(`
        SELECT m."organizationId", o.name, o.slug
        FROM "Membership" m
        JOIN "Organization" o ON m."organizationId" = o.id
        WHERE m."userId" = $1
      `, [adminId]);
      
      console.log(`📊 Admin user's organizations:`);
      adminOrgs.rows.forEach((row: any) => {
        console.log(`   - ${row.name} (${row.slug}): ${row.organizationId}`);
      });

      // Check if admin's organization matches the orders' organization
      const orderOrg = await pool.query(`
        SELECT DISTINCT "organizationId"
        FROM "Order"
      `);
      
      console.log(`📊 Organizations that have orders:`);
      orderOrg.rows.forEach((row: any) => {
        console.log(`   - ${row.organizationId}`);
      });

      // Check if admin has access to these organizations
      console.log(`\n🔧 Step 4: Checking access permissions...`);
      for (const orderOrgRow of orderOrg.rows) {
        const hasAccess = adminOrgs.rows.some((adminOrgRow: any) => 
          adminOrgRow.organizationId === orderOrgRow.organizationId
        );
        console.log(`   - Org ${orderOrgRow.organizationId}: ${hasAccess ? '✅ HAS ACCESS' : '❌ NO ACCESS'}`);
      }
    }

  } catch (err: any) {
    console.error("❌ Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
