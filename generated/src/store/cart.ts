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
      },

      removeItem: (itemId: string) => {
        set((state) => {
          state.items = state.items.filter((item: CartItem) => item.id !== itemId);
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        set((state) => {
          const item = state.items.find((i: CartItem) => i.id === itemId);
          if (!item) return;

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
          const price = item.variant?.price ?? item.product.price;
          return sum + price * item.quantity;
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
          await fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
          });
        } catch {}
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
