// scripts/test-production-orders-api.ts
// Test actual production API endpoints
import dotenv from "dotenv";
import "dotenv/config";

dotenv.config({ path: ".env.production" });

const PRODUCTION_URL = "https://nexmart-ashy.vercel.app";

async function main() {
  console.log("🔍 Testing production API endpoints...\n");

  try {
    // Test 1: GET /api/admin/orders (without auth - should get 401)
    console.log("🔧 Test 1: GET /api/admin/orders (no auth)");
    const response1 = await fetch(`${PRODUCTION_URL}/api/admin/orders`);
    console.log(`Status: ${response1.status}`);
    console.log(`Status Text: ${response1.statusText}`);
    const text1 = await response1.text();
    console.log(`Response: ${text1.substring(0, 200)}...`);

    // Test 2: GET /api/orders (without auth - should get 401)
    console.log("\n🔧 Test 2: GET /api/orders (no auth)");
    const response2 = await fetch(`${PRODUCTION_URL}/api/orders`);
    console.log(`Status: ${response2.status}`);
    console.log(`Status Text: ${response2.statusText}`);
    const text2 = await response2.text();
    console.log(`Response: ${text2.substring(0, 200)}...`);

    // Test 3: GET /api/admin/products (without auth - should get 401)
    console.log("\n🔧 Test 3: GET /api/admin/products (no auth)");
    const response3 = await fetch(`${PRODUCTION_URL}/api/admin/products`);
    console.log(`Status: ${response3.status}`);
    console.log(`Status Text: ${response3.statusText}`);
    const text3 = await response3.text();
    console.log(`Response: ${text3.substring(0, 200)}...`);

    console.log("\n🎉 Production API tests completed");

  } catch (err: any) {
    console.error("❌ Test failed:", err.message);
  }
}

main();
