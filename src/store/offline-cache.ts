import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CachedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  stock?: number;
  rating?: number;
  reviewCount?: number;
  viewedAt: string;
}

interface OfflineCacheStore {
  products: CachedProduct[];
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  cacheProduct: (product: Omit<CachedProduct, "viewedAt">) => void;
  clearCache: () => void;
}

export const useOfflineCacheStore = create<OfflineCacheStore>()(
  persist(
    (set, get) => ({
      products: [],
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      setIsOnline: (isOnline) => set({ isOnline }),
      cacheProduct: (product) => {
        const existing = get().products.filter((p) => p.id !== product.id);
        const updated = [
          { ...product, viewedAt: new Date().toISOString() },
          ...existing,
        ].slice(0, 30); // Keep max 30 cached items
        set({ products: updated });
      },
      clearCache: () => set({ products: [] }),
    }),
    {
      name: "nexmart-offline-cache",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
    }
  )
);
