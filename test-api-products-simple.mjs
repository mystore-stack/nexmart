// Test admin products API without login
const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  try {
    console.log('=== TESTING ADMIN PRODUCTS API (NO LOGIN) ===');
    
    const productsRes = await fetch(`${BASE_URL}/api/admin/products?page=1&limit=20`);
    
    console.log('Products API status:', productsRes.status);
    const productsText = await productsRes.text();
    console.log('Products response (first 500 chars):', productsText.substring(0, 500));
    
    try {
      const productsData = JSON.parse(productsText);
      console.log('Products data:', JSON.stringify(productsData, null, 2));
    } catch (e) {
      console.log('Failed to parse JSON');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
