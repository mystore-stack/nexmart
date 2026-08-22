// src/store/index.ts — wishlist, UI, auth
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { signOut } from "next-auth/react";
import type { WishlistStore, WishlistItem, Product, User } from "@/types";
import toast from "react-hot-toast";

export const useWishlistStore = create<WishlistStore>()(
  persist(
    immer((set, get) => ({
      items: [],
      addItem: (product: Product) => {
        const exists = get().hasItem(product.id);
        if (exists) {
          get().removeItem(product.id);
          return;
        }
        set((state) => {
          state.items.push({
            id: `wl-${product.id}`,
            productId: product.id,
            product,
            createdAt: new Date().toISOString(),
          });
        });
        toast.success("Added to wishlist ❤️");
      },
      removeItem: (productId: string) => {
        set((state) => {
          state.items = state.items.filter((i: WishlistItem) => i.productId !== productId);
        });
        toast("Removed from wishlist");
      },
      hasItem: (productId: string) => get().items.some((i) => i.productId === productId),
      syncWithServer: async () => {
        try {
          const res = await fetch("/api/wishlist", { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            set((state) => {
              state.items = (data.items || []).map((row: { product: Product; productId: string }) => ({
                id: `wl-${row.productId}`,
                productId: row.productId,
                product: row.product,
                createdAt: new Date().toISOString(),
              }));
            });
          }
        } catch {
          /* offline */
        }
      },
    })),
    {
      name: "nexmart-wishlist",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
    }
  )
);

interface UIStore {
  theme: "light" | "dark";
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  recentSearches: string[];
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      searchOpen: false,
      mobileMenuOpen: false,
      recentSearches: [],
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
      setTheme: (theme) => set({ theme }),
      openSearch: () => set({ searchOpen: true }),
      closeSearch: () => set({ searchOpen: false }),
      toggleMobileMenu: () => set({ mobileMenuOpen: !get().mobileMenuOpen }),
      closeMobileMenu: () => set({ mobileMenuOpen: false }),
      addRecentSearch: (query: string) => {
        if (!query.trim()) return;
        set((state) => {
          const filtered = state.recentSearches.filter((s) => s !== query);
          return { recentSearches: [query, ...filtered].slice(0, 10) };
        });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "nexmart-ui",
      partialize: (state) => ({ theme: state.theme, recentSearches: state.recentSearches }),
    }
  )
);

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } catch {
          /* continue */
        }
        await signOut({ callbackUrl: "/login" });
        set({ user: null });
      },
    }),
    {
      name: "nexmart-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export { useCartStore } from "./cart";
