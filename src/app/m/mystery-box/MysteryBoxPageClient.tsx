"use client";
// src/app/m/mystery-box/MysteryBoxPageClient.tsx
import { useState } from "react";
import Link from "next/link";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useCartStore } from "@/store/cart";
import { cn } from "@/utils/cn";
import type { MysteryBox, Product } from "@/types";

interface Props { boxes: MysteryBox[] }

export function MysteryBoxPageClient({ boxes }: Props) {
  return (
    <MobileLayout>
      <header className="px-5 py-5 sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
          Surprise & Delight
        </p>
        <h1 className="font-display text-2xl font-semibold text-foreground">Mystery Box</h1>
      </header>

      <div className="px-4 py-5 space-y-6">
        {/* Explainer banner */}
        <div className="rounded-2xl bg-muted/60 border border-border p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Each Mystery Box contains handpicked premium items. You never know exactly what you&apos;ll
            get — but it&apos;s always worth more than you pay.
          </p>
        </div>

        {/* Box cards */}
        {boxes.map((box) => (
          <BoxCard key={box.id} box={box} />
        ))}
      </div>
    </MobileLayout>
  );
}

function BoxCard({ box }: { box: MysteryBox }) {
  const [revealed, setRevealed] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  // Create a stub Product for cart purposes
  const boxAsProduct: Product = {
    id: box.id,
    name: box.name,
    slug: box.slug,
    description: box.description,
    price: box.price,
    categoryId: "mystery",
    category: { id: "mystery", name: "Mystery", slug: "mystery" },
    images: ["/mystery-box.png"],
    tags: ["mystery"],
    sku: `MB-${box.id}`,
    stock: box.stock,
    lowStockAt: 3,
    published: true,
    featured: false,
    rating: 5,
    reviewCount: 0,
    soldCount: 0,
    variants: [],
    createdAt: box.createdAt,
    updatedAt: box.createdAt,
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#0F172A" }}>
      {/* Top section */}
      <div className="p-6">
        {/* Scarcity */}
        {box.stock <= 20 && (
          <div className="flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">
              Only {box.stock} remaining
            </span>
          </div>
        )}

        {/* Title + value */}
        <h2 className="font-display text-3xl font-semibold leading-tight mb-1"
          style={{ color: "#D4AF37" }}>
          {box.name}
        </h2>
        <p className="text-white text-sm font-semibold mb-1">{box.valueLabel}</p>
        <p className="text-neutral-400 text-sm leading-relaxed mb-5">{box.description}</p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-3xl font-black text-white">
            {box.price.toLocaleString("fr-MA")} MAD
          </span>
        </div>

        {/* Possible rewards toggle */}
        <button onClick={() => setRevealed((r) => !r)}
          className="flex items-center gap-2 text-sm text-neutral-400 mb-5 hover:text-neutral-300 transition-colors">
          <svg className={cn("w-4 h-4 transition-transform", revealed && "rotate-180")}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {revealed ? "Hide" : "View"} possible rewards
        </button>

        {/* Reward grid (collapsible) */}
        {revealed && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {box.possibleRewards.slice(0, 6).map((p) => (
              <RewardThumb key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => addItem(boxAsProduct, 1)}
          className="btn btn-gold w-full h-12 justify-center text-sm font-bold">
          Add to Cart — {box.price.toLocaleString("fr-MA")} MAD
        </button>
      </div>
    </div>
  );
}

function RewardThumb({ product }: { product: Product }) {
  return (
    <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-square relative group">
      <img src={product.images[0]} alt={product.name}
        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
        loading="lazy" />
      <div className="absolute inset-0 flex items-end p-1">
        <span className="text-[9px] font-semibold text-white/80 leading-tight truncate block w-full text-center">
          {product.name}
        </span>
      </div>
    </div>
  );
}
