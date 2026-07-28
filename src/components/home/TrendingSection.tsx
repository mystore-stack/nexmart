"use client";
// src/components/home/TrendingSection.tsx
import React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface Props { products: Product[] }

export function TrendingSection({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <div className="space-y-4 rounded-[1.4rem] border border-orange-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="marketplace-chip mb-2">
            <TrendingUp className="h-3 w-3" /> Tendances du moment
          </span>
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Les plus populaires
          </h2>
        </div>
        <Link
          href="/products?sort=trending"
          className="flex items-center gap-1.5 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700"
        >
          Explorer
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <ProductGrid products={products.slice(0, 8)} columns={4} />
    </div>
  );
}
