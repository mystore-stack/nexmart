// src/lib/automation/coupon-engine.ts — Discount Coupon Engine
import { prisma } from '@/lib/prisma';

// Coupon configuration
export interface CouponConfig {
  organizationId: string;
  code: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  usageLimit?: number;
  userLimit?: number;
  startDate?: Date;
  endDate?: Date;
}

// Generate a random coupon code
export function generateCouponCode(prefix: string = 'PROMO', length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix;
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new coupon
export async function createCoupon(config: CouponConfig) {
  try {
    const coupon = await prisma.coupon.create({
      data: {
        organizationId: config.organizationId,
        code: config.code.toUpperCase(),
        description: config.description,
        type: config.type,
        value: config.value,
        minOrder: config.minOrder,
        maxDiscount: config.maxDiscount,
        usageLimit: config.usageLimit,
        userLimit: config.userLimit || 1,
        startDate: config.startDate || new Date(),
        endDate: config.endDate,
        active: true,
      },
    });

    console.log(`[Coupon Engine] Created coupon ${coupon.code}`);
    return coupon;
  } catch (error) {
    console.error('[Create Coupon Error]:', error);
    throw error;
  }
}

// Generate welcome coupon for new user
export async function generateWelcomeCoupon(organizationId: string, userId?: string) {
  try {
    const code = generateCouponCode('BIENVENUE', 6);
    
    const coupon = await createCoupon({
      organizationId,
      code,
      description: 'Code promo bienvenue',
      type: 'PERCENTAGE',
      value: 15,
      minOrder: 100,
      maxDiscount: 200,
      usageLimit: 1000,
      userLimit: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return coupon;
  } catch (error) {
    console.error('[Generate Welcome Coupon Error]:', error);
    throw error;
  }
}

// Generate birthday coupon for user
export async function generateBirthdayCoupon(organizationId: string, userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const code = generateCouponCode('ANNIV', 6);
    
    const coupon = await createCoupon({
      organizationId,
      code,
      description: `Joyeux anniversaire ${user.name.split(' ')[0]} !`,
      type: 'PERCENTAGE',
      value: 20,
      minOrder: 150,
      maxDiscount: 300,
      usageLimit: 1,
      userLimit: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return coupon;
  } catch (error) {
    console.error('[Generate Birthday Coupon Error]:', error);
    throw error;
  }
}

// Generate referral coupon
export async function generateReferralCoupon(organizationId: string, referrerId: string) {
  try {
    const code = generateCouponCode('PARRAIN', 6);
    
    const coupon = await createCoupon({
      organizationId,
      code,
      description: 'Code parrainage',
      type: 'PERCENTAGE',
      value: 10,
      minOrder: 200,
      maxDiscount: 150,
      usageLimit: 50,
      userLimit: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });

    return coupon;
  } catch (error) {
    console.error('[Generate Referral Coupon Error]:', error);
    throw error;
  }
}

// Generate flash sale coupon
export async function generateFlashSaleCoupon(organizationId: string, discountPercent: number = 25) {
  try {
    const code = generateCouponCode('FLASH', 6);
    
    const coupon = await createCoupon({
      organizationId,
      code,
      description: `Vente flash -${discountPercent}%`,
      type: 'PERCENTAGE',
      value: discountPercent,
      minOrder: 100,
      maxDiscount: 500,
      usageLimit: 500,
      userLimit: 2,
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    return coupon;
  } catch (error) {
    console.error('[Generate Flash Sale Coupon Error]:', error);
    throw error;
  }
}

// Validate coupon
export async function validateCoupon(code: string, organizationId: string, userId?: string) {
  try {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        organizationId,
        active: true,
      },
    });

    if (!coupon) {
      return { valid: false, error: 'Coupon not found' };
    }

    // Check if coupon is expired
    if (coupon.endDate && new Date() > coupon.endDate) {
      return { valid: false, error: 'Coupon expired' };
    }

    // Check if coupon has started
    if (coupon.startDate && new Date() < coupon.startDate) {
      return { valid: false, error: 'Coupon not yet active' };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'Coupon usage limit reached' };
    }

    // Check user limit if userId provided
    if (userId && coupon.userLimit) {
      const userOrders = await prisma.order.count({
        where: {
          userId,
          couponId: coupon.id,
        },
      });

      if (userOrders >= coupon.userLimit) {
        return { valid: false, error: 'Coupon user limit reached' };
      }
    }

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
      },
    };
  } catch (error) {
    console.error('[Validate Coupon Error]:', error);
    return { valid: false, error: 'Validation failed' };
  }
}

// Apply coupon to order
export async function applyCouponToOrder(
  orderId: string,
  couponId: string
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { coupon: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.couponId) {
      throw new Error('Order already has a coupon applied');
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = order.subtotal * (coupon.value / 100);
    } else {
      discount = coupon.value;
    }

    // Apply max discount limit
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    // Update order with coupon
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        couponId: coupon.id,
        discount,
        total: order.subtotal + order.shipping + order.tax - discount,
      },
    });

    // Increment coupon usage
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    });

    console.log(`[Coupon Engine] Applied coupon ${coupon.code} to order ${order.orderNumber}`);
    return updatedOrder;
  } catch (error) {
    console.error('[Apply Coupon To Order Error]:', error);
    throw error;
  }
}

// Get coupon statistics
export async function getCouponStatistics(organizationId: string) {
  try {
    const [
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalUsage,
      totalDiscountValue,
    ] = await Promise.all([
      prisma.coupon.count({ where: { organizationId } }),
      prisma.coupon.count({ where: { organizationId, active: true } }),
      prisma.coupon.count({
        where: {
          organizationId,
          endDate: { lt: new Date() },
        },
      }),
      prisma.coupon.aggregate({
        where: { organizationId },
        _sum: { usedCount: true },
      }),
      prisma.order.aggregate({
        where: {
          organizationId,
          couponId: { not: null },
        },
        _sum: { discount: true },
      }),
    ]);

    return {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalUsage: totalUsage._sum.usedCount || 0,
      totalDiscountValue: totalDiscountValue._sum.discount || 0,
    };
  } catch (error) {
    console.error('[Get Coupon Statistics Error]:', error);
    return null;
  }
}
