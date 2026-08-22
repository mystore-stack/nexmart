// src/hooks/useProducts.ts
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type { Product, ProductFilters, PaginatedResponse } from "@/types";

async function fetchProducts(filters: ProductFilters): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.rating) params.set("rating", String(filters.rating));
  if (filters.inStock) params.set("inStock", "true");
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  params.set("page", String(filters.page || 1));
  params.set("limit", String(filters.limit || 24));

  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data;
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 30_000,
  });
}

export function useInfiniteProducts(filters: Omit<ProductFilters, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: ["products-infinite", filters],
    queryFn: ({ pageParam = 1 }) => fetchProducts({ ...filters, page: pageParam as number }),
    getNextPageParam: (last) => last.pagination.hasNext ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30_000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) throw new Error("Product not found");
      const data = await res.json();
      return data.data as Product;
    },
    staleTime: 60_000,
    enabled: !!slug,
  });
}
