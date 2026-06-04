// src/store/wishlist.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { WishlistStore, WishlistItem, Product } from "@/types";
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

      hasItem: (productId: string) => {
        return get().items.some((i) => i.productId === productId);
      },

      syncWithServer: async (userId: string) => {
        try {
          const res = await fetch("/api/wishlist");
          if (res.ok) {
            const data = await res.json();
            set((state) => { state.items = data.data || []; });
          }
        } catch {}
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

// src/store/ui.ts
import { create as createUI } from "zustand";
import { persist as persistUI } from "zustand/middleware";

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

export const useUIStore = createUI<UIStore>()(
  persistUI(
    (set, get) => ({
      theme: "light",
      searchOpen: false,
      mobileMenuOpen: false,
      recentSearches: [],

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      setTheme: (theme) => set({ theme }),
      openSearch: () => set({ searchOpen: true }),
      closeSearch: () => set({ searchOpen: false }),
      toggleMobileMenu: () =>
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
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

// src/store/auth.ts
import { create as createAuth } from "zustand";
import { persist as persistAuth } from "zustand/middleware";
import type { User } from "@/types";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = createAuth<AuthStore>()(
  persistAuth(
    (set) => ({
      user: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),

      logout: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        set({ user: null });
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },
    }),
    {
      name: "nexmart-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
