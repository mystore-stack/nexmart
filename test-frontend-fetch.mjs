// Test frontend fetch with cookies
const BASE_URL = 'http://localhost:3000';

async function testFetch() {
  try {
    console.log('=== TESTING FRONTEND FETCH ===');
    
    // Try to get session first
    const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
      credentials: 'include',
    });
    
    console.log('Session status:', sessionRes.status);
    const sessionText = await sessionRes.text();
    console.log('Session response (first 500 chars):', sessionText.substring(0, 500));
    
    // Now try to get products
    const productsRes = await fetch(`${BASE_URL}/api/admin/products?page=1&limit=20`, {
      credentials: 'include',
    });
    
    console.log('Products status:', productsRes.status);
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

testFetch();
