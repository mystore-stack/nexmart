"use client";
// src/components/layout/SearchModal.tsx — Moroccan Luxury Search
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, TrendingUp, ArrowRight, Tag } from "lucide-react";
import { useUIStore } from "@/store/index";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/format";
import { trackAiEvent } from "@/lib/ai/client-events";

const TRENDING = ["Artisanat marocain", "Nike Air Max", "Casques audio", "Décoration maison", "MacBook Pro"];

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
      setTimeout(() => inputRef.current?.focus(), 120);
      setQuery(""); setResults(null);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!query || query.length < 2) { setResults(null); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
        const data = await res.json();
        if (data.success) setResults(data.data ?? data);
      } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    addRecentSearch(q.trim());
    trackAiEvent({ type: "SEARCH", metadata: { query: q.trim(), source: "search_modal" } });
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    closeSearch();
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-moroccan-navy/60 backdrop-blur-md"
            onClick={closeSearch}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-[88px] left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4 sm:px-0"
          >
            <div className="overflow-hidden rounded-3xl border border-gold-200/50 dark:border-gold-800/30 bg-white dark:bg-card shadow-[0_32px_80px_rgba(15,23,42,0.22)]"
              style={{ boxShadow: "0 32px 80px rgba(15,23,42,0.22), 0 0 0 1px rgba(212,175,55,0.12)" }}>

              {/* Gold top line */}
              <div className="h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

              {/* Search input row */}
              <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
                <Search className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
                  placeholder="Rechercher des produits, marques, catégories..."
                  className="flex-1 bg-transparent py-1 text-base outline-none placeholder:text-muted-foreground"
                />
                {loading && <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-brand-500/30 border-t-brand-600 animate-spin" />}
                {query && (
                  <button onClick={() => { setQuery(""); setResults(null); inputRef.current?.focus(); }}
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button onClick={closeSearch} className="flex-shrink-0 rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
                  Esc
                </button>
              </div>

              {/* Results / suggestions */}
              <div className="max-h-[60vh] overflow-y-auto">
                {!query && (
                  <div className="p-5 space-y-5">
                    {recentSearches.length > 0 && (
                      <div>
                        <p className="section-label mb-3 text-[10px]">
                          <Clock className="h-3 w-3 inline mr-1" /> Recherches récentes
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.slice(0, 5).map((term) => (
                            <button key={term} onClick={() => handleSearch(term)}
                              className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3 py-1.5 text-sm hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-all">
                              <Clock className="h-3 w-3 text-muted-foreground" /> {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="section-label mb-3 text-[10px]">
                        <TrendingUp className="h-3 w-3 inline mr-1" /> Tendances
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {TRENDING.map((term) => (
                          <button key={term} onClick={() => handleSearch(term)}
                            className="flex items-center gap-1.5 rounded-xl border border-gold-200/40 bg-gold-50/60 dark:bg-gold-900/10 dark:border-gold-800/20 px-3 py-1.5 text-sm hover:border-gold-400/60 hover:bg-gold-100 dark:hover:bg-gold-900/30 transition-all">
                            <TrendingUp className="h-3 w-3 text-gold-600" /> {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {results && (
                  <div className="p-2">
                    {results.suggestions?.length > 0 && (
                      <div className="mb-2">
                        {results.suggestions.map((s: string) => (
                          <button key={s} onClick={() => handleSearch(s)}
                            className="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-700 dark:hover:text-brand-400 transition-all">
                            <Search className="h-4 w-4 text-muted-foreground group-hover:text-brand-600" />
                            <span dangerouslySetInnerHTML={{ __html: s.replace(new RegExp(`(${query})`, "gi"), "<strong class='text-brand-700 dark:text-brand-400'>$1</strong>") }} />
                            <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}

                    {results.categories?.length > 0 && (
                      <div className="mb-3">
                        <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gold-600 dark:text-gold-500">Catégories</p>
                        {results.categories.map((cat: any) => (
                          <Link key={cat.id} href={`/products?category=${cat.slug}`} onClick={closeSearch}
                            className="flex items-center gap-3 rounded-xl px-4 py-2.5 hover:bg-muted transition-all">
                            <Tag className="h-4 w-4 text-brand-600" />
                            <span className="flex-1 text-sm font-medium">{cat.name}</span>
                            <span className="text-xs text-muted-foreground">{cat._count?.products} produits</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {results.products?.length > 0 && (
                      <div>
                        <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gold-600 dark:text-gold-500">Produits</p>
                        {results.products.slice(0, 5).map((product: any) => (
                          <Link key={product.id} href={`/products/${product.slug}`} onClick={closeSearch}
                            className="flex items-center gap-3 rounded-xl px-4 py-2.5 hover:bg-muted transition-all group">
                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-gold-200/30 bg-muted">
                              <Image src={product.images?.[0] || "/placeholder.jpg"} alt={product.name} fill className="object-cover" sizes="48px" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">{product.name}</p>
                              <p className="text-xs text-brand-700 dark:text-brand-400 font-bold">{formatPrice(product.price)}</p>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {query && (
                      <button onClick={() => handleSearch(query)}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-bold text-white hover:bg-brand-600 transition-all hover:shadow-brand">
                        <Search className="h-4 w-4" />
                        Voir tous les résultats pour « {query} »
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Gold bottom line */}
              <div className="h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
