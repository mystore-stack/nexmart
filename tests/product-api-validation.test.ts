// tests/product-api-validation.test.ts
// Validation script for product API contract
// Ensures mobile app receives correct format

interface ProductContract {
  id: string;
  title: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  images: string[];
  image: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  categoryId: string;
  category: { id: string; name: string };
  brand: string | null;
  tags: string[];
  discount?: number;
  currency?: string;
  emoji?: string;
}

async function validateProductAPI() {
  const BASE_URL = 'http://localhost:3000';

  // Test 1: Fetch 20 products
  console.log('=== TEST 1: Fetching 20 products ===');
  const response = await fetch(`${BASE_URL}/api/products?limit=20`);
  const data = await response.json();

  if (!data.success || !data.items) {
    console.error('❌ Invalid response structure');
    return;
  }

  const products = data.items;
  console.log(`✓ Fetched ${products.length} products`);

  // Test 2: Validate each product
  console.log('\n=== TEST 2: Validating product contract ===');
  const errors: string[] = [];
  const warnings: string[] = [];
  const emptyNameProducts: string[] = [];

  products.forEach((p: ProductContract, idx: number) => {
    const prefix = `Product ${idx + 1} (${p.id.slice(0, 8)}...)`;

    // Check required fields
    if (typeof p.id !== 'string' || !p.id) errors.push(`${prefix}: missing or invalid id`);
    if (typeof p.title !== 'string' || p.title.length === 0) {
      errors.push(`${prefix}: missing or empty title`);
      emptyNameProducts.push(p.id);
    }
    if (typeof p.name !== 'string' || p.name.length === 0) errors.push(`${prefix}: missing or empty name`);
    if (typeof p.price !== 'number' || p.price < 0) errors.push(`${prefix}: invalid price`);
    if (!Array.isArray(p.images) || p.images.length === 0) errors.push(`${prefix}: missing or empty images`);
    if (typeof p.image !== 'string' || p.image.length === 0) errors.push(`${prefix}: missing or empty image`);
    if (typeof p.rating !== 'number') errors.push(`${prefix}: invalid rating type`);
    if (typeof p.reviewsCount !== 'number') errors.push(`${prefix}: invalid reviewsCount type`);
    if (typeof p.stock !== 'number') errors.push(`${prefix}: invalid stock type`);
    if (typeof p.categoryId !== 'string') errors.push(`${prefix}: invalid categoryId`);
    if (!p.category || typeof p.category.name !== 'string') errors.push(`${prefix}: invalid category.name`);
    if (!Array.isArray(p.tags)) errors.push(`${prefix}: invalid tags`);

    // Check https URLs
    if (p.images.some((img: string) => !img.startsWith('https://'))) {
      warnings.push(`${prefix}: some images don't use https`);
    }
    if (p.image && !p.image.startsWith('https://')) {
      warnings.push(`${prefix}: main image doesn't use https`);
    }

    // Check consistency
    if (p.title !== p.name) {
      warnings.push(`${prefix}: title and name differ`);
    }
    if (p.image !== p.images[0]) {
      warnings.push(`${prefix}: image is not images[0]`);
    }
  });

  // Test 3: Check for undefined keys
  console.log('\n=== TEST 3: Checking for undefined keys ===');
  const sampleProduct = products[0];
  const expectedKeys = [
    'id', 'title', 'name', 'description', 'price', 'oldPrice',
    'images', 'image', 'rating', 'reviewsCount', 'stock',
    'categoryId', 'category', 'brand', 'tags', 'discount', 'currency', 'emoji'
  ];

  expectedKeys.forEach(key => {
    if (!(key in sampleProduct)) {
      errors.push(`Missing key: ${key}`);
    }
  });

  // Report results
  console.log('\n=== RESULTS ===');
  console.log(`Total products: ${products.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (emptyNameProducts.length > 0) {
    console.log('\n📝 PRODUCTS WITH EMPTY NAMES (to fix in admin):');
    emptyNameProducts.forEach(id => console.log(`  - ${id}`));
  }

  if (errors.length === 0) {
    console.log('\n✅ All validation checks passed!');
  } else {
    console.log('\n❌ Validation failed');
  }

  // Test 4: Verify product detail endpoint
  console.log('\n=== TEST 4: Verifying product detail endpoint ===');
  const firstProductId = products[0].id;
  const detailResponse = await fetch(`${BASE_URL}/api/products/${firstProductId}`);
  const detailData = await detailResponse.json();

  if (detailData.success && detailData.data) {
    console.log(`✓ Product detail endpoint works for ${firstProductId.slice(0, 8)}...`);
    console.log(`  - Has title: ${!!detailData.data.title}`);
    console.log(`  - Has name: ${!!detailData.data.name}`);
    console.log(`  - Has image: ${!!detailData.data.image}`);
    console.log(`  - Rating: ${detailData.data.rating}`);
    console.log(`  - Reviews: ${detailData.data.reviewsCount}`);
  } else {
    console.error('❌ Product detail endpoint failed');
  }

  // Test 5: Categories endpoint
  console.log('\n=== TEST 5: Verifying categories endpoint ===');
  const catResponse = await fetch(`${BASE_URL}/api/categories`);
  const catData = await catResponse.json();

  if (catData.success && Array.isArray(catData.data)) {
    console.log(`✓ Categories endpoint works`);
    console.log(`  - Total categories: ${catData.data.length}`);
    const firstCat = catData.data[0];
    console.log(`  - First category has name: ${typeof firstCat.name === 'string'}`);
    console.log(`  - First category name: ${firstCat.name}`);
  } else {
    console.error('❌ Categories endpoint failed');
  }
}

// Run validation
validateProductAPI().catch(console.error);
