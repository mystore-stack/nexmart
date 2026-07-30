// Test admin products API
const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  try {
    console.log('=== TESTING ADMIN PRODUCTS API ===');
    
    // First, get session
    const loginRes = await fetch(`${BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nexmart.com',
        password: 'admin123'
      }),
      credentials: 'include'
    });
    
    console.log('Login status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Login response:', loginData);

    // Now try to get products
    const productsRes = await fetch(`${BASE_URL}/api/admin/products?page=1&limit=20`, {
      credentials: 'include'
    });
    
    console.log('Products API status:', productsRes.status);
    const productsText = await productsRes.text();
    console.log('Products response text:', productsText);
    
    try {
      const productsData = JSON.parse(productsText);
      console.log('Products data:', JSON.stringify(productsData, null, 2));
    } catch (e) {
      console.log('Failed to parse JSON:', e.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
