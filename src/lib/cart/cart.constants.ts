/**
 * Cart Constants
 * Centralized constants for cart operations
 */

/**
 * Supported cart item types
 */
export const CART_ITEM_TYPES = {
  PRODUCT: "product",
  BUNDLE: "bundle",
  MYSTERY_BOX: "mystery-box",
  FLASH_DEAL: "flash-deal",
  BUY_MORE_SAVE_MORE: "buy-more-save-more",
  BUILD_BUNDLE: "build-bundle",
  GIFT_CARD: "gift-card",
  DIGITAL: "digital",
} as const;

export type CartItemType = typeof CART_ITEM_TYPES[keyof typeof CART_ITEM_TYPES];

/**
 * Currency
 */
export const CURRENCY = "MAD" as const;

/**
 * Cart storage keys
 */
export const STORAGE_KEYS = {
  CART: "nexmart-cart",
  CART_ITEMS: "nexmart-cart-items",
  CART_COUPON: "nexmart-cart-coupon",
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 99,
  MIN_PRICE: 0.01,
  MAX_PRICE: 1000000,
} as const;

/**
 * Shipping thresholds
 */
export const SHIPPING = {
  FREE_SHIPPING_THRESHOLD: 500,
  DEFAULT_SHIPPING_COST: 49,
} as const;

/**
 * Tax rate (20% VAT in Morocco)
 */
export const TAX_RATE = 0.2;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  INVALID_ID: "Invalid item ID",
  INVALID_TYPE: "Invalid item type",
  INVALID_TITLE: "Item must have a title",
  INVALID_IMAGE: "Item must have an image",
  INVALID_SLUG: "Item must have a slug",
  INVALID_QUANTITY: "Quantity must be greater than 0",
  INVALID_PRICE: "Price must be greater than 0",
  PRICE_UNDEFINED: "Price is undefined",
  PRICE_NULL: "Price is null",
  PRICE_NAN: "Price is NaN",
  PRICE_NEGATIVE: "Price cannot be negative",
  ITEM_NOT_FOUND: "Item not found in cart",
  CART_EMPTY: "Cart is empty",
} as const;
