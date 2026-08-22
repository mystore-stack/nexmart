/**
 * Normalization Functions
 * Convert different item types to unified CheckoutItem format
 */

import type { CheckoutItem } from "@/types";

/**
 * Normalize Product to CheckoutItem
 */
export function normalizeProductToCheckout(
  product: any,
  quantity: number = 1,
  variant?: any
): CheckoutItem {
  const unitPrice = variant?.price || product.price || 0;
  const subtotal = unitPrice * quantity;

  return {
    id: `PRODUCT-${product.id}-${variant?.id || 'default'}-${Date.now()}`,
    type: "PRODUCT",
    title: product.name,
    image: product.images?.[0] || null,
    unitPrice,
    quantity,
    subtotal,
    productId: product.id,
    variantId: variant?.id,
  };
}

/**
 * Normalize Bundle Deal to CheckoutItem
 */
export function normalizeBundleToCheckout(
  bundleDeal: any,
  quantity: number = 1
): CheckoutItem {
  const unitPrice = bundleDeal.bundlePrice || 0;
  const subtotal = unitPrice * quantity;

  return {
    id: `BUNDLE_DEAL-${bundleDeal.id}-${Date.now()}`,
    type: "BUNDLE_DEAL",
    title: bundleDeal.name,
    image: bundleDeal.image || null,
    unitPrice,
    quantity,
    subtotal,
    bundleDealId: bundleDeal.id,
  };
}

/**
 * Normalize Mystery Box to CheckoutItem
 */
export function normalizeMysteryBoxToCheckout(
  mysteryBox: any,
  quantity: number = 1
): CheckoutItem {
  const unitPrice = mysteryBox.price || 0;
  const subtotal = unitPrice * quantity;

  return {
    id: `MYSTERY_BOX-${mysteryBox.id}-${Date.now()}`,
    type: "MYSTERY_BOX",
    title: mysteryBox.name,
    image: mysteryBox.heroImage || null,
    unitPrice,
    quantity,
    subtotal,
    mysteryBoxId: mysteryBox.id,
  };
}

/**
 * Normalize Super Deal to CheckoutItem
 */
export function normalizeSuperDealToCheckout(
  superDeal: any,
  quantity: number = 1
): CheckoutItem {
  const unitPrice = superDeal.dealPrice || superDeal.product?.price || 0;
  const subtotal = unitPrice * quantity;

  return {
    id: `SUPER_DEAL-${superDeal.id}-${Date.now()}`,
    type: "SUPER_DEAL",
    title: superDeal.title || superDeal.product?.name || "Super Deal",
    image: superDeal.image || superDeal.product?.images?.[0] || null,
    unitPrice,
    quantity,
    subtotal,
    superDealId: superDeal.id,
    productId: superDeal.product?.id,
  };
}

/**
 * Normalize Flash Deal to CheckoutItem
 */
export function normalizeFlashDealToCheckout(
  flashDeal: any,
  quantity: number = 1
): CheckoutItem {
  const unitPrice = flashDeal.discountAmount || flashDeal.product?.price || 0;
  const subtotal = unitPrice * quantity;

  return {
    id: `FLASH_DEAL-${flashDeal.id}-${Date.now()}`,
    type: "FLASH_DEAL",
    title: flashDeal.title || flashDeal.product?.name || "Flash Deal",
    image: flashDeal.image || flashDeal.product?.images?.[0] || null,
    unitPrice,
    quantity,
    subtotal,
    flashDealId: flashDeal.id,
    productId: flashDeal.product?.id,
  };
}

/**
 * Generic normalization function - auto-detects type and calls appropriate normalizer
 */
export function normalizeToCheckoutItem(item: any, quantity: number = 1): CheckoutItem {
  // Check for explicit type
  if (item.itemType || item.type) {
    const type = (item.itemType || item.type).toUpperCase();
    
    switch (type) {
      case "PRODUCT":
        return normalizeProductToCheckout(item.product || item, quantity, item.variant);
      case "BUNDLE_DEAL":
        return normalizeBundleToCheckout(item.bundleDeal || item, quantity);
      case "MYSTERY_BOX":
        return normalizeMysteryBoxToCheckout(item.mysteryBox || item, quantity);
      case "SUPER_DEAL":
        return normalizeSuperDealToCheckout(item.superDeal || item, quantity);
      case "FLASH_DEAL":
        return normalizeFlashDealToCheckout(item.flashDeal || item, quantity);
    }
  }

  // Auto-detect based on available properties
  if (item.bundlePrice) {
    return normalizeBundleToCheckout(item, quantity);
  }
  if (item.price && item.category) {
    return normalizeProductToCheckout(item, quantity);
  }
  if (item.dealPrice) {
    return normalizeSuperDealToCheckout(item, quantity);
  }
  if (item.discountAmount) {
    return normalizeFlashDealToCheckout(item, quantity);
  }
  if (item.heroTitle) {
    return normalizeMysteryBoxToCheckout(item, quantity);
  }

  // Default to product
  return normalizeProductToCheckout(item, quantity);
}
