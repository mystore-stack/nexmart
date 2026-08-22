/**
 * Cart Validation
 * Strict validation for cart items to prevent invalid data
 */

import type { CartItem, ValidationResult } from "./cart.types";
import { ERROR_MESSAGES, VALIDATION } from "./cart.constants";

/**
 * Validate a single cart item
 * Throws explicit errors for invalid data
 */
export function validateCartItem(item: CartItem): ValidationResult {
  const errors: string[] = [];

  // Validate ID
  if (!item.id || typeof item.id !== "string" || item.id.trim() === "") {
    errors.push(ERROR_MESSAGES.INVALID_ID);
  }

  // Validate type
  if (!item.type || typeof item.type !== "string") {
    errors.push(ERROR_MESSAGES.INVALID_TYPE);
  }

  // Validate title
  if (!item.title || typeof item.title !== "string" || item.title.trim() === "") {
    errors.push(ERROR_MESSAGES.INVALID_TITLE);
  }

  // Validate slug
  if (!item.slug || typeof item.slug !== "string" || item.slug.trim() === "") {
    errors.push(ERROR_MESSAGES.INVALID_SLUG);
  }

  // Validate image
  if (!item.image || typeof item.image !== "string" || item.image.trim() === "") {
    errors.push(ERROR_MESSAGES.INVALID_IMAGE);
  }

  // Validate quantity
  if (item.quantity === undefined || item.quantity === null) {
    errors.push(ERROR_MESSAGES.INVALID_QUANTITY);
  } else if (typeof item.quantity !== "number") {
    errors.push(ERROR_MESSAGES.INVALID_QUANTITY);
  } else if (item.quantity < VALIDATION.MIN_QUANTITY) {
    errors.push(ERROR_MESSAGES.INVALID_QUANTITY);
  } else if (item.quantity > VALIDATION.MAX_QUANTITY) {
    errors.push(`Quantity cannot exceed ${VALIDATION.MAX_QUANTITY}`);
  }

  // Validate price - STRICT VALIDATION
  if (item.price === undefined) {
    errors.push(ERROR_MESSAGES.PRICE_UNDEFINED);
  } else if (item.price === null) {
    errors.push(ERROR_MESSAGES.PRICE_NULL);
  } else if (typeof item.price !== "number") {
    errors.push(ERROR_MESSAGES.PRICE_NAN);
  } else if (isNaN(item.price)) {
    errors.push(ERROR_MESSAGES.PRICE_NAN);
  } else if (item.price < 0) {
    errors.push(ERROR_MESSAGES.PRICE_NEGATIVE);
  } else if (item.price === 0) {
    errors.push(ERROR_MESSAGES.INVALID_PRICE);
  } else if (item.price < VALIDATION.MIN_PRICE) {
    errors.push(`Price must be at least ${VALIDATION.MIN_PRICE} MAD`);
  } else if (item.price > VALIDATION.MAX_PRICE) {
    errors.push(`Price cannot exceed ${VALIDATION.MAX_PRICE} MAD`);
  }

  // Validate compareAtPrice if provided
  if (item.compareAtPrice !== undefined && item.compareAtPrice !== null) {
    if (typeof item.compareAtPrice !== "number") {
      errors.push("Compare at price must be a number");
    } else if (isNaN(item.compareAtPrice)) {
      errors.push("Compare at price is NaN");
    } else if (item.compareAtPrice < 0) {
      errors.push("Compare at price cannot be negative");
    }
  }

  // Validate currency
  if (item.currency !== "MAD") {
    errors.push("Currency must be MAD");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate cart item and throw error if invalid
 * Use this when you want to fail fast on invalid data
 */
export function validateCartItemStrict(item: CartItem): void {
  const result = validateCartItem(item);

  if (!result.isValid) {
    const error = new Error(
      `Invalid cart item "${item.title || item.id}": ${result.errors.join(", ")}`
    );
    (error as any).validationErrors = result.errors;
    (error as any).item = item;
    throw error;
  }
}

/**
 * Validate price specifically
 * This is the function that will fix the Mystery Box 0 MAD bug
 */
export function validatePrice(price: unknown, itemName: string = "Item"): number {
  if (price === undefined) {
    throw new Error(`${itemName}: ${ERROR_MESSAGES.PRICE_UNDEFINED}`);
  }
  if (price === null) {
    throw new Error(`${itemName}: ${ERROR_MESSAGES.PRICE_NULL}`);
  }
  if (typeof price !== "number") {
    throw new Error(`${itemName}: ${ERROR_MESSAGES.PRICE_NAN}`);
  }
  if (isNaN(price)) {
    throw new Error(`${itemName}: ${ERROR_MESSAGES.PRICE_NAN}`);
  }
  if (price < 0) {
    throw new Error(`${itemName}: ${ERROR_MESSAGES.PRICE_NEGATIVE}`);
  }
  if (price === 0) {
    throw new Error(`${itemName}: ${ERROR_MESSAGES.INVALID_PRICE}`);
  }
  if (price < VALIDATION.MIN_PRICE) {
    throw new Error(`${itemName}: Price must be at least ${VALIDATION.MIN_PRICE} MAD`);
  }
  if (price > VALIDATION.MAX_PRICE) {
    throw new Error(`${itemName}: Price cannot exceed ${VALIDATION.MAX_PRICE} MAD`);
  }

  return price;
}

/**
 * Validate quantity
 */
export function validateQuantity(quantity: unknown, itemName: string = "Item"): number {
  if (quantity === undefined || quantity === null) {
    throw new Error(`${itemName}: ${ERROR_MESSAGES.INVALID_QUANTITY}`);
  }
  if (typeof quantity !== "number") {
    throw new Error(`${itemName}: Quantity must be a number`);
  }
  if (isNaN(quantity)) {
    throw new Error(`${itemName}: Quantity is NaN`);
  }
  if (quantity < VALIDATION.MIN_QUANTITY) {
    throw new Error(`${itemName}: ${ERROR_MESSAGES.INVALID_QUANTITY}`);
  }
  if (quantity > VALIDATION.MAX_QUANTITY) {
    throw new Error(`${itemName}: Quantity cannot exceed ${VALIDATION.MAX_QUANTITY}`);
  }

  return quantity;
}

/**
 * Validate required string fields
 */
export function validateStringField(
  value: unknown,
  fieldName: string,
  itemName: string = "Item"
): string {
  if (value === undefined || value === null) {
    throw new Error(`${itemName}: ${fieldName} is required`);
  }
  if (typeof value !== "string") {
    throw new Error(`${itemName}: ${fieldName} must be a string`);
  }
  if (value.trim() === "") {
    throw new Error(`${itemName}: ${fieldName} cannot be empty`);
  }

  return value;
}

/**
 * Validate and normalize cart item image
 * Provides fallback image paths in a consistent order
 */
export function validateCartImage(
  item: any,
  itemName: string = "Item"
): string {
  // Try multiple image fields in priority order
  const imageSources = [
    item.image,
    item.heroImage,
    item.thumbnail,
    item.images?.[0],
    item.product?.images?.[0],
    item.product?.image,
    "/images/placeholder-product.png",
  ];

  for (const image of imageSources) {
    if (image && typeof image === "string" && image.trim() !== "") {
      return image.trim();
    }
  }

  // If all sources are empty, return placeholder
  return "/images/placeholder-product.png";
}
