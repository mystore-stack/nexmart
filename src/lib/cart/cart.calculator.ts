/**
 * Cart Calculator
 * Single source of truth for all cart calculations
 */

import type { CartItem, CartTotals, Coupon, CartCalculator } from "./cart.types";
import { SHIPPING, TAX_RATE, CURRENCY } from "./cart.constants";

/**
 * Implementation of CartCalculator
 */
export class CartCalculatorImpl implements CartCalculator {
  /**
   * Calculate subtotal from cart items
   */
  calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      return sum + itemTotal;
    }, 0);
  }

  /**
   * Calculate discount from coupon
   */
  calculateDiscount(items: CartItem[], coupon?: Coupon | null): number {
    if (!coupon) return 0;

    const subtotal = this.calculateSubtotal(items);
    const minOrder = coupon.minOrder || 0;

    // Check if minimum order requirement is met
    if (minOrder > 0 && subtotal < minOrder) {
      return 0;
    }

    let discount = 0;

    if (coupon.type === "PERCENTAGE") {
      discount = (subtotal * coupon.value) / 100;
    } else {
      // FIXED amount
      discount = coupon.value;
    }

    // Apply max discount limit if set
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    // Discount cannot exceed subtotal
    return Math.min(discount, subtotal);
  }

  /**
   * Calculate shipping cost
   */
  calculateShipping(subtotal: number): number {
    // Free shipping over threshold
    if (subtotal >= SHIPPING.FREE_SHIPPING_THRESHOLD) {
      return 0;
    }

    return SHIPPING.DEFAULT_SHIPPING_COST;
  }

  /**
   * Calculate tax (VAT)
   */
  calculateTax(subtotal: number): number {
    return subtotal * TAX_RATE;
  }

  /**
   * Calculate total
   */
  calculateTotal(
    subtotal: number,
    discount: number,
    shipping: number,
    tax: number
  ): number {
    return subtotal - discount + shipping + tax;
  }

  /**
   * Calculate all cart totals
   */
  calculateTotals(items: CartItem[], coupon?: Coupon | null): CartTotals {
    if (process.env.NODE_ENV === "development") {
      console.log("[CART CALCULATOR] Calculating totals for", items.length, "items");
    }

    const subtotal = this.calculateSubtotal(items);
    const discount = this.calculateDiscount(items, coupon);
    const shipping = this.calculateShipping(subtotal);
    const tax = this.calculateTax(subtotal);
    const total = this.calculateTotal(subtotal, discount, shipping, tax);

    const totals: CartTotals = {
      subtotal,
      discount,
      shipping,
      tax,
      total,
      currency: CURRENCY,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("[CART CALCULATOR] Calculated totals:", totals);
    }

    return totals;
  }
}

/**
 * Default calculator instance
 */
export const cartCalculator = new CartCalculatorImpl();

/**
 * Convenience functions for direct usage
 */
export function calculateCartSubtotal(items: CartItem[]): number {
  return cartCalculator.calculateSubtotal(items);
}

export function calculateCartDiscount(items: CartItem[], coupon?: Coupon | null): number {
  return cartCalculator.calculateDiscount(items, coupon);
}

export function calculateCartShipping(subtotal: number): number {
  return cartCalculator.calculateShipping(subtotal);
}

export function calculateCartTax(subtotal: number): number {
  return cartCalculator.calculateTax(subtotal);
}

export function calculateCartTotal(
  subtotal: number,
  discount: number,
  shipping: number,
  tax: number
): number {
  return cartCalculator.calculateTotal(subtotal, discount, shipping, tax);
}

export function calculateCartTotals(items: CartItem[], coupon?: Coupon | null): CartTotals {
  return cartCalculator.calculateTotals(items, coupon);
}
