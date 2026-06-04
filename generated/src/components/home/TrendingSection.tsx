"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface TrendingProps { products: Product[] }

export function TrendingSection({ products }: TrendingProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-background" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Trending Now</h2>
            <p className="text-muted-foreground text-sm">What everyone&apos;s buying</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {products.map((product, i) => (
          <div key={product.id} className="flex-shrink-0 w-56 md:w-64">
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href="/products?sort=popular" className="btn-outline py-2.5 px-8 text-sm">
          Explore Trending
        </Link>
      </div>
    </div>
  );
}
