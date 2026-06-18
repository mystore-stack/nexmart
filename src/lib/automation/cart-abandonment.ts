// src/lib/automation/cart-abandonment.ts — Cart Abandonment Recovery System
import { prisma } from '@/lib/prisma';
import { sendCartAbandonmentEmail } from '@/lib/email';

interface CartAbandonmentConfig {
  abandonmentThreshold?: number; // hours
  reminder1Delay?: number; // hours
  reminder2Delay?: number; // hours
  reminder3Delay?: number; // hours
}

export async function detectAbandonedCarts(config: CartAbandonmentConfig = {}) {
  const {
    abandonmentThreshold = 24,
    reminder1Delay = 24,
    reminder2Delay = 72,
    reminder3Delay = 168, // 7 days
  } = config;

  // Find carts inactive for more than threshold
  const abandonedCarts = await prisma.cartItem.groupBy({
    by: ['userId'],
    where: {
      updatedAt: {
        lte: new Date(Date.now() - abandonmentThreshold * 60 * 60 * 1000),
      },
    },
    _sum: {
      quantity: true,
    },
  });

  for (const cart of abandonedCarts) {
    await processAbandonedCart(
      cart.userId,
      abandonmentThreshold,
      reminder1Delay,
      reminder2Delay,
      reminder3Delay
    );
  }
}

async function processAbandonedCart(
  userId: string,
  abandonmentThreshold: number,
  reminder1Delay: number,
  reminder2Delay: number,
  reminder3Delay: number
) {
  // Get cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
        },
      },
    },
  });

  if (cartItems.length === 0) {
    return; // Empty cart, skip
  }

  // Calculate cart value
  const cartValue = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const itemCount = cartItems.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  // Check if cart reminder already exists
  let cartReminder = await prisma.cartReminder.findFirst({
    where: { userId },
  });

  if (!cartReminder) {
    // Create new cart reminder
    cartReminder = await prisma.cartReminder.create({
      data: {
        userId,
        cartSnapshot: cartItems,
        cartValue,
        itemCount,
        abandonedAt: new Date(Date.now() - abandonmentThreshold * 60 * 60 * 1000),
      },
    });
  } else {
    // Update existing reminder with latest cart state
    cartReminder = await prisma.cartReminder.update({
      where: { id: cartReminder.id },
      data: {
        cartSnapshot: cartItems,
        cartValue,
        itemCount,
        lastActivityAt: cartItems[0]?.updatedAt || new Date(),
      },
    });
  }

  // Check if cart was recovered
  if (cartReminder.recovered) {
    return; // Cart was recovered, skip
  }

  const abandonedAt = cartReminder.abandonedAt;
  const now = new Date();
  const hoursSinceAbandonment = (now.getTime() - abandonedAt.getTime()) / (60 * 60 * 1000);

  // Send reminder 1 (24 hours after abandonment)
  if (!cartReminder.reminderSent1 && hoursSinceAbandonment >= reminder1Delay) {
    await sendReminder(1, cartReminder, userId, cartValue, itemCount);
  }

  // Send reminder 2 (72 hours after abandonment)
  if (
    cartReminder.reminderSent1 &&
    !cartReminder.reminderSent2 &&
    hoursSinceAbandonment >= reminder2Delay
  ) {
    await sendReminder(2, cartReminder, userId, cartValue, itemCount);
  }

  // Send reminder 3 (7 days after abandonment)
  if (
    cartReminder.reminderSent2 &&
    !cartReminder.reminderSent3 &&
    hoursSinceAbandonment >= reminder3Delay
  ) {
    await sendReminder(3, cartReminder, userId, cartValue, itemCount);
  }
}

async function sendReminder(
  reminderNumber: 1 | 2 | 3,
  cartReminder: any,
  userId: string,
  cartValue: number,
  itemCount: number
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (!user) {
    return;
  }

  try {
    await sendCartAbandonmentEmail(
      user.email,
      user.name,
      cartValue,
      itemCount,
      reminderNumber,
      userId
    );

    // Update cart reminder
    const updateData: any = {};
    if (reminderNumber === 1) {
      updateData.reminderSent1 = true;
      updateData.reminderSent1At = new Date();
    } else if (reminderNumber === 2) {
      updateData.reminderSent2 = true;
      updateData.reminderSent2At = new Date();
    } else if (reminderNumber === 3) {
      updateData.reminderSent3 = true;
      updateData.reminderSent3At = new Date();
    }

    await prisma.cartReminder.update({
      where: { id: cartReminder.id },
      data: updateData,
    });
  } catch (error) {
    console.error(`[Cart Reminder ${reminderNumber} Error] User ${userId}:`, error);
  }
}

export async function markCartAsRecovered(userId: string) {
  return prisma.cartReminder.updateMany({
    where: { userId, recovered: false },
    data: {
      recovered: true,
      recoveredAt: new Date(),
    },
  });
}

export async function getCartReminders(userId?: string, includeRecovered = false) {
  const where = userId ? { userId } : {};
  if (!includeRecovered) {
    Object.assign(where, { recovered: false });
  }

  return prisma.cartReminder.findMany({
    where,
    orderBy: { abandonedAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getCartRecoveryStats(organizationId?: string) {
  const where = organizationId ? { user: { organizationId } } : {};

  const [totalAbandoned, totalRecovered, recoveryRate] = await Promise.all([
    prisma.cartReminder.count({ where }),
    prisma.cartReminder.count({ where: { ...where, recovered: true } }),
  ]);

  const rate = totalAbandoned > 0 ? (totalRecovered / totalAbandoned) * 100 : 0;

  return {
    totalAbandoned,
    totalRecovered,
    recoveryRate: Math.round(rate * 100) / 100,
  };
}
