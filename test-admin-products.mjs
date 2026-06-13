import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAdminProducts() {
  console.log('=== TEST ADMIN PRODUCTS ===');
  
  // Test 1: Get admin user organizationId
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, role: true }
  });
  console.log('Admin user:', adminUser);

  // Test 2: Get membership
  const membership = await prisma.membership.findFirst({
    where: { userId: adminUser?.id },
    select: { id: true, organizationId: true, role: true }
  });
  console.log('Membership:', membership);

  // Test 3: Get products with this organizationId
  const products = await prisma.product.findMany({
    where: { organizationId: membership?.organizationId },
    select: { id: true, name: true, organizationId: true, published: true },
    take: 10
  });
  console.log('Products found:', products.length);
  console.log('Products:', JSON.stringify(products, null, 2));

  // Test 4: Get all products (without filter)
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, organizationId: true, published: true },
    take: 10
  });
  console.log('All products (no filter):', allProducts.length);
  console.log('All products:', JSON.stringify(allProducts, null, 2));

  await prisma.$disconnect();
}

testAdminProducts().catch(console.error);
