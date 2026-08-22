import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function cleanupAndApplySchema() {
  console.log("Starting cleanup and schema application...");

  try {
    // Read the SQL cleanup script
    const sqlPath = path.join(__dirname, 'cleanup-old-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log("Executing cleanup SQL...");
    
    // Execute each DROP TABLE command separately
    const dropStatements = sql.split(';').filter(s => s.trim());
    for (const statement of dropStatements) {
      if (statement.trim()) {
        await prisma.$executeRawUnsafe(statement);
      }
    }
    
    console.log("✓ Old schema tables cleaned up");

    // Now apply the new schema
    console.log("Applying new Prisma schema...");
    
    // Use Prisma's db push to apply the new schema
    const { execSync } = await import('child_process');
    
    try {
      execSync('npx prisma db push', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
      console.log("✓ New schema applied successfully");
    } catch (error) {
      console.error("Error applying schema:", error);
      throw error;
    }

    console.log("\n✓ Cleanup and schema application completed!");
    console.log("\nNext steps:");
    console.log("1. Run: npx ts-node scripts/init-homepage-cms.ts");
    console.log("2. Access the Homepage Builder in the admin dashboard");

  } catch (error) {
    console.error("Cleanup failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAndApplySchema()
  .then(() => {
    console.log("Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
