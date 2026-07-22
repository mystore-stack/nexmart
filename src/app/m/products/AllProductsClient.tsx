"use client";
// src/app/m/products/AllProductsClient.tsx
import { useState, useMemo } from "react";
import Link from "next/link";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { FilterBar } from "@/components/mobile/FilterBar";
import { ProductCard } from "@/components/mobile/ProductCard";
import type { Product, ProductSortOption } from "@/types";

export function AllProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [sort, setSort] = useState<ProductSortOption>("popular");
  const [inStock, setInStock] = useState(false);

  const sorted = useMemo(() => {
    let list = inStock ? initialProducts.filter((p) => p.stock > 0) : [...initialProducts];
    switch (sort) {
      case "price_asc":  list.sort((a, b) => a.price - b.price); break;
      case "price_desc": list.sort((a, b) => b.price - a.price); break;
      case "rating":     list.sort((a, b) => b.rating - a.rating); break;
      case "newest":     list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      default:           list.sort((a, b) => b.soldCount - a.soldCount);
    }
    return list;
  }, [initialProducts, sort, inStock]);

  return (
    <MobileLayout>
      <header className="flex items-center gap-3 px-4 py-4 sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <Link href="/m" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center" aria-label="Back">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-display text-xl font-semibold text-foreground">All Products</h1>
      </header>

      <FilterBar sort={sort} onSortChange={setSort} inStock={inStock} onInStockChange={setInStock} />

      <div className="px-4 py-5">
        <div className="grid grid-cols-2 gap-3">
          {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </MobileLayout>
  );
}
