/**
 * Cart Service
 * Core cart service implementing all CRUD operations
 */

import type { CartItem, CartTotals, Coupon, CartService, ValidationResult } from "./cart.types";
import { cartStorage } from "./cart.storage";
import { cartCalculator } from "./cart.calculator";
import { validateCartItemStrict, validateCartItem as validateCartItemUtil } from "./cart.validation";
import { ERROR_MESSAGES } from "./cart.constants";

/**
 * Implementation of CartService
 */
export class CartServiceImpl implements CartService {
  private items: CartItem[] = [];
  private coupon: Coupon | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add item to cart
   */
  addItem(item: CartItem): void {
    console.log("[CART SERVICE] Adding item:", item);

    // Validate item strictly
    try {
      validateCartItemStrict(item);
    } catch (error) {
      console.error("[CART SERVICE] Validation failed for item:", item, error);
      throw error;
    }

    // Check if item already exists (by ID)
    const existingIndex = this.items.findIndex((existing) => existing.id === item.id);

    if (existingIndex >= 0) {
      // Update quantity of existing item
      const existingItem = this.items[existingIndex];
      const newQuantity = existingItem.quantity + item.quantity;
      
      this.items[existingIndex] = {
        ...existingItem,
        quantity: newQuantity,
      };
      
      console.log("[CART SERVICE] Updated existing item quantity:", {
        itemId: item.id,
        oldQuantity: existingItem.quantity,
        newQuantity,
      });
    } else {
      // Add new item
      this.items.push(item);
      console.log("[CART SERVICE] Added new item:", item.id);
    }

    this.persist();
    this.notifyListeners();
  }

  /**
   * Remove item from cart
   */
  removeItem(itemId: string): void {
    console.log("[CART SERVICE] Removing item:", itemId);

    const index = this.items.findIndex((item) => item.id === itemId);
    if (index === -1) {
      console.warn("[CART SERVICE] Item not found:", itemId);
      return;
    }

    this.items.splice(index, 1);
    this.persist();
    this.notifyListeners();
  }

  /**
   * Update item quantity
   */
  updateQuantity(itemId: string, quantity: number): void {
    console.log("[CART SERVICE] Updating quantity:", { itemId, quantity });

    const item = this.items.find((item) => item.id === itemId);
    if (!item) {
      console.warn("[CART SERVICE] Item not found:", itemId);
      return;
    }

    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    item.quantity = quantity;
    this.persist();
    this.notifyListeners();
  }

  /**
   * Increment item quantity by 1
   */
  increment(itemId: string): void {
    const item = this.items.find((item) => item.id === itemId);
    if (!item) {
      console.warn("[CART SERVICE] Item not found:", itemId);
      return;
    }

    this.updateQuantity(itemId, item.quantity + 1);
  }

  /**
   * Decrement item quantity by 1
   */
  decrement(itemId: string): void {
    const item = this.items.find((item) => item.id === itemId);
    if (!item) {
      console.warn("[CART SERVICE] Item not found:", itemId);
      return;
    }

    this.updateQuantity(itemId, item.quantity - 1);
  }

  /**
   * Clear all items from cart
   */
  clear(): void {
    console.log("[CART SERVICE] Clearing cart");
    this.items = [];
    this.coupon = null;
    this.persist();
    this.notifyListeners();
  }

  /**
   * Get all items in cart
   */
  getItems(): CartItem[] {
    return [...this.items];
  }

  /**
   * Get single item by ID
   */
  getItem(itemId: string): CartItem | undefined {
    return this.items.find((item) => item.id === itemId);
  }

  /**
   * Check if item exists in cart
   */
  hasItem(itemId: string): boolean {
    return this.items.some((item) => item.id === itemId);
  }

  /**
   * Calculate cart totals
   */
  calculateTotals(): CartTotals {
    return cartCalculator.calculateTotals(this.items, this.coupon);
  }

  /**
   * Validate a cart item
   */
  validate(item: CartItem): ValidationResult {
    return validateCartItemUtil(item);
  }

  /**
   * Sync cart with server
   */
  async sync(): Promise<void> {
    console.log("[CART SERVICE] Syncing with server");

    try {
      const res = await fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: this.items }),
      });

      if (!res.ok) {
        console.error("[CART SERVICE] Sync failed:", res.status);
        return;
      }

      const data = await res.json();
      console.log("[CART SERVICE] Sync successful:", data);
    } catch (error) {
      console.error("[CART SERVICE] Sync error:", error);
    }
  }

  /**
   * Persist cart to storage
   */
  persist(): void {
    cartStorage.setItems(this.items);
    cartStorage.setCoupon(this.coupon);
  }

  /**
   * Load cart from storage
   */
  private loadFromStorage(): void {
    this.items = cartStorage.getItems();
    this.coupon = cartStorage.getCoupon();
    console.log("[CART SERVICE] Loaded from storage:", {
      itemCount: this.items.length,
      hasCoupon: !!this.coupon,
    });
  }

  /**
   * Subscribe to cart changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Apply coupon
   */
  applyCoupon(coupon: Coupon): void {
    console.log("[CART SERVICE] Applying coupon:", coupon.code);
    this.coupon = coupon;
    this.persist();
    this.notifyListeners();
  }

  /**
   * Remove coupon
   */
  removeCoupon(): void {
    console.log("[CART SERVICE] Removing coupon");
    this.coupon = null;
    this.persist();
    this.notifyListeners();
  }

  /**
   * Get current coupon
   */
  getCoupon(): Coupon | null {
    return this.coupon;
  }

  /**
   * Get item count
   */
  getItemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

/**
 * Default cart service instance
 */
export const cartService = new CartServiceImpl();

/**
 * Convenience functions for direct usage
 */
export function addCartItem(item: CartItem): void {
  cartService.addItem(item);
}

export function removeCartItem(itemId: string): void {
  cartService.removeItem(itemId);
}

export function updateCartItemQuantity(itemId: string, quantity: number): void {
  cartService.updateQuantity(itemId, quantity);
}

export function incrementCartItem(itemId: string): void {
  cartService.increment(itemId);
}

export function decrementCartItem(itemId: string): void {
  cartService.decrement(itemId);
}

export function clearCart(): void {
  cartService.clear();
}

export function getCartItems(): CartItem[] {
  return cartService.getItems();
}

export function getCartItem(itemId: string): CartItem | undefined {
  return cartService.getItem(itemId);
}

export function hasCartItem(itemId: string): boolean {
  return cartService.hasItem(itemId);
}

export function calculateCartTotals(): CartTotals {
  return cartService.calculateTotals();
}

export function validateCartItemUtilExport(item: CartItem): ValidationResult {
  return cartService.validate(item);
}

export function syncCart(): Promise<void> {
  return cartService.sync();
}

export function persistCart(): void {
  cartService.persist();
}

export function applyCartCoupon(coupon: Coupon): void {
  cartService.applyCoupon(coupon);
}

export function removeCartCoupon(): void {
  cartService.removeCoupon();
}

export function getCartCoupon(): Coupon | null {
  return cartService.getCoupon();
}

export function getCartItemCount(): number {
  return cartService.getItemCount();
}

export function isCartEmpty(): boolean {
  return cartService.isEmpty();
}

export function subscribeToCart(listener: () => void): () => void {
  return cartService.subscribe(listener);
}
