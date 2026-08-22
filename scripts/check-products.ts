import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MISSING_PRODUCT_IDS = [
  '966f91bf-e1fe-4ee4-ac8e-74a88a84cc98',
  'cc613a91-47f8-44eb-b04f-c041c56210bb',
  '15c8e27a-eb14-4803-81f1-4425821db920',
  'ade590a1-855d-4936-8f3f-4673efd3e933',
];

async function main() {
  console.log('=== Checking Product Status ===\n');

  // Check product existence and status
  const products = await prisma.product.findMany({
    where: {
      id: { in: MISSING_PRODUCT_IDS },
    },
    select: {
      id: true,
      name: true,
      organizationId: true,
      published: true,
      sku: true,
    },
  });

  console.log('Products found in database:');
  console.log(JSON.stringify(products, null, 2));

  const foundIds = products.map(p => p.id);
  const missingIds = MISSING_PRODUCT_IDS.filter(id => !foundIds.includes(id));

  console.log('\n=== Summary ===');
  console.log('Total requested:', MISSING_PRODUCT_IDS.length);
  console.log('Found in database:', foundIds.length);
  console.log('Missing from database:', missingIds.length);
  
  if (missingIds.length > 0) {
    console.log('\nMissing product IDs:', missingIds);
  }

  console.log('\n=== Published Status ===');
  const unpublished = products.filter(p => !p.published);
  console.log('Published:', products.filter(p => p.published).length);
  console.log('Unpublished:', unpublished.length);
  if (unpublished.length > 0) {
    console.log('Unpublished products:', unpublished.map(p => ({ id: p.id, name: p.name })));
  }

  console.log('\n=== Organization IDs ===');
  const orgIds = [...new Set(products.map(p => p.organizationId))];
  console.log('Unique organization IDs:', orgIds);

  // Check CartItem records
  console.log('\n=== Checking CartItem Records ===');
  const cartItems = await prisma.cartItem.findMany({
    where: {
      productId: { in: MISSING_PRODUCT_IDS },
    },
    select: {
      id: true,
      userId: true,
      productId: true,
      variantId: true,
      quantity: true,
      createdAt: true,
    },
  });

  console.log('Cart items found:', cartItems.length);
  if (cartItems.length > 0) {
    console.log('Cart item details:');
    console.log(JSON.stringify(cartItems, null, 2));
  }

  // Group cart items by productId
  const cartItemsByProduct = cartItems.reduce((acc, item) => {
    if (!acc[item.productId]) {
      acc[item.productId] = [];
    }
    acc[item.productId].push(item);
    return acc;
  }, {} as Record<string, typeof cartItems>);

  console.log('\n=== Cart Items by Product ===');
  for (const productId of MISSING_PRODUCT_IDS) {
    const items = cartItemsByProduct[productId] || [];
    const productExists = foundIds.includes(productId);
    const product = products.find(p => p.id === productId);
    const isPublished = product?.published ?? false;
    
    console.log(`\nProduct ID: ${productId}`);
    console.log(`  Exists in DB: ${productExists}`);
    console.log(`  Published: ${isPublished}`);
    console.log(`  Cart items: ${items.length}`);
    if (items.length > 0) {
      console.log(`  Should cleanup: ${!productExists || !isPublished}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
