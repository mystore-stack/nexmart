"use client";
// src/app/m/categories/[slug]/ProductListingClient.tsx
import { useState, useMemo } from "react";
import Link from "next/link";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { FilterBar } from "@/components/mobile/FilterBar";
import { ProductCard } from "@/components/mobile/ProductCard";
import type { Category, Product, ProductSortOption } from "@/types";

interface Props {
  category: Category;
  initialProducts: Product[];
}

export function ProductListingClient({ category, initialProducts }: Props) {
  const [sort, setSort] = useState<ProductSortOption>("popular");
  const [inStock, setInStock] = useState(false);

  const sorted = useMemo(() => {
    let list = inStock ? initialProducts.filter((p) => p.stock > 0) : [...initialProducts];
    switch (sort) {
      case "price_asc":  list.sort((a, b) => a.price - b.price); break;
      case "price_desc": list.sort((a, b) => b.price - a.price); break;
      case "rating":     list.sort((a, b) => b.rating - a.rating); break;
      case "newest":     list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "discount":   list.sort((a, b) => {
        const da = a.comparePrice ? a.comparePrice - a.price : 0;
        const db = b.comparePrice ? b.comparePrice - b.price : 0;
        return db - da;
      }); break;
      default:           list.sort((a, b) => b.soldCount - a.soldCount);
    }
    return list;
  }, [initialProducts, sort, inStock]);

  return (
    <MobileLayout>
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <Link href="/m/categories" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0" aria-label="Back">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-semibold text-foreground truncate">{category.name}</h1>
          <p className="text-[11px] text-muted-foreground">{category._count?.products ?? sorted.length} products</p>
        </div>
      </header>

      {/* Filter bar */}
      <FilterBar sort={sort} onSortChange={setSort} inStock={inStock} onInStockChange={setInStock} />

      {/* Grid */}
      <div className="px-4 py-5">
        {sorted.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-sm">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
