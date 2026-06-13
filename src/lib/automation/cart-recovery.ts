// src/lib/automation/cart-recovery.ts
// Cart recovery automation: abandoned cart detection, 24h/72h reminders, purchase tracking

import { prisma } from '../prisma';
import { sendPromoEmail } from '../email';
import { addEmailJob, addAbandonedCartJob } from '../queue';
import { logSuccess, logFailure, logPending } from './logger';
import { AutomationType } from '@prisma/client';

/**
 * Architecture:
 * - Cart recovery triggers on cart abandonment (no activity for 30 minutes)
 * - Sends first reminder after 24 hours
 * - Sends second reminder after 72 hours
 * - Stops reminders if purchase is completed
 * - Uses queue system for scheduled reminders
 * - Logs all recovery actions
 */

/**
 * Detect abandoned carts
 * - Find carts with no activity for 30+ minutes
 * - Create cart abandonment records
 * - Schedule first reminder
 */
export async function detectAbandonedCarts() {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Find users with cart items but no recent activity
    const usersWithCarts = await prisma.cartItem.findMany({
      where: {
        updatedAt: {
          lt: thirtyMinutesAgo,
        },
      },
      include: {
        user: true,
        product: true,
      },
      distinct: ['userId'],
    });

    for (const cartItem of usersWithCarts) {
      const userId = cartItem.userId;
      
      // Check if cart abandonment already exists
      const existingAbandonment = await prisma.cartAbandonment.findFirst({
        where: {
          userId,
          recovered: false,
          abandonedAt: {
            gte: thirtyMinutesAgo,
          },
        },
      });

      if (existingAbandonment) {
        continue; // Already tracked
      }

      // Get full cart snapshot
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: true,
          variant: true,
        },
      });

      if (cartItems.length === 0) {
        continue;
      }

      const cartValue = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      // Create cart abandonment record
      await prisma.cartAbandonment.create({
        data: {
          userId,
          cartSnapshot: cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.product.price,
            name: item.product.name,
            image: item.product.images[0],
          })),
          cartValue,
          itemCount: cartItems.length,
        },
      });

      // Schedule first reminder (24 hours)
      await addAbandonedCartJob({
        userId,
        cartItems: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
        cartValue,
        lastActivity: cartItem.updatedAt,
      });

      // Log cart abandonment
      await logSuccess(
        cartItem.product.organizationId,
        AutomationType.CART_ABANDONMENT,
        'Cart',
        userId,
        'Cart abandoned detected',
        {
          userId,
          cartValue,
          itemCount: cartItems.length,
        }
      );
    }

    return {
      total: usersWithCarts.length,
    };
  } catch (error) {
    console.error('[Cart Abandonment Detection] Failed:', error);
    throw error;
  }
}

/**
 * Send first cart recovery reminder (24 hours)
 * - Send email with cart contents
 * - Offer small discount
 */
export async function sendFirstCartReminder(userId: string) {
  try {
    const abandonment = await prisma.cartAbandonment.findFirst({
      where: {
        userId,
        recovered: false,
        reminderSent1: false,
      },
    });

    if (!abandonment) {
      return { success: false, message: 'No abandoned cart found' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate discount code
    const discountCode = `RECOVER10-${Date.now().toString(36).toUpperCase()}`;

    // Queue reminder email
    await addEmailJob({
      type: 'order_confirmation' as any, // Using existing type for now
      to: user.email,
      subject: '🛒 Vous avez oublié quelque chose dans votre panier',
      template: 'cart-recovery-1',
      data: {
        name: user.name,
        cartValue: abandonment.cartValue,
        itemCount: abandonment.itemCount,
        discountCode,
        discount: '10%',
        cartItems: abandonment.cartSnapshot,
      },
    });

    // Update abandonment record
    await prisma.cartAbandonment.update({
      where: { id: abandonment.id },
      data: { reminderSent1: true },
    });

    // Log reminder sent
    await logSuccess(
      'system',
      AutomationType.CART_RECOVERY,
      'Cart',
      abandonment.id,
      'First cart recovery reminder sent',
      {
        userId,
        discountCode,
      }
    );

    return { success: true };
  } catch (error) {
    console.error('[First Cart Reminder] Failed:', error);
    throw error;
  }
}

/**
 * Send second cart recovery reminder (72 hours)
 * - Send email with stronger incentive
 * - Offer larger discount
 */
export async function sendSecondCartReminder(userId: string) {
  try {
    const abandonment = await prisma.cartAbandonment.findFirst({
      where: {
        userId,
        recovered: false,
        reminderSent1: true,
        reminderSent2: false,
      },
    });

    if (!abandonment) {
      return { success: false, message: 'No abandoned cart found' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate discount code
    const discountCode = `RECOVER15-${Date.now().toString(36).toUpperCase()}`;

    // Queue reminder email
    await addEmailJob({
      type: 'order_confirmation' as any, // Using existing type for now
      to: user.email,
      subject: '🎁 Dernière chance : 15% de réduction sur votre panier',
      template: 'cart-recovery-2',
      data: {
        name: user.name,
        cartValue: abandonment.cartValue,
        itemCount: abandonment.itemCount,
        discountCode,
        discount: '15%',
        cartItems: abandonment.cartSnapshot,
      },
    });

    // Update abandonment record
    await prisma.cartAbandonment.update({
      where: { id: abandonment.id },
      data: { reminderSent2: true },
    });

    // Log reminder sent
    await logSuccess(
      'system',
      AutomationType.CART_RECOVERY,
      'Cart',
      abandonment.id,
      'Second cart recovery reminder sent',
      {
        userId,
        discountCode,
      }
    );

    return { success: true };
  } catch (error) {
    console.error('[Second Cart Reminder] Failed:', error);
    throw error;
  }
}

/**
 * Mark cart as recovered
 * - Called when user completes purchase
 * - Stops further reminders
 */
export async function markCartAsRecovered(userId: string) {
  try {
    const abandonments = await prisma.cartAbandonment.updateMany({
      where: {
        userId,
        recovered: false,
      },
      data: {
        recovered: true,
        recoveredAt: new Date(),
      },
    });

    // Log recovery
    await logSuccess(
      'system',
      AutomationType.CART_RECOVERY,
      'Cart',
      userId,
      'Cart marked as recovered',
      {
        userId,
        count: abandonments.count,
      }
    );

    return {
      count: abandonments.count,
    };
  } catch (error) {
    console.error('[Mark Cart Recovered] Failed:', error);
    throw error;
  }
}

/**
 * Get cart recovery statistics
 * - Return recovery rates and metrics
 */
export async function getCartRecoveryStats(organizationId?: string) {
  const whereClause = organizationId ? {} : {}; // Add organization filter if needed

  const [
    totalAbandoned,
    totalRecovered,
    reminder1Sent,
    reminder2Sent,
  ] = await Promise.all([
    prisma.cartAbandonment.count({ where: whereClause }),
    prisma.cartAbandonment.count({
      where: { ...whereClause, recovered: true },
    }),
    prisma.cartAbandonment.count({
      where: { ...whereClause, reminderSent1: true },
    }),
    prisma.cartAbandonment.count({
      where: { ...whereClause, reminderSent2: true },
    }),
  ]);

  const recoveryRate = totalAbandoned > 0
    ? (totalRecovered / totalAbandoned) * 100
    : 0;

  return {
    totalAbandoned,
    totalRecovered,
    reminder1Sent,
    reminder2Sent,
    recoveryRate,
    avgCartValue: await prisma.cartAbandonment.aggregate({
      where: whereClause,
      _avg: { cartValue: true },
    }),
  };
}

/**
 * Process cart recovery queue job
 * - Called by worker to process queued cart recovery
 */
export async function processCartRecoveryJob(jobData: any) {
  const { type, userId } = jobData;

  switch (type) {
    case 'first_reminder':
      return await sendFirstCartReminder(userId);
    case 'second_reminder':
      return await sendSecondCartReminder(userId);
    case 'mark_recovered':
      return await markCartAsRecovered(userId);
    case 'detect_abandoned':
      return await detectAbandonedCarts();
    default:
      throw new Error(`Unknown cart recovery type: ${type}`);
  }
}
