"use client";
// src/components/home/RecentlyViewedSection.tsx - Moroccan luxury
import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

export function RecentlyViewedSection() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nexmart-recently-viewed");
      if (raw) setProducts(JSON.parse(raw).slice(0, 6));
    } catch {}
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="space-y-7">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-200/40 dark:border-gold-800/20 bg-white dark:bg-card shadow-sm">
          <Clock className="h-5 w-5 text-brand-700 dark:text-brand-400" />
        </div>
        <div>
          <span className="section-label mb-0.5 block text-[11px]">Historique</span>
          <h2 className="font-display text-2xl font-semibold">Récemment consultés</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
