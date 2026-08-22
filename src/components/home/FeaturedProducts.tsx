"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductCard";
import type { Product } from "@/types";
import { deduplicateProducts } from "@/lib/product-deduplication";

interface Props { 
  products: Product[];
  config?: {
    enableTabs?: boolean;
    categoryTabs?: Array<{
      categoryId: string;
      categoryName: string;
      displayLabel: string;
      enabled: boolean;
      order: number;
    }>;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    maxProducts?: number;
  };
}

type CategoryFilter = string; // "all" or categoryId

export function FeaturedProducts({ products, config }: Props) {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const uniqueProducts = useMemo(() => deduplicateProducts(products), [products]);
  
  // Use CMS config or defaults
  const enableTabs = config?.enableTabs !== false;
  const categoryTabs = config?.categoryTabs || [];
  const title = config?.title || "Découvrez nos produits";
  const subtitle = config?.subtitle || "Les produits les plus intéressants du moment";
  const ctaText = config?.ctaText || "Voir tout";
  const maxProducts = config?.maxProducts || 18;

  // Build filter options based on CMS config
  const filterOptions = useMemo(() => {
    if (!enableTabs) {
      // Legacy filter mode
      return [
        { key: "all", label: "Tous" },
        { key: "popular", label: "Populaires" },
        { key: "newest", label: "Nouveautés" },
        { key: "bestsellers", label: "Meilleures ventes" },
        { key: "deals", label: "Meilleures offres" },
      ];
    }

    // Category tab mode
    const enabledTabs = categoryTabs
      .filter((tab: any) => tab.enabled)
      .sort((a: any, b: any) => a.order - b.order);

    return [
      { key: "all", label: "Tous" },
      ...enabledTabs.map((tab: any) => ({
        key: tab.categoryId,
        label: tab.displayLabel || tab.categoryName
      }))
    ];
  }, [enableTabs, categoryTabs]);

  const visibleProducts = useMemo(() => {
    const next = [...uniqueProducts];

    if (!enableTabs) {
      // Legacy filtering logic
      switch (activeFilter) {
        case "popular":
          return next.sort((a: any, b: any) => (Number(b.rating) * Number(b.reviewCount || 0)) - (Number(a.rating) * Number(a.reviewCount || 0))).slice(0, maxProducts);
        case "newest":
          return next.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, maxProducts);
        case "bestsellers":
          return next.sort((a: any, b: any) => Number(b.soldCount || 0) - Number(a.soldCount || 0)).slice(0, maxProducts);
        case "deals":
          return next.sort((a: any, b: any) => {
            const discountA = a.comparePrice && a.comparePrice > a.price ? ((a.comparePrice - a.price) / a.comparePrice) * 100 : 0;
            const discountB = b.comparePrice && b.comparePrice > b.price ? ((b.comparePrice - b.price) / b.comparePrice) * 100 : 0;
            return discountB - discountA;
          }).slice(0, maxProducts);
        default:
          return next.slice(0, maxProducts);
      }
    }

    // Category-based filtering
    if (activeFilter === "all") {
      return next.slice(0, maxProducts);
    }

    // Filter by category ID
    return next
      .filter((product: any) => (product as any).categoryId === activeFilter)
      .slice(0, maxProducts);
  }, [activeFilter, uniqueProducts, enableTabs, maxProducts]);

  if (!uniqueProducts || uniqueProducts.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,243,232,0.88))] p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] md:p-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b8891d]">
              <span className="mr-2 inline-block h-px w-8 bg-[#b8891d] align-middle" />
              SELECTION NEXMART
            </span>
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          </div>
        </div>
        <div className="py-12 text-center text-sm text-slate-500">Aucun produit disponible pour le moment.</div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,243,232,0.88))] p-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_26%)]" />
      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b8891d]">
              <span className="mr-2 inline-block h-px w-8 bg-[#b8891d] align-middle" />
              SELECTION NEXMART
            </span>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900 md:text-[3rem] md:leading-none">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-[#d9c089] bg-white/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5f4b2c] shadow-sm md:px-4">
              <Sparkles className="h-3.5 w-3.5" />
              AI Curated
            </button>
            <Link href="/products" className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 md:px-4">
              {ctaText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`rounded-full border px-3 py-2 text-[11px] font-medium transition md:px-4 ${
                  activeFilter === filter.key
                    ? "border-[#c5a75d] bg-[#f4ead0] text-[#5f4b2c] shadow-sm"
                    : "border-slate-200 bg-white/70 text-slate-700 hover:border-slate-300 hover:bg-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <ProductGrid products={visibleProducts} columns={6} compact={true} />
        </div>
      </div>
    </div>
  );
}
