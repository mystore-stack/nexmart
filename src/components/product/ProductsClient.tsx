"use client";
// src/components/product/ProductsClient.tsx — Moroccan Luxury
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X, Search, Star, Sparkles } from "lucide-react";
import { ProductGrid } from "./ProductCard";
import type { Category, Product, ProductSortOption } from "@/types";

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "relevance", label: "Pertinence" },
  { value: "newest", label: "Plus récent" },
  { value: "popular", label: "Plus populaire" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "rating", label: "Mieux noté" },
  { value: "discount", label: "Meilleures offres" },
];

interface Props {
  categories: Category[];
  maxPrice: number;
  searchParams: Record<string, string | string[] | undefined>;
}

export function ProductsClient({ categories, maxPrice, searchParams: initialSearchParams }: Props) {
  const searchParamsHook = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [selectedCategorySlug, setSelectedCategorySlug] = useState(
    (initialSearchParams?.category as string) || searchParamsHook.get("category") || ""
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<ProductSortOption>((initialSearchParams?.sort as ProductSortOption) || "relevance");

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    const cat = selectedCategorySlug || searchParamsHook.get("category");
    if (cat) params.set("category", cat);
    if (priceRange[0] > 0) params.set("minPrice", String(priceRange[0]));
    if (priceRange[1] < maxPrice) params.set("maxPrice", String(priceRange[1]));
    if (sort && sort !== "relevance") params.set("sort", sort);
    const q = searchParamsHook.get("q") || searchParamsHook.get("search");
    if (q) params.set("q", q);
    if (selectedRating > 0) params.set("rating", String(selectedRating));
    if (inStockOnly) params.set("inStock", "true");
    if (searchParamsHook.get("sale") === "true") params.set("sale", "true");
    const brand = searchParamsHook.get("brand");
    if (brand) params.set("brand", brand);
    if (initialSearchParams?.sale === "true" && !searchParamsHook.get("sale")) params.set("sale", "true");
    if (initialSearchParams?.brand && !brand) params.set("brand", String(initialSearchParams.brand));
    return params;
  }, [selectedCategorySlug, priceRange, sort, maxPrice, selectedRating, inStockOnly, searchParamsHook, initialSearchParams]);

  const fetchProducts = useCallback(async (reset = false) => {
    setLoading(true);
    if (reset) pageRef.current = 1;
    const params = buildQuery();
    params.set("page", String(pageRef.current));
    params.set("limit", "24");
    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        const fetched = Array.isArray(data.products) ? data.products : [];
        setProducts((prev) => (reset ? fetched : [...prev, ...fetched]));
        setTotal(data.pagination?.total ?? 0);
        setHasMore(data.pagination?.hasNext ?? false);
        pageRef.current += 1;
      }
    } catch { console.error("Failed to fetch products"); }
    finally { setLoading(false); }
  }, [buildQuery]);

  useEffect(() => { fetchProducts(true); }, [selectedCategorySlug, priceRange, selectedRating, inStockOnly, sort, searchParamsHook, fetchProducts]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) fetchProducts(false);
    }, { threshold: 0.5 });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchProducts]);

  const activeFiltersCount = [selectedCategorySlug, priceRange[0] > 0 || priceRange[1] < maxPrice, selectedRating > 0, inStockOnly].filter(Boolean).length;
  const clearFilters = () => { setSelectedCategorySlug(""); setPriceRange([0, maxPrice]); setSelectedRating(0); setInStockOnly(false); };

  const FilterSidebar = () => (
    <div className="sticky top-[6rem] space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Filtres</h2>
        {activeFiltersCount > 0 && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-bold text-brand-700 dark:text-brand-400 hover:text-brand-600">
            <X className="h-3 w-3" /> Tout effacer ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Category */}
      <div className="rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card p-4 space-y-2"
        style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
        <h3 className="section-label text-[10px] mb-3">Catégories</h3>
        <button onClick={() => setSelectedCategorySlug("")}
          className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${!selectedCategorySlug ? "bg-brand-700 text-white font-bold" : "hover:bg-muted"}`}>
          Toutes les catégories
        </button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setSelectedCategorySlug(cat.slug)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${selectedCategorySlug === cat.slug ? "bg-brand-700 text-white font-bold" : "hover:bg-muted"}`}>
            <span>{cat.name}</span>
            {cat._count && <span className={`text-xs ${selectedCategorySlug === cat.slug ? "text-white/60" : "text-muted-foreground"}`}>{cat._count.products}</span>}
          </button>
        ))}
      </div>

      {/* Price */}
      <div className="rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card p-4 space-y-4"
        style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
        <h3 className="section-label text-[10px]">Fourchette de prix</h3>
        <input type="range" min={0} max={maxPrice} value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-brand-700" />
        <div className="flex items-center gap-2">
          <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            min={0} max={priceRange[1]} className="input py-1.5 text-sm w-full" placeholder="Min" />
          <span className="text-muted-foreground">—</span>
          <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            min={priceRange[0]} max={maxPrice} className="input py-1.5 text-sm w-full" placeholder="Max" />
        </div>
      </div>

      {/* Rating */}
      <div className="rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card p-4 space-y-2"
        style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
        <h3 className="section-label text-[10px] mb-3">Note minimum</h3>
        {[4, 3, 2, 1].map((stars) => (
          <button key={stars} onClick={() => setSelectedRating(selectedRating === stars ? 0 : stars)}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${selectedRating === stars ? "bg-brand-700 text-white font-bold" : "hover:bg-muted"}`}>
            <div className="flex">
              {[1,2,3,4,5].map((s) => <Star key={s} className={`h-3.5 w-3.5 ${s <= stars ? "fill-gold-400 text-gold-400" : "text-muted-foreground/25"}`} />)}
            </div>
            <span>& Plus</span>
          </button>
        ))}
      </div>

      {/* Stock */}
      <div className="flex items-center gap-3 rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card p-4"
        style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
        <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all cursor-pointer ${inStockOnly ? "border-brand-700 bg-brand-700" : "border-border"}`}
          onClick={() => setInStockOnly(!inStockOnly)}>
          {inStockOnly && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
        </div>
        <label className="cursor-pointer text-sm font-semibold" onClick={() => setInStockOnly(!inStockOnly)}>
          En stock uniquement
        </label>
      </div>
    </div>
  );

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className={`${filtersOpen ? "block" : "hidden"} lg:block w-64 flex-shrink-0`}>
        <FilterSidebar />
      </aside>

      {/* Product area */}
      <div className="min-w-0 flex-1">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className="btn-outline flex items-center gap-2 px-4 text-sm h-10 lg:hidden">
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {activeFiltersCount > 0 && <span className="badge badge-emerald">{activeFiltersCount}</span>}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {!loading && (
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-gold-500" />
                {new Intl.NumberFormat("fr-MA").format(total)} produits
              </span>
            )}
            <div className="relative">
              <select value={sort} onChange={(e) => setSort(e.target.value as ProductSortOption)}
                className="input h-10 appearance-none cursor-pointer pr-8 text-sm min-w-[190px]">
                {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <ProductGrid products={products} loading={loading && products.length === 0} columns={3} />

        {!loading && products.length === 0 && (
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gold-200/50 dark:border-gold-800/30 py-20 text-center">
            <div className="absolute inset-0 moroccan-pattern-bg opacity-5" />
            <Search className="relative mb-4 h-12 w-12 text-muted-foreground/20" />
            <h3 className="relative font-display text-xl font-semibold">Aucun produit trouvé</h3>
            <p className="relative mt-2 max-w-sm text-sm text-muted-foreground">Essayez de modifier vos filtres ou élargissez votre recherche.</p>
            <button onClick={clearFilters} className="relative mt-6 btn btn-primary h-10 px-6 text-sm">
              Effacer les filtres
            </button>
          </div>
        )}

        {(hasMore || loading) && products.length > 0 && (
          <div ref={loadMoreRef} className="mt-10 flex justify-center">
            {loading && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="h-5 w-5 rounded-full border-2 border-brand-500/30 border-t-brand-600 animate-spin" />
                Chargement en cours…
              </div>
            )}
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <div className="py-10 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-400/40" />
              <p className="text-sm text-muted-foreground font-medium">{total} produits chargés</p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-400/40" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
