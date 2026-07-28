import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addSampleData() {
  try {
    console.log("🌱 Adding sample data...");

    // Get organization
    const org = await prisma.organization.findFirst({
      where: { slug: "nexmart" },
    });

    if (!org) {
      console.error("❌ Organization not found");
      return;
    }

    console.log(`✅ Found organization: ${org.name}`);

    // Get existing products
    const existingProducts = await prisma.product.findMany({
      where: { organizationId: org.id },
      take: 5,
    });

    console.log(`✅ Found ${existingProducts.length} existing products`);

    if (existingProducts.length === 0) {
      console.log("⚠️ No products found, creating sample products...");
      
      // Get categories
      const categories = await prisma.category.findMany({
        where: { organizationId: org.id },
        take: 3,
      });

      // Create sample products
      const sampleProducts = [
        {
          id: crypto.randomUUID(),
          organizationId: org.id,
          name: "Wireless Bluetooth Headphones",
          slug: "wireless-bluetooth-headphones",
          description: "High-quality wireless headphones with noise cancellation",
          price: 299.99,
          comparePrice: 399.99,
          categoryId: categories[0]?.id,
          images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"],
          tags: ["electronics", "audio", "wireless"],
          sku: "WH-001",
          stock: 50,
          lowStockAt: 5,
          published: true,
          featured: true,
          rating: 4.5,
          reviewCount: 120,
          soldCount: 450,
        },
        {
          id: crypto.randomUUID(),
          organizationId: org.id,
          name: "Smart Watch Pro",
          slug: "smart-watch-pro",
          description: "Advanced smartwatch with health tracking",
          price: 199.99,
          comparePrice: 249.99,
          categoryId: categories[0]?.id,
          images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"],
          tags: ["electronics", "wearable", "smart"],
          sku: "SW-001",
          stock: 30,
          lowStockAt: 5,
          published: true,
          featured: true,
          rating: 4.3,
          reviewCount: 89,
          soldCount: 320,
        },
      ];

      for (const product of sampleProducts) {
        await prisma.product.create({ data: product });
        console.log(`✅ Created product: ${product.name}`);
      }

      const updatedProducts = await prisma.product.findMany({
        where: { organizationId: org.id },
        take: 5,
      });
      existingProducts.push(...updatedProducts);
    }

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: "admin@nexstore.com" },
    });

    if (!adminUser) {
      console.error("❌ Admin user not found");
      return;
    }

    console.log(`✅ Found admin user: ${adminUser.email}`);

    // Check existing orders
    const existingOrders = await prisma.order.findMany({
      where: { organizationId: org.id },
    });

    console.log(`✅ Found ${existingOrders.length} existing orders`);

    if (existingOrders.length === 0) {
      console.log("⚠️ No orders found, creating sample orders...");

      // Create sample orders
      const sampleOrders = [
        {
          id: crypto.randomUUID(),
          organizationId: org.id,
          userId: adminUser.id,
          orderNumber: `ORD-${Date.now()}`,
          total: 599.98,
          subtotal: 599.98,
          tax: 0,
          shipping: 0,
          status: "DELIVERED",
          paymentStatus: "PAID",
          paymentMethod: "CREDIT_CARD",
          currency: "MAD",
          items: {
            create: [
              {
                productId: existingProducts[0]?.id,
                quantity: 1,
                price: existingProducts[0]?.price || 299.99,
                name: existingProducts[0]?.name || "Product 1",
              },
              {
                productId: existingProducts[1]?.id,
                quantity: 1,
                price: existingProducts[1]?.price || 199.99,
                name: existingProducts[1]?.name || "Product 2",
              },
            ],
          },
          address: {
            create: {
              fullName: "Admin User",
              phone: "+212600000000",
              city: "Casablanca",
              address: "123 Main Street",
              postalCode: "20000",
              country: "Morocco",
            },
          },
        },
        {
          id: crypto.randomUUID(),
          organizationId: org.id,
          userId: adminUser.id,
          orderNumber: `ORD-${Date.now() + 1}`,
          total: 299.99,
          subtotal: 299.99,
          tax: 0,
          shipping: 0,
          status: "PROCESSING",
          paymentStatus: "PAID",
          paymentMethod: "CREDIT_CARD",
          currency: "MAD",
          items: {
            create: [
              {
                productId: existingProducts[0]?.id,
                quantity: 1,
                price: existingProducts[0]?.price || 299.99,
                name: existingProducts[0]?.name || "Product 1",
              },
            ],
          },
          address: {
            create: {
              fullName: "Admin User",
              phone: "+212600000000",
              city: "Rabat",
              address: "456 Market Avenue",
              postalCode: "10000",
              country: "Morocco",
            },
          },
        },
        {
          id: crypto.randomUUID(),
          organizationId: org.id,
          userId: adminUser.id,
          orderNumber: `ORD-${Date.now() + 2}`,
          total: 199.99,
          subtotal: 199.99,
          tax: 0,
          shipping: 0,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: "CASH_ON_DELIVERY",
          currency: "MAD",
          items: {
            create: [
              {
                productId: existingProducts[1]?.id,
                quantity: 1,
                price: existingProducts[1]?.price || 199.99,
                name: existingProducts[1]?.name || "Product 2",
              },
            ],
          },
          address: {
            create: {
              fullName: "Admin User",
              phone: "+212600000000",
              city: "Marrakech",
              address: "789 Souk Road",
              postalCode: "40000",
              country: "Morocco",
            },
          },
        },
      ];

      for (const order of sampleOrders) {
        await prisma.order.create({ data: order });
        console.log(`✅ Created order: ${order.orderNumber}`);
      }
    }

    // Verify final counts
    const finalProducts = await prisma.product.count({ where: { organizationId: org.id } });
    const finalOrders = await prisma.order.count({ where: { organizationId: org.id } });

    console.log(`\n✅ Sample data added successfully!`);
    console.log(`📦 Total Products: ${finalProducts}`);
    console.log(`📋 Total Orders: ${finalOrders}`);

  } catch (error) {
    console.error("❌ Error adding sample data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleData();
