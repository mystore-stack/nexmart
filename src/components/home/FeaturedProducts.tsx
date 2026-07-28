"use client";
// src/components/home/FeaturedProducts.tsx
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Crown } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface Props { products: Product[] }

export function FeaturedProducts({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-orange-100 bg-[linear-gradient(135deg,_rgba(255,247,237,0.95),_white)] p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <span className="market-pill mb-2 inline-flex items-center gap-2">
            <Crown className="h-3 w-3" /> Recommandé par l&apos;IA
          </span>
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Produits en vedette
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Une sélection plus précise, pensée pour offrir un parcours simple et rapide.
          </p>
        </div>
        <Link
          href="/products?featured=true"
          className="inline-flex items-center gap-2 self-start rounded-full border border-orange-200 bg-white px-3 py-2 text-sm font-semibold text-orange-600 transition hover:border-orange-300 hover:bg-orange-50"
        >
          Voir tout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <ProductGrid products={products.slice(0, 8)} columns={4} />
    </div>
  );
}
