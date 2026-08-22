/**
 * Unified Checkout System
 * Single source of truth for all purchasable items pricing
 * 
 * NOTE: This file now re-exports from the unified cart module
 * to maintain backward compatibility during migration
 * 
 * DEPRECATED: calculateOrderTotals is now deprecated.
 * Use calculateCartTotals from @/lib/cart/cart.calculator instead.
 * This function is kept for backward compatibility only.
 */

import { calculateCartTotals as calculateCartTotalsUnified } from "@/lib/cart/cart.calculator";
import type { CartItem, Coupon } from "@/lib/cart/cart.types";

export type CheckoutItemType =
  | "PRODUCT"
  | "BUNDLE_DEAL"
  | "FLASH_DEAL"
  | "SUPER_DEAL"
  | "MYSTERY_BOX"
  | "BUILD_YOUR_BUNDLE";

export interface CheckoutItem {
  id: string;
  type: CheckoutItemType;

  // Display information
  title: string;
  image?: string;

  // Pricing - MUST be pre-calculated before adding to cart
  unitPrice: number;
  quantity: number;
  subtotal: number;

  // Optional reference data for validation/logging
  productId?: string;
  variantId?: string;
  bundleDealId?: string;
  flashDealId?: string;
  superDealId?: string;
  mysteryBoxId?: string;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

/**
 * DEPRECATED: Calculate order totals from checkout items
 * This function is deprecated. Use calculateCartTotals from @/lib/cart/cart.calculator instead.
 * This is kept for backward compatibility during migration.
 */
export function calculateOrderTotals(items: CheckoutItem[]): OrderTotals {
  console.warn("[DEPRECATED] calculateOrderTotals is deprecated. Use calculateCartTotals from @/lib/cart/cart.calculator instead.");
  
  // Convert CheckoutItems to CartItems for unified calculation
  const cartItems: CartItem[] = items.map(item => ({
    id: item.id,
    type: item.type.toLowerCase() as any,
    title: item.title,
    slug: item.id, // Use ID as slug for checkout items
    image: item.image || "",
    price: item.unitPrice,
    quantity: item.quantity,
    currency: "MAD",
    metadata: {
      productId: item.productId,
      variantId: item.variantId,
      bundleDealId: item.bundleDealId,
      flashDealId: item.flashDealId,
      superDealId: item.superDealId,
      mysteryBoxId: item.mysteryBoxId,
    },
  }));

  // Use unified cart calculator
  const totals = calculateCartTotalsUnified(cartItems, null);
  
  return {
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
  };
}

/**
 * Validate checkout item before adding to cart
 */
export function validateCheckoutItem(item: CheckoutItem): void {
  if (!item.id) {
    throw new Error("Checkout item must have an id");
  }
  if (!item.type) {
    throw new Error("Checkout item must have a type");
  }
  if (!item.title) {
    throw new Error("Checkout item must have a title");
  }
  if (item.unitPrice <= 0) {
    throw new Error(
      `Checkout item "${item.title}" has invalid unitPrice: ${item.unitPrice}. Must be greater than 0.`
    );
  }
  if (item.quantity <= 0) {
    throw new Error(
      `Checkout item "${item.title}" has invalid quantity: ${item.quantity}. Must be greater than 0.`
    );
  }
  if (item.subtotal !== item.unitPrice * item.quantity) {
    throw new Error(
      `Checkout item "${item.title}" has invalid subtotal: ${item.subtotal}. Expected ${item.unitPrice * item.quantity}.`
    );
  }
}

/**
 * Convert cart item to CheckoutItem
 * This ensures all items entering the checkout pipeline are properly formatted
 * Now uses the unified cart mapper for consistency
 */
import { mapToCartItem } from "@/lib/cart/cart.mapper";

export function toCheckoutItem(cartItem: any): CheckoutItem {
  // Check if item is already a unified CartItem
  if (cartItem.type && cartItem.title && cartItem.price && cartItem.metadata) {
    // Already a unified CartItem, convert directly to CheckoutItem
    const item: CheckoutItem = {
      id: cartItem.id,
      type: (cartItem.type.toUpperCase() as CheckoutItemType),
      title: cartItem.title,
      image: cartItem.image,
      unitPrice: cartItem.price,
      quantity: cartItem.quantity,
      subtotal: cartItem.price * cartItem.quantity,
      productId: (cartItem.metadata as any)?.productId,
      variantId: (cartItem.metadata as any)?.variantId,
      bundleDealId: (cartItem.metadata as any)?.bundleDealId,
      flashDealId: (cartItem.metadata as any)?.flashDealId,
      superDealId: (cartItem.metadata as any)?.superDealId,
      mysteryBoxId: (cartItem.metadata as any)?.mysteryBoxId,
    };

    validateCheckoutItem(item);
    return item;
  }

  // Use the unified cart mapper to convert legacy items to CartItem
  const unifiedItem = mapToCartItem(cartItem, cartItem.quantity || 1);
  
  // Convert to CheckoutItem format for checkout compatibility
  const item: CheckoutItem = {
    id: unifiedItem.id,
    type: (unifiedItem.type.toUpperCase() as CheckoutItemType),
    title: unifiedItem.title,
    image: unifiedItem.image,
    unitPrice: unifiedItem.price,
    quantity: unifiedItem.quantity,
    subtotal: unifiedItem.price * unifiedItem.quantity,
    productId: (unifiedItem.metadata as any)?.productId,
    variantId: (unifiedItem.metadata as any)?.variantId,
    bundleDealId: (unifiedItem.metadata as any)?.bundleDealId,
    flashDealId: (unifiedItem.metadata as any)?.flashDealId,
    superDealId: (unifiedItem.metadata as any)?.superDealId,
    mysteryBoxId: (unifiedItem.metadata as any)?.mysteryBoxId,
  };

  validateCheckoutItem(item);

  return item;
}
