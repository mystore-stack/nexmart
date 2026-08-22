// scripts/test-orders-api.ts
// Test /api/orders endpoint
import dotenv from "dotenv";
import "dotenv/config";

dotenv.config({ path: ".env.production" });

async function main() {
  console.log("🔍 Testing /api/orders endpoint...\n");

  const PRODUCTION_URL = "https://nexmart-ashy.vercel.app";

  try {
    // Test 1: GET /api/orders (no auth)
    console.log("🔧 Test 1: GET /api/orders (no auth)");
    const response1 = await fetch(`${PRODUCTION_URL}/api/orders?limit=20`);
    console.log(`Status: ${response1.status}`);
    console.log(`Status Text: ${response1.statusText}`);
    const text1 = await response1.text();
    console.log(`Response: ${text1.substring(0, 500)}...`);

    // Test 2: GET /api/admin/orders (no auth)
    console.log("\n🔧 Test 2: GET /api/admin/orders (no auth)");
    const response2 = await fetch(`${PRODUCTION_URL}/api/admin/orders`);
    console.log(`Status: ${response2.status}`);
    console.log(`Status Text: ${response2.statusText}`);
    const text2 = await response2.text();
    console.log(`Response: ${text2.substring(0, 500)}...`);

  } catch (err: any) {
    console.error("❌ Error:", err.message);
  }
}

main();
