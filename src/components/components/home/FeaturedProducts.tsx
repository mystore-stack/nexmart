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
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <span className="section-label mb-2 block">
            <span className="inline-block w-8 h-px bg-gold-500 mr-2 align-middle" />
            Sélection Prestige
          </span>
          <h2 className="font-display text-3xl font-semibold md:text-4xl text-foreground">
            Produits en vedette
          </h2>
          <div className="gold-divider mt-3" />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-gold-300/40 bg-gold-50 dark:bg-gold-900/20 px-3 py-1.5 text-xs font-bold text-gold-700 dark:text-gold-400">
            <Crown className="h-3 w-3" /> Recommandé par l&apos;IA
          </span>
          <Link
            href="/products?featured=true"
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-400 hover:text-brand-600 transition-colors group"
          >
            Voir tout
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <ProductGrid products={products.slice(0, 8)} columns={4} />
    </div>
  );
}
