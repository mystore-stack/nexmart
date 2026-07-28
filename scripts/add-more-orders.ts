import { PrismaClient, OrderStatus, PaymentMethod } from "@prisma/client";

const prisma = new PrismaClient();

async function addMoreOrders() {
  try {
    console.log("🌱 Adding more sample orders...");

    // Get organization
    const org = await prisma.organization.findFirst({
      where: { slug: "nexmart" },
    });

    if (!org) {
      console.error("❌ Organization not found");
      return;
    }

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: "admin@nexstore.com" },
    });

    if (!adminUser) {
      console.error("❌ Admin user not found");
      return;
    }

    // Get existing products
    const products = await prisma.product.findMany({
      where: { organizationId: org.id },
      take: 10,
    });

    if (products.length === 0) {
      console.error("❌ No products found");
      return;
    }

    console.log(`✅ Found ${products.length} products`);

    // Create more sample orders
    const statuses: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    const paymentMethods: PaymentMethod[] = ["STRIPE", "CASH_ON_DELIVERY", "CMI"];
    const cities = ["Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir"];

    for (let i = 0; i < 20; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomPaymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomQuantity = Math.floor(Math.random() * 3) + 1;
      const totalPrice = randomProduct.price * randomQuantity;

      // Create address first
      const address = await prisma.address.create({
        data: {
          userId: adminUser.id,
          name: `Customer ${i + 1}`,
          phone: `+21260000000${i}`,
          line1: `${Math.floor(Math.random() * 999) + 1} Street ${i + 1}`,
          line2: `Apt ${Math.floor(Math.random() * 10) + 1}`,
          city: randomCity,
          state: randomCity,
          country: "Morocco",
          zip: `${Math.floor(Math.random() * 90000) + 10000}`,
        },
      });

      await prisma.order.create({
        data: {
          id: crypto.randomUUID(),
          organizationId: org.id,
          userId: adminUser.id,
          addressId: address.id,
          orderNumber: `ORD-${Date.now()}-${i}`,
          total: totalPrice,
          subtotal: totalPrice,
          tax: 0,
          shipping: 0,
          status: randomStatus,
          paymentStatus: randomStatus === "CANCELLED" ? "REFUNDED" : "PAID",
          paymentMethod: randomPaymentMethod,
          currency: "MAD",
          items: {
            create: {
              productId: randomProduct.id,
              quantity: randomQuantity,
              price: randomProduct.price,
              name: randomProduct.name,
              image: randomProduct.images[0] || "",
            },
          },
        },
      });

      console.log(`✅ Created order ${i + 1}: ${randomStatus}`);
    }

    const finalOrders = await prisma.order.count({ where: { organizationId: org.id } });
    console.log(`\n✅ Orders added successfully!`);
    console.log(`📋 Total Orders: ${finalOrders}`);

  } catch (error) {
    console.error("❌ Error adding orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addMoreOrders();
