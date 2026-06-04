// src/components/home/FeaturedProducts.tsx
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface Props { products: Product[] }

export function FeaturedProducts({ products }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
          <p className="text-muted-foreground mt-1">Handpicked just for you</p>
        </div>
        <Link
          href="/products?featured=true"
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <ProductGrid products={products} columns={4} />
      <div className="text-center sm:hidden">
        <Link href="/products?featured=true" className="btn-outline py-2.5 px-6 text-sm">
          View All Featured <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
