"use client";
// src/components/product/SearchResultsClient.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { ProductGrid } from "./ProductCard";
import type { Product, Category } from "@/types";
import Link from "next/link";

interface Props { query: string }

export function SearchResultsClient({ query }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState(query);

  useEffect(() => {
    if (!query) { setLoading(false); return; }

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}&limit=24`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const payload = d.data ?? d;
          setProducts(payload.products || []);
          setCategories(payload.categories || []);
          setTotal(payload.total || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) router.push(`/search?q=${encodeURIComponent(input.trim())}`);
  };

  if (!query) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
          <Search className="w-10 h-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-bold mb-2">What are you looking for?</h2>
        <p className="text-muted-foreground mb-6">Search millions of products</p>
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search products, brands, categories..."
            className="input flex-1"
            autoFocus
          />
          <button type="submit" className="btn-primary px-5">Search</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input pl-10 pr-10"
            placeholder="Search products..."
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary px-5">Search</button>
      </form>

      {/* Category hits */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:border-foreground transition-all text-sm font-medium"
            >
              {cat.name}
              <span className="text-xs text-muted-foreground">({cat._count?.products})</span>
            </Link>
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {total > 0
            ? <>{new Intl.NumberFormat("fr-MA").format(total)} results for <strong className="text-foreground">&quot;{query}&quot;</strong></>
            : <>No results for <strong className="text-foreground">&quot;{query}&quot;</strong></>
          }
        </p>
      )}

      {/* Product grid */}
      {!loading && products.length === 0 && total === 0 ? (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Try different keywords, check your spelling, or browse our categories.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/products" className="btn-primary py-2.5 px-6">Browse All Products</Link>
            <Link href="/deals" className="btn-outline py-2.5 px-6">View Deals</Link>
          </div>
        </div>
      ) : (
        <ProductGrid products={products} loading={loading} columns={4} />
      )}
    </div>
  );
}
