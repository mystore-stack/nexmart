// scripts/test-production-api.ts
// Test the actual production API to see if the error still occurs

const PRODUCTION_URL = 'https://nexmart-ashy.vercel.app';

async function testAPI() {
  console.log(`🔍 Testing production API: ${PRODUCTION_URL}\n`);

  try {
    // Test the admin orders endpoint
    console.log("🔧 Testing /api/admin/orders...");
    const response = await fetch(`${PRODUCTION_URL}/api/admin/orders`);
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);
    
    const text = await response.text();
    console.log(`📊 Response (first 500 chars):`);
    console.log(text.substring(0, 500));
    
    if (text.includes('UNPAID') || text.includes('PaymentStatus')) {
      console.log(`⚠️  Response contains PaymentStatus/UNPAID references`);
    }
    
  } catch (err: any) {
    console.error(`❌ Error: ${err.message}`);
  }
}

testAPI();
