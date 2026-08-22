/**
 * Cart Storage
 * Isolated storage layer supporting multiple backends
 */

import type { CartItem, Coupon, CartStorage } from "./cart.types";
import { STORAGE_KEYS } from "./cart.constants";

/**
 * LocalStorage implementation
 */
export class LocalStorageCartStorage implements CartStorage {
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== "undefined";
  }

  getItems(): CartItem[] {
    if (!this.isClient) return [];

    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART_ITEMS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("[CART STORAGE] Error reading items from localStorage:", error);
      return [];
    }
  }

  setItems(items: CartItem[]): void {
    if (!this.isClient) return;

    try {
      localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error("[CART STORAGE] Error writing items to localStorage:", error);
    }
  }

  getCoupon(): Coupon | null {
    if (!this.isClient) return null;

    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART_COUPON);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("[CART STORAGE] Error reading coupon from localStorage:", error);
      return null;
    }
  }

  setCoupon(coupon: Coupon | null): void {
    if (!this.isClient) return;

    try {
      if (coupon) {
        localStorage.setItem(STORAGE_KEYS.CART_COUPON, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CART_COUPON);
      }
    } catch (error) {
      console.error("[CART STORAGE] Error writing coupon to localStorage:", error);
    }
  }

  clear(): void {
    if (!this.isClient) return;

    try {
      localStorage.removeItem(STORAGE_KEYS.CART_ITEMS);
      localStorage.removeItem(STORAGE_KEYS.CART_COUPON);
    } catch (error) {
      console.error("[CART STORAGE] Error clearing localStorage:", error);
    }
  }
}

/**
 * Session Storage implementation (for temporary cart during checkout)
 */
export class SessionStorageCartStorage implements CartStorage {
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== "undefined";
  }

  getItems(): CartItem[] {
    if (!this.isClient) return [];

    try {
      const data = sessionStorage.getItem(STORAGE_KEYS.CART_ITEMS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("[CART STORAGE] Error reading items from sessionStorage:", error);
      return [];
    }
  }

  setItems(items: CartItem[]): void {
    if (!this.isClient) return;

    try {
      sessionStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error("[CART STORAGE] Error writing items to sessionStorage:", error);
    }
  }

  getCoupon(): Coupon | null {
    if (!this.isClient) return null;

    try {
      const data = sessionStorage.getItem(STORAGE_KEYS.CART_COUPON);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("[CART STORAGE] Error reading coupon from sessionStorage:", error);
      return null;
    }
  }

  setCoupon(coupon: Coupon | null): void {
    if (!this.isClient) return;

    try {
      if (coupon) {
        sessionStorage.setItem(STORAGE_KEYS.CART_COUPON, JSON.stringify(coupon));
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.CART_COUPON);
      }
    } catch (error) {
      console.error("[CART STORAGE] Error writing coupon to sessionStorage:", error);
    }
  }

  clear(): void {
    if (!this.isClient) return;

    try {
      sessionStorage.removeItem(STORAGE_KEYS.CART_ITEMS);
      sessionStorage.removeItem(STORAGE_KEYS.CART_COUPON);
    } catch (error) {
      console.error("[CART STORAGE] Error clearing sessionStorage:", error);
    }
  }
}

/**
 * Memory Storage implementation (for server-side use)
 */
export class MemoryCartStorage implements CartStorage {
  private items: CartItem[] = [];
  private coupon: Coupon | null = null;

  getItems(): CartItem[] {
    return this.items;
  }

  setItems(items: CartItem[]): void {
    this.items = items;
  }

  getCoupon(): Coupon | null {
    return this.coupon;
  }

  setCoupon(coupon: Coupon | null): void {
    this.coupon = coupon;
  }

  clear(): void {
    this.items = [];
    this.coupon = null;
  }
}

/**
 * Storage factory - returns appropriate storage implementation
 */
export function createCartStorage(type: "local" | "session" | "memory" = "local"): CartStorage {
  switch (type) {
    case "local":
      return new LocalStorageCartStorage();
    case "session":
      return new SessionStorageCartStorage();
    case "memory":
      return new MemoryCartStorage();
    default:
      return new LocalStorageCartStorage();
  }
}

/**
 * Default storage instance (localStorage for client-side)
 */
export const cartStorage = createCartStorage("local");
