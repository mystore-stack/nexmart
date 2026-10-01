// src/store/index.ts — wishlist, UI, auth
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { WishlistStore, WishlistItem, Product, User } from "@/types";
import toast from "react-hot-toast";

// Global logout state lock to prevent race conditions
let isLoggingOut = false;

// Export function to check logout state (for AuthProvider)
export const checkIsLoggingOut = () => isLoggingOut;

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
  // NO PERSISTENCE - State is derived from NextAuth only
  // localStorage persistence was causing competing auth state
  // DEPRECATED: Components should use useSession() directly from next-auth/react
  // This store is kept for backward compatibility but should be migrated away
  (set) => ({
    user: null,
    isLoading: false,
    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
    logout: async () => {
      const requestId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`[AUTH DEBUG CLIENT] ${new Date().toISOString()} [${requestId}] LOGOUT_CLICK (DEPRECATED STORE)`);
      console.log(`[AUTH DEBUG CLIENT] ${new Date().toISOString()} [${requestId}] LOGOUT_METHOD: nextauth-signout-direct`);

      // Prevent concurrent logout attempts
      if (isLoggingOut) {
        console.log(`[AUTH DEBUG CLIENT] ${new Date().toISOString()} [${requestId}] LOGOUT_ALREADY_IN_PROGRESS - skipping`);
        return;
      }

      isLoggingOut = true;
      console.log(`[AUTH DEBUG CLIENT] ${new Date().toISOString()} [${requestId}] LOGOUT_STATE_LOCKED`);

      console.log("[AUTH STORE LOGOUT] === LOGOUT FLOW START ===");

      // Clear local state first
      set({ user: null });
      console.log("[AUTH STORE LOGOUT] Local state cleared");
      console.log(`[AUTH DEBUG CLIENT] ${new Date().toISOString()} [${requestId}] LOCAL_STATE_CLEARED`);

      // Use NextAuth signOut directly (no API endpoint needed)
      try {
        console.log("[AUTH STORE LOGOUT] Calling NextAuth signOut directly");
        console.log(`[AUTH DEBUG CLIENT] ${new Date().toISOString()} [${requestId}] LOGOUT_REQUEST_START`);

        // Import signOut dynamically to avoid circular dependency
        const { signOut } = await import("next-auth/react");
        await signOut({ redirect: false });

        console.log("[AUTH STORE LOGOUT] NextAuth signOut completed");
        console.log(`[AUTH DEBUG CLIENT] ${new Date().toISOString()} [${requestId}] LOGOUT_REQUEST_SUCCESS`);
      } catch (error) {
        console.error("[AUTH STORE LOGOUT] Logout error:", error);
      }

      console.log("[AUTH STORE LOGOUT] === LOGOUT FLOW END ===");
      console.log(`[AUTH DEBUG CLIENT] ${new Date().toISOString()} [${requestId}] LOGOUT_COMPLETE`);

      // Release logout lock
      isLoggingOut = false;
      console.log(`[AUTH DEBUG CLIENT] ${new Date().toISOString()} [${requestId}] LOGOUT_STATE_UNLOCKED`);

      // Redirect to login
      console.log(`[AUTH DEBUG CLIENT] ${new Date().toISOString()} [${requestId}] LOGOUT_REDIRECT`);
      window.location.href = "/login";
    },
  })
);

export { useCartStore } from "./cart";
