// Test product URLs to check for 404 errors
const http = require('http');
const https = require('https');

const baseUrl = 'http://localhost:3000';
const testSlugs = [
  'instant-pot-duo-7-in-1',
  'kindle-paperwhite-11',
  'patagonia-down-sweater',
  'oura-ring-gen3',
  'levis-501-original',
  'adidas-ultraboost-22',
  'samsung-65-qled-4k',
  'vitamix-a3500',
  'sony-wh-1000xm5',
  'nike-air-max-270',
];

function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          success: res.statusCode === 200,
          error: res.statusCode !== 200 ? `HTTP ${res.statusCode}` : null
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 0,
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 0,
        success: false,
        error: 'Timeout'
      });
    });
  });
}

async function testProductUrls() {
  console.log('========== PRODUCT URL TESTING ==========');
  console.log(`Testing ${testSlugs.length} product URLs...\n`);
  
  const results = [];
  
  for (const slug of testSlugs) {
    const url = `${baseUrl}/products/${slug}`;
    console.log(`Testing: ${url}`);
    const result = await testUrl(url);
    results.push(result);
    console.log(`  Status: ${result.status} - ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (!result.success) {
      console.log(`  Error: ${result.error}`);
    }
    console.log('');
  }
  
  console.log('========== SUMMARY ==========');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`Total tested: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\nFailed URLs:');
    failed.forEach(f => {
      console.log(`  - ${f.url} (${f.error})`);
    });
  }
}

testProductUrls().catch(console.error);
