// src/components/product/RelatedProducts.tsx — Moroccan Luxury
import React from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <div className="space-y-7">
      <div>
        <span className="section-label mb-2 block text-[11px]">
          <span className="inline-block w-6 h-px bg-gold-500 mr-2 align-middle" />
          Recommandations IA
        </span>
        <h2 className="font-display text-3xl font-semibold">Vous aimerez aussi</h2>
        <div className="mt-2 h-0.5 w-12 bg-gradient-to-r from-gold-400 to-transparent rounded-full" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
