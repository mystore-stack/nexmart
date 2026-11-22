"use client";
// src/components/catalog/CategoriesClient.tsx — Premium Mobile-First Categories Component
import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronRight,
  TrendingUp,
  Package,
  Grid3x3,
  SlidersHorizontal,
} from "lucide-react";

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  bannerImage?: string | null;
  order?: number;
  _count?: {
    products?: number;
  };
  children?: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    icon?: string | null;
    _count?: {
      products?: number;
    };
  }[];
}

interface CategoriesClientProps {
  categories: CategoryData[];
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Sort by product count for popularity
  const sortedByPopularity = useMemo(() => {
    return [...categories].sort(
      (a, b) => (b._count?.products || 0) - (a._count?.products || 0)
    );
  }, [categories]);

  // Top 6 popular categories for featured carousel/grid
  const popularCategories = useMemo(() => {
    return sortedByPopularity.slice(0, 6);
  }, [sortedByPopularity]);

  // Filtered categories based on search query
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((cat) => {
      const nameMatch = cat.name.toLowerCase().includes(query);
      const descMatch = (cat.description || "").toLowerCase().includes(query);
      const subcategoryMatch =
        cat.children?.some((child) => child.name.toLowerCase().includes(query)) || false;
      return nameMatch || descMatch || subcategoryMatch;
    });
  }, [categories, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F7F8F6] dark:bg-background pb-32 pt-2 sm:pt-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* ── 1. Compact & Elegant Categories Hero ────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#08765F] via-[#065A48] to-[#032C1E] text-white p-5 sm:p-7 shadow-sm">
          {/* Subtle geometric pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#D4AF37 1px, transparent 1px)`,
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative z-10 max-w-xl space-y-3">
            {/* Tag badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-emerald-100">
              <Sparkles className="w-3 h-3 text-[#F6E05E]" />
              <span>Catalogue Officiel NexMart</span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Découvrez nos catégories
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
              Explorez notre univers et trouvez facilement vos produits préférés.
            </p>

            {/* Modern Compact Search Input */}
            <div className="relative pt-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une catégorie..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-[#111A17] text-foreground border border-white/20 text-xs sm:text-sm placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── 2. Popular Categories Section ("Catégories populaires") ──────── */}
        {!searchQuery && popularCategories.length > 0 && (
          <section aria-labelledby="popular-categories-title" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#08765F] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2
                  id="popular-categories-title"
                  className="text-base sm:text-lg font-bold text-foreground tracking-tight"
                >
                  Catégories populaires
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#08765F] dark:text-emerald-400">
                Top tendances
              </span>
            </div>

            {/* Horizontal Swipe Carousel on Mobile, Responsive Grid on Desktop */}
            <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {popularCategories.map((category) => {
                const productCount = category._count?.products || 0;
                const categoryIcon = category.icon;

                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="min-w-[140px] sm:min-w-0 flex-1 bg-white dark:bg-[#111A17] border border-border/60 hover:border-[#08765F]/40 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group snap-start active:scale-95"
                  >
                    {/* Category Image Box */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#F7F8F6] dark:bg-muted/30 mb-2 overflow-hidden flex items-center justify-center p-2">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          sizes="(max-width: 640px) 80px, 96px"
                          className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : categoryIcon ? (
                        <span className="text-4xl">{categoryIcon}</span>
                      ) : (
                        <Layers className="w-8 h-8 text-[#08765F]/60" />
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-[#08765F] transition-colors">
                      {category.name}
                    </h3>

                    {/* Accurate count only when > 0 */}
                    {productCount > 0 ? (
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {productCount} {productCount > 1 ? "articles" : "article"}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#08765F] font-semibold mt-0.5">
                        Découvrir
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 3. All Categories Section ("Toutes les catégories") ──────────── */}
        <section aria-labelledby="all-categories-title" className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#08765F] flex items-center justify-center">
                <Grid3x3 className="w-4 h-4" />
              </div>
              <div>
                <h2
                  id="all-categories-title"
                  className="text-base sm:text-lg font-bold text-foreground tracking-tight"
                >
                  Toutes les catégories
                </h2>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {filteredCategories.length} {filteredCategories.length > 1 ? "catégories" : "catégorie"}
            </span>
          </div>

          {/* Empty search state */}
          {filteredCategories.length === 0 ? (
            <div className="bg-white dark:bg-[#111A17] border border-border/60 rounded-3xl p-8 text-center space-y-3">
              <Layers className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <h3 className="text-base font-bold text-foreground">
                Aucune catégorie trouvée
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Aucun résultat pour &ldquo;{searchQuery}&rdquo;. Essayez avec un autre mot-clé.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 px-4 py-2 rounded-xl bg-[#08765F] text-white text-xs font-semibold"
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            /* Responsive 2-column mobile grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {filteredCategories.map((category) => {
                const productCount = category._count?.products || 0;
                const subcategoryCount = category.children?.length || 0;
                const categoryIcon = category.icon;

                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="bg-white dark:bg-[#111A17] border border-border/60 hover:border-[#08765F]/40 rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group active:scale-[0.98]"
                  >
                    <div>
                      {/* Image Frame with Aspect Ratio */}
                      <div className="relative w-full aspect-square rounded-xl bg-[#F7F8F6] dark:bg-muted/30 mb-2.5 overflow-hidden flex items-center justify-center">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                            className="object-contain p-2.5 transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : categoryIcon ? (
                          <span className="text-5xl">{categoryIcon}</span>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#08765F]/10 text-[#08765F] flex items-center justify-center">
                            <Layers className="w-6 h-6" />
                          </div>
                        )}

                        {/* Top Category Badge for Popular */}
                        {productCount >= 4 && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#08765F] text-white text-[9px] font-bold shadow-sm">
                            Populaire
                          </span>
                        )}
                      </div>

                      {/* Category Name */}
                      <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 group-hover:text-[#08765F] transition-colors">
                        {category.name}
                      </h3>

                      {/* Subtitle / Meta information */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        {productCount > 0 ? (
                          <span>{productCount} {productCount > 1 ? "produits" : "produit"}</span>
                        ) : subcategoryCount > 0 ? (
                          <span>{subcategoryCount} sous-rayons</span>
                        ) : (
                          <span className="text-[#08765F] font-medium">Découvrir</span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Navigation Indicator */}
                    <div className="pt-2.5 mt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-[#08765F] dark:text-emerald-400">
                      <span>Explorer</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
