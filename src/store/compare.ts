import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import toast from "react-hot-toast";

export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  rating?: number;
  reviewCount?: number;
  stock?: number;
  category?: { name: string } | string;
  brand?: { name: string } | string;
  tags?: string[];
}

interface CompareStore {
  items: CompareProduct[];
  addItem: (product: CompareProduct) => boolean;
  removeItem: (productId: string) => void;
  clear: () => void;
  hasItem: (productId: string) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { items } = get();
        if (items.some((i) => i.id === product.id)) {
          get().removeItem(product.id);
          return false;
        }
        if (items.length >= 4) {
          toast.error("Vous pouvez comparer au maximum 4 produits.");
          return false;
        }
        set({ items: [...items, product] });
        toast.success(`"${product.name.slice(0, 20)}..." ajouté au comparateur`);
        return true;
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.id !== productId) });
        toast("Produit retiré du comparateur");
      },
      clear: () => set({ items: [] }),
      hasItem: (productId) => get().items.some((i) => i.id === productId),
    }),
    {
      name: "nexmart-compare",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
    }
  )
);
