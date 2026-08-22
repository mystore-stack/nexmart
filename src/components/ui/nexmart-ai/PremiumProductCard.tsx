"use client";

import Link from "next/link";
import React from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import type { LuxuryProduct } from "@/components/homepage/luxury-homepage-shared";
import { formatMad } from "@/components/homepage/luxury-homepage-shared";

type PremiumProductCardProps = {
  product: LuxuryProduct;
  loading?: boolean;
  className?: string;
};

export function PremiumProductCard({ product, loading = false, className = "" }: PremiumProductCardProps) {
  if (loading) {
    return (
      <article className={`ai-card overflow-hidden ${className}`}>
        <div className="aspect-[4/5] ai-shimmer" />
        <div className="space-y-3 p-5">
          <div className="ai-shimmer h-3 w-2/3 rounded-lg" />
          <div className="ai-shimmer h-5 w-1/3 rounded-lg" />
          <div className="ai-shimmer h-10 w-full rounded-xl" />
        </div>
      </article>
    );
  }

  return (
    <article className={`ai-card ai-product-card group overflow-hidden ${className}`}>
      <div className="relative overflow-hidden">
        <Link href={product.href} className="block">
          <div className="relative aspect-[4/5] bg-[hsl(var(--ai-surface-2))]">
            <ImageWithFallback
              src={product.image}
              fallbackSrc="/assets/hero-fallback.svg"
              alt={product.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          </div>
        </Link>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--ai-purple))] backdrop-blur">
            {product.badge}
          </span>
          <button
            type="button"
            aria-label={`Ajouter ${product.title} aux favoris`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[hsl(222_47%_10%)] backdrop-blur transition hover:scale-105"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        {product.discount ? (
          <div className="absolute left-4 top-14 rounded-full bg-[hsl(222_47%_10%)] px-2.5 py-1 text-[10px] font-bold text-white">
            -{product.discount}%
          </div>
        ) : null}
      </div>

      <div className="space-y-3 p-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--ai-muted))]">
            {product.collection}
          </p>
          <Link
            href={product.href}
            className="mt-1 block text-base font-semibold leading-snug text-[hsl(222_47%_10%)] transition group-hover:text-[hsl(var(--ai-purple))]"
          >
            {product.title}
          </Link>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-[hsl(var(--ai-muted))]">
          <Star className="h-3.5 w-3.5 fill-[hsl(var(--ai-purple))] text-[hsl(var(--ai-purple))]" />
          <span className="font-medium text-[hsl(222_47%_10%)]">{product.rating.toFixed(1)}</span>
          <span>({product.reviews})</span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-bold tracking-tight text-[hsl(var(--ai-purple))]">{formatMad(product.price)}</p>
            {product.oldPrice ? (
              <p className="text-sm text-[hsl(var(--ai-muted))] line-through">{formatMad(product.oldPrice)}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--ai-purple)/0.08)] text-[hsl(var(--ai-purple))] transition hover:bg-[hsl(var(--ai-purple))] hover:text-white"
            aria-label={`Ajouter ${product.title} au panier`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductSkeletonGrid({ count = 4, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <PremiumProductCard
          key={i}
          product={{
            id: `sk-${i}`,
            title: "",
            href: "#",
            image: "",
            price: 0,
            rating: 0,
            reviews: 0,
            stock: 0,
            badge: "",
            note: "",
            collection: "",
          }}
          loading
        />
      ))}
    </div>
  );
}
