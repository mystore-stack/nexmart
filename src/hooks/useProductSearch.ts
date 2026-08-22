import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "./useDebounce";

export interface ProductSearchResult {
  id: string;
  name: string;
  sku: string;
  images: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface UseProductSearchOptions {
  enabled?: boolean;
  debounceMs?: number;
  limit?: number;
  published?: boolean;
}

export function useProductSearch(options: UseProductSearchOptions = {}) {
  const {
    enabled = true,
    debounceMs = 300,
    limit = 20,
    published = true,
  } = options;

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const debouncedQuery = useDebounce(query, debounceMs);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(published && { published: "true" }),
      });

      if (searchQuery.trim()) {
        params.set("query", searchQuery.trim());
      }

      const response = await fetch(`/api/admin/cms/products/search?${params.toString()}`);

      console.log("[useProductSearch] Fetching with params:", params.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const payload = await response.json();

      console.log("[useProductSearch] FULL API DATA:", payload);
      console.log("[useProductSearch] PRODUCTS ARRAY:", payload.products);
      console.log("[useProductSearch] PRODUCTS LENGTH:", payload.products?.length || 0);
      console.log("[useProductSearch] DATA ARRAY:", payload.data);
      console.log("[useProductSearch] DATA LENGTH:", payload.data?.length || 0);

      const items = Array.isArray(payload?.products)
        ? payload.products
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      console.log("[useProductSearch] FINAL ITEMS:", items.length, "Total:", payload?.total);

      setProducts(items);
      setTotal(payload?.total || 0);
      setHasMore(payload?.hasMore || false);
    } catch (err) {
      console.error("Product search error:", err);
      setError(err instanceof Error ? err.message : "Failed to search products");
      setProducts([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [enabled, limit, published]);

  useEffect(() => {
    searchProducts(debouncedQuery);
  }, [debouncedQuery, searchProducts, enabled]);

  return {
    query,
    setQuery,
    products,
    loading,
    error,
    total,
    hasMore,
    refetch: () => searchProducts(debouncedQuery),
  };
}
