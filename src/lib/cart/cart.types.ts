/**
 * Cart Types
 * Unified type definitions for cart operations
 */

import type { CartItemType, CURRENCY } from "./cart.constants";

/**
 * Unified Cart Item interface
 * Single source of truth for all cart items across the application
 */
export interface CartItem {
  id: string;
  type: CartItemType;
  title: string;
  slug: string;
  sku?: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  currency: typeof CURRENCY;
  metadata?: Record<string, unknown>;
}

/**
 * Cart totals
 */
export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: typeof CURRENCY;
}

/**
 * Cart state
 */
export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  coupon: Coupon | null;
}

/**
 * Coupon interface
 */
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  userLimit: number;
  startDate: string;
  endDate?: string;
  active: boolean;
}

/**
 * Cart validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Cart storage interface
 */
export interface CartStorage {
  getItems(): CartItem[];
  setItems(items: CartItem[]): void;
  getCoupon(): Coupon | null;
  setCoupon(coupon: Coupon | null): void;
  clear(): void;
}

/**
 * Cart service interface
 */
export interface CartService {
  addItem(item: CartItem): void;
  removeItem(itemId: string): void;
  updateQuantity(itemId: string, quantity: number): void;
  increment(itemId: string): void;
  decrement(itemId: string): void;
  clear(): void;
  getItems(): CartItem[];
  getItem(itemId: string): CartItem | undefined;
  hasItem(itemId: string): boolean;
  calculateTotals(): CartTotals;
  validate(item: CartItem): ValidationResult;
  sync(): Promise<void>;
  persist(): void;
}

/**
 * Cart calculator interface
 */
export interface CartCalculator {
  calculateSubtotal(items: CartItem[]): number;
  calculateDiscount(items: CartItem[], coupon?: Coupon | null): number;
  calculateShipping(subtotal: number): number;
  calculateTax(subtotal: number): number;
  calculateTotal(subtotal: number, discount: number, shipping: number, tax: number): number;
  calculateTotals(items: CartItem[], coupon?: Coupon | null): CartTotals;
}
