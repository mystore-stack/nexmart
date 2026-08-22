// Database debugging script to check product data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugProducts() {
  console.log('========== PRODUCT DATABASE DEBUG ==========');
  
  try {
    // Get all products
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        published: true,
        organizationId: true,
        categoryId: true,
        stock: true,
      },
      take: 20,
    });
    
    console.log('\n=== ALL PRODUCTS IN DATABASE ===');
    console.log(`Total products found: ${allProducts.length}`);
    
    allProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Published: ${product.published}`);
      console.log(`   Organization ID: ${product.organizationId}`);
      console.log(`   Category ID: ${product.categoryId}`);
      console.log(`   Stock: ${product.stock}`);
    });
    
    // Check for published products
    const publishedProducts = allProducts.filter(p => p.published);
    console.log(`\n=== PUBLISHED PRODUCTS ===`);
    console.log(`Total published: ${publishedProducts.length}`);
    
    // Get organizations
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        ownerId: true,
      },
    });
    
    console.log('\n=== ORGANIZATIONS ===');
    organizations.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name}`);
      console.log(`   ID: ${org.id}`);
      console.log(`   Slug: ${org.slug}`);
      console.log(`   Owner ID: ${org.ownerId}`);
    });
    
    // Check default organization
    console.log('\n=== PRODUCT DISTRIBUTION BY ORGANIZATION ===');
    const orgCounts = {};
    allProducts.forEach(p => {
      orgCounts[p.organizationId] = (orgCounts[p.organizationId] || 0) + 1;
    });
    
    Object.entries(orgCounts).forEach(([orgId, count]) => {
      const org = organizations.find(o => o.id === orgId);
      console.log(`${org?.name || orgId}: ${count} products`);
    });
    
    // Test specific slugs if any
    console.log('\n=== TESTING SPECIFIC SLUGS ===');
    const testSlugs = ['test-product', 'sample-product', 'demo-product'];
    for (const slug of testSlugs) {
      const product = await prisma.product.findFirst({
        where: { slug },
        select: { id: true, slug: true, published: true, organizationId: true }
      });
      console.log(`Slug "${slug}": ${product ? 'FOUND' : 'NOT FOUND'}`);
      if (product) {
        console.log(`  - Published: ${product.published}`);
        console.log(`  - Organization: ${product.organizationId}`);
      }
    }
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProducts();
