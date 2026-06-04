"use client";
// src/components/layout/SearchModal.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, TrendingUp, ArrowRight, Tag } from "lucide-react";
import { useUIStore } from "@/store/index";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/format";

const TRENDING = ["iPhone 15", "Nike Air Max", "Sony Headphones", "Levi's Jeans", "MacBook Pro"];

export function SearchModal() {
  const { searchOpen, closeSearch, recentSearches, addRecentSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const router = useRouter();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults(null);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!query || query.length < 2) { setResults(null); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=autocomplete`);
        const data = await res.json();
        if (data.success) setResults(data.data);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = (q: string) => {
    const term = q.trim();
    if (!term) return;
    addRecentSearch(term);
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch(query);
    if (e.key === "Escape") closeSearch();
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeSearch}
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl mx-4"
          >
            <div className="bg-background border border-border rounded-2xl shadow-luxury-lg overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products, brands, categories..."
                  className="flex-1 text-base bg-transparent border-0 outline-none placeholder:text-muted-foreground"
                  autoComplete="off"
                />
                {loading && (
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                )}
                {query && (
                  <button onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button onClick={closeSearch} className="btn-ghost p-1.5 ml-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {!query && (
                  <div className="p-5 space-y-5">
                    {recentSearches.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" /> Recent Searches
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.slice(0, 5).map((term) => (
                            <button
                              key={term}
                              onClick={() => handleSearch(term)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm transition-colors"
                            >
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" /> Trending
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {TRENDING.map((term) => (
                          <button
                            key={term}
                            onClick={() => handleSearch(term)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm transition-colors"
                          >
                            <TrendingUp className="w-3 h-3 text-brand-500" />
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {results && (
                  <div className="p-2">
                    {/* Suggestions */}
                    {results.suggestions?.length > 0 && (
                      <div className="mb-2">
                        {results.suggestions.map((s: string) => (
                          <button
                            key={s}
                            onClick={() => handleSearch(s)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted transition-colors text-left text-sm group"
                          >
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <span dangerouslySetInnerHTML={{
                              __html: s.replace(new RegExp(`(${query})`, "gi"), "<strong>$1</strong>"),
                            }} />
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Categories */}
                    {results.categories?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-2">
                          Categories
                        </p>
                        {results.categories.map((cat: any) => (
                          <Link
                            key={cat.id}
                            href={`/products?categoryId=${cat.id}`}
                            onClick={closeSearch}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted transition-colors"
                          >
                            <Tag className="w-4 h-4 text-brand-500" />
                            <span className="text-sm font-medium">{cat.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{cat._count?.products} products</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Products */}
                    {results.products?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-2">
                          Products
                        </p>
                        {results.products.slice(0, 5).map((product: any) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={closeSearch}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted transition-colors"
                          >
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <Image
                                src={product.images[0] || "/placeholder.jpg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* View all */}
                    {query && (
                      <button
                        onClick={() => handleSearch(query)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-2 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        <Search className="w-4 h-4" />
                        See all results for {`"${query}"` }
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
