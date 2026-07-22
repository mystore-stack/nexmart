// src/store/cart.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { CartStore, CartItem, Product, ProductVariant, Coupon } from "@/types";
import toast from "react-hot-toast";

export const useCartStore = create<CartStore>()(
  persist(
    immer((set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,

      addItem: (product: Product, quantity = 1, variant?: ProductVariant) => {
        if (!product || !product.id) {
          console.error("[CART STORE] Invalid product - cannot add to cart:", product);
          toast.error("Invalid product - cannot add to cart");
          return;
        }

        set((state) => {
          const existingIndex = state.items.findIndex(
            (item: CartItem) =>
              item.productId === product.id &&
              item.variantId === (variant?.id || undefined)
          );

          if (existingIndex >= 0) {
            const newQty = state.items[existingIndex].quantity + quantity;
            const maxStock = variant?.stock ?? product.stock;
            state.items[existingIndex].quantity = Math.min(newQty, maxStock);
          } else {
            const newItem: CartItem = {
              id: `${product.id}-${variant?.id || "default"}-${Date.now()}`,
              productId: product.id,
              product,
              variantId: variant?.id,
              variant,
              quantity,
            };
            state.items.push(newItem);
          }
        });
        toast.success(`${product.name} added to cart`, {
          icon: "🛒",
          duration: 2000,
        });
        get().openCart();
        
        console.log("[CART STORE] Item added:", {
          productId: product.id,
          quantity,
          variantId: variant?.id,
          totalItems: get().items.length,
        });
      },

      removeItem: (itemId: string) => {
        set((state) => {
          state.items = state.items.filter((item: CartItem) => item.id !== itemId);
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        set((state) => {
          const item = state.items.find((i: CartItem) => i.id === itemId);
          if (!item || !item.product) {
            console.warn("[CART STORE] Invalid cart item in updateQuantity:", item);
            state.items = state.items.filter((i: CartItem) => i.id !== itemId);
            return;
          }

          if (quantity <= 0) {
            state.items = state.items.filter((i: CartItem) => i.id !== itemId);
          } else {
            const maxStock = item.variant?.stock ?? item.product.stock;
            item.quantity = Math.min(quantity, maxStock);
          }
        });
      },

      clearCart: () => {
        set((state) => {
          state.items = [];
          state.coupon = null;
        });
      },

      toggleCart: () => set((state) => { state.isOpen = !state.isOpen; }),
      openCart: () => set((state) => { state.isOpen = true; }),
      closeCart: () => set((state) => { state.isOpen = false; }),

      applyCoupon: (coupon: Coupon) => {
        set((state) => { state.coupon = coupon; });
        toast.success(`Coupon "${coupon.code}" applied!`);
      },

      removeCoupon: () => {
        set((state) => { state.coupon = null; });
        toast("Coupon removed");
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum: number, item: CartItem) => {
          if (!item?.product) {
            console.warn("[CART STORE] Invalid cart item - product is undefined:", item);
            return sum;
          }
          const price = item.variant?.price ?? item.product.price;
          return sum + (price || 0) * item.quantity;
        }, 0);
      },

      getDiscount: () => {
        const { coupon, getSubtotal } = get();
        if (!coupon) return 0;
        const subtotal = getSubtotal();
        if (coupon.minOrder && subtotal < coupon.minOrder) return 0;

        let discount = 0;
        if (coupon.type === "PERCENTAGE") {
          discount = (subtotal * coupon.value) / 100;
        } else {
          discount = coupon.value;
        }
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
        return Math.min(discount, subtotal);
      },

      getTotal: () => {
        const { getSubtotal, getDiscount } = get();
        return Math.max(0, getSubtotal() - getDiscount());
      },

      syncWithServer: async (userId: string) => {
        try {
          const { items } = get();
          // Filter out invalid items before syncing
          const validItems = items.filter((item: CartItem) => item?.product && item.product.id);
          
          if (validItems.length !== items.length) {
            console.warn("[CART STORE] Filtered out invalid items before sync:", {
              originalCount: items.length,
              validCount: validItems.length,
            });
            set((state) => { state.items = validItems; });
          }
          
          console.log("[CART STORE] Syncing to server:", {
            userId,
            itemCount: validItems.length,
          });
          const res = await fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: validItems }),
          });
          const data = await res.json();
          console.log("[CART STORE] Sync response:", {
            success: data.success,
            returnedItemCount: data.items?.length || 0,
          });
        } catch (error) {
          console.error("[CART STORE] Sync error:", error);
        }
      },
    })),
    {
      name: "nexmart-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    }
  )
);
