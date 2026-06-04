"use client";
/**
 * SearchModal — AI-Powered Search Experience
 * Algolia-level UX with Claude semantic intent
 * Features: debounced AI search, categories, recent searches, trending
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Tag, Clock, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { useUIStore } from "@/store/index";
import { formatPrice } from "@/utils/format";

const TRENDING = ["Sony WH-1000XM5", "Nike Air Max", "iPhone accessories", "Djellaba marocaine", "Argan oil"];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return debounced;
}

export function SearchModal() {
  const { searchOpen, closeSearch, addRecentSearch, recentSearches } = useUIStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiIntent, setAiIntent] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 280);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery(""); setResults(null); setAiIntent(null);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeSearch(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    if (debouncedQuery.length < 2) { setResults(null); setAiIntent(null); return; }
    setLoading(true);
    fetch(`/api/ai/search?q=${encodeURIComponent(debouncedQuery)}&limit=8&ai=true`)
      .then(r => r.json())
      .then(data => {
        setResults(data);
        if (data.intent?.category) setAiIntent(`Searching in: ${data.intent.category}`);
        else if (data.intent?.priceRange?.max) setAiIntent(`Budget: under ${data.intent.priceRange.max} MAD`);
        else setAiIntent(null);
      })
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    addRecentSearch(q.trim());
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }, [addRecentSearch, closeSearch, router]);

  const handleProductClick = useCallback((slug: string) => {
    closeSearch();
    router.push(`/products/${slug}`);
  }, [closeSearch, router]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={closeSearch} />
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
            <div className="bg-card border border-border rounded-2xl shadow-luxury-lg overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                {loading ? <Loader2 className="w-5 h-5 text-brand-500 animate-spin flex-shrink-0" />
                  : <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                <input ref={inputRef} type="search" value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSearch(query); }}
                  placeholder="Search products, brands, categories..."
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" />
                {query && (
                  <button onClick={() => { setQuery(""); setResults(null); }} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={closeSearch} className="text-xs text-muted-foreground border border-border rounded-lg px-2 py-1 hover:bg-muted transition-colors hidden sm:block">
                  ESC
                </button>
              </div>

              {/* AI intent badge */}
              <AnimatePresence>
                {aiIntent && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="px-4 py-2 bg-brand-50 dark:bg-brand-900/20 border-b border-border">
                    <div className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI detected: {aiIntent}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="max-h-[60vh] overflow-y-auto">
                {/* Results */}
                {results && (results.results?.length > 0 || results.categories?.length > 0) ? (
                  <div className="p-2">
                    {/* Categories */}
                    {results.categories?.length > 0 && (
                      <div className="mb-2">
                        <p className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Categories</p>
                        {results.categories.map((cat: any) => (
                          <button key={cat.id} onClick={() => handleSearch(cat.slug)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left group">
                            <div className="w-8 h-8 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                              {cat.image && <Image src={cat.image} alt={cat.name} width={32} height={32} className="object-cover w-full h-full" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium">{cat.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">{cat._count?.products} products</span>
                            </div>
                            <Tag className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Products */}
                    {results.results?.length > 0 && (
                      <div>
                        <p className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Products</p>
                        {results.results.slice(0, 6).map((product: any) => (
                          <button key={product.id} onClick={() => handleProductClick(product.slug)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left group">
                            <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                              {product.images?.[0] && <Image src={product.images[0]} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                            </div>
                            <span className="text-sm font-semibold text-brand-600 flex-shrink-0">{formatPrice(product.price)}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* View all */}
                    {results.total > 6 && (
                      <button onClick={() => handleSearch(query)}
                        className="w-full flex items-center justify-center gap-2 mt-2 py-3 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-colors">
                        View all {results.total} results for "{query}"
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : query.length >= 2 && !loading ? (
                  <div className="p-8 text-center">
                    <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium">No results for "{query}"</p>
                    <p className="text-xs text-muted-foreground mt-1">Try different keywords or browse categories</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {/* Recent searches */}
                    {recentSearches?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent</p>
                        <div className="space-y-1">
                          {recentSearches.slice(0, 4).map((s: string) => (
                            <button key={s} onClick={() => handleSearch(s)}
                              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left text-sm group">
                              <Clock className="w-4 h-4 text-muted-foreground" />{s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Trending */}
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trending</p>
                      <div className="flex flex-wrap gap-2">
                        {TRENDING.map((t) => (
                          <button key={t} onClick={() => handleSearch(t)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-muted-foreground/20 transition-colors">
                            <TrendingUp className="w-3 h-3 text-brand-500" />{t}
                          </button>
                        ))}
                      </div>
                    </div>
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
