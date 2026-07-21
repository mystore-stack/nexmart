// Test admin products API response
const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  try {
    console.log('=== TESTING ADMIN PRODUCTS API RESPONSE ===');
    
    const productsRes = await fetch(`${BASE_URL}/api/admin/products?page=1&limit=20`);
    
    console.log('Products API status:', productsRes.status);
    console.log('Products API headers:', Object.fromEntries(productsRes.headers.entries()));
    
    const productsText = await productsRes.text();
    console.log('Products response length:', productsText.length);
    console.log('Products response (first 1000 chars):', productsText.substring(0, 1000));
    
    try {
      const productsData = JSON.parse(productsText);
      console.log('Products data keys:', Object.keys(productsData));
      console.log('Products data success:', productsData.success);
      console.log('Products data type:', typeof productsData.data);
      console.log('Products data is array:', Array.isArray(productsData.data));
      console.log('Products data length:', productsData.data?.length);
      console.log('Products pagination:', productsData.pagination);
    } catch (e) {
      console.log('Failed to parse JSON:', e.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
