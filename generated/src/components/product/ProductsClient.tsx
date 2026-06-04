"use client";
// src/components/product/ProductsClient.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X, Search, Star } from "lucide-react";
import { ProductGrid } from "./ProductCard";
import type { Category, Product, ProductSortOption } from "@/types";

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

interface Props {
  categories: Category[];
  maxPrice: number;
  searchParams: Record<string, string | string[] | undefined>;
}

export function ProductsClient({ categories, maxPrice, searchParams: initialSearchParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsHook = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState(
    (initialSearchParams?.category as string) || ""
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<ProductSortOption>(
    (initialSearchParams?.sort as ProductSortOption) || "relevance"
  );

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("categoryId", selectedCategory);
    if (priceRange[0] > 0) params.set("minPrice", String(priceRange[0]));
    if (priceRange[1] < maxPrice) params.set("maxPrice", String(priceRange[1]));
    if (selectedRating > 0) params.set("rating", String(selectedRating));
    if (inStockOnly) params.set("inStock", "true");
    if (sort && sort !== "relevance") params.set("sort", sort);
    const q = searchParamsHook.get("q");
    if (q) params.set("search", q);
    return params;
  }, [selectedCategory, priceRange, selectedRating, inStockOnly, sort, maxPrice, searchParamsHook]);

  const fetchProducts = useCallback(async (reset = false) => {
    setLoading(true);
    const params = buildQuery();
    const currentPage = reset ? 1 : page;
    params.set("page", String(currentPage));
    params.set("limit", "24");

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts((prev) => reset ? data.data : [...prev, ...data.data]);
        setTotal(data.pagination.total);
        setHasMore(data.pagination.hasNext);
        if (!reset) setPage((p) => p + 1);
      }
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [buildQuery, page]);

  // Initial fetch and filter changes
  useEffect(() => {
    setPage(1);
    fetchProducts(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, priceRange, selectedRating, inStockOnly, sort, searchParamsHook]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProducts(false);
        }
      },
      { threshold: 0.5 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchProducts]);

  const activeFiltersCount = [
    selectedCategory,
    priceRange[0] > 0 || priceRange[1] < maxPrice,
    selectedRating > 0,
    inStockOnly,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory("");
    setPriceRange([0, maxPrice]);
    setSelectedRating(0);
    setInStockOnly(false);
  };

  return (
    <div className="flex gap-8">
      {/* Sidebar Filters */}
      <aside className={`${filtersOpen ? "block" : "hidden"} lg:block w-64 flex-shrink-0`}>
        <div className="sticky top-24 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Filters</h2>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Category</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory("")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !selectedCategory ? "bg-foreground text-background font-medium" : "hover:bg-muted"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    selectedCategory === cat.id ? "bg-foreground text-background font-medium" : "hover:bg-muted"
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat._count && (
                    <span className={`text-xs ${selectedCategory === cat.id ? "text-background/60" : "text-muted-foreground"}`}>
                      {cat._count.products}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Price Range</h3>
            <div className="space-y-4">
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-foreground"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  min={0}
                  max={priceRange[1]}
                  className="input py-1.5 text-sm w-full"
                  placeholder="Min"
                />
                <span className="text-muted-foreground text-sm">—</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  min={priceRange[0]}
                  max={maxPrice}
                  className="input py-1.5 text-sm w-full"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          {/* Rating filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Rating</h3>
            <div className="space-y-1.5">
              {[4, 3, 2, 1].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setSelectedRating(selectedRating === stars ? 0 : stars)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedRating === stars ? "bg-foreground text-background" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= stars ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <span>& Up</span>
                </button>
              ))}
            </div>
          </div>

          {/* In Stock */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="inStock"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded accent-foreground"
            />
            <label htmlFor="inStock" className="text-sm font-medium cursor-pointer">
              In Stock Only
            </label>
          </div>
        </div>
      </aside>

      {/* Product area */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="btn-outline py-2 px-4 text-sm flex items-center gap-2 lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="badge badge-brand">{activeFiltersCount}</span>
            )}
          </button>

          <span className="text-sm text-muted-foreground ml-auto">
            {loading ? "Loading..." : `${total.toLocaleString()} products`}
          </span>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductSortOption)}
              className="input py-2 text-sm pr-8 appearance-none cursor-pointer min-w-[180px]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <ProductGrid products={products} loading={loading && products.length === 0} columns={3} />

        {/* Load more trigger */}
        {(hasMore || loading) && products.length > 0 && (
          <div ref={loadMoreRef} className="mt-8 flex justify-center">
            {loading && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            All {total} products loaded
          </p>
        )}
      </div>
    </div>
  );
}
