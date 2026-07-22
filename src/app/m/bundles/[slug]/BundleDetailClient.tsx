"use client";
// src/app/m/bundles/[slug]/BundleDetailClient.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { ProductCard } from "@/components/mobile/ProductCard";
import { useCartStore } from "@/store/cart";
import type { Bundle } from "@/types";

interface Props { bundle: Bundle }

export function BundleDetailClient({ bundle }: Props) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const handleAddBundle = () => {
    bundle.products.forEach((p) => addItem(p as any, qty));
    router.push("/m/cart");
  };

  return (
    <MobileLayout showNav={false}>
      {/* Back bar */}
      <header className="flex items-center justify-between px-4 py-4 sticky top-0 z-30 bg-background/95 backdrop-blur">
        <Link href="/m/bundles" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center" aria-label="Back">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="font-display text-lg font-semibold text-foreground">Bundle Details</span>
      </header>

      <div className="px-4 py-5 pb-40 space-y-6">
        {/* Bundle info */}
        <div className="card-luxury rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground mb-2">{bundle.name}</h1>
              {bundle.description && (
                <p className="text-sm text-muted-foreground">{bundle.description}</p>
              )}
            </div>
            <span className="badge badge-sale text-sm">-{bundle.discountPercentage}%</span>
          </div>

          {/* Products */}
          <div className="space-y-3 mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Included Products</p>
            {bundle.products.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-muted">
                  <img src={p.images[0] || "/placeholder-product.png"} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.price.toLocaleString("fr-MA")} MAD</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="border-t border-border pt-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black text-foreground">
                {bundle.bundlePrice.toLocaleString("fr-MA")} MAD
              </span>
              <span className="text-lg text-muted-foreground line-through">
                {bundle.totalPrice.toLocaleString("fr-MA")} MAD
              </span>
            </div>
            <p className="text-sm text-green-600 font-semibold">
              You save {bundle.discount.toLocaleString("fr-MA")} MAD
            </p>
          </div>
        </div>

        {/* Why buy this bundle */}
        <div className="card-luxury rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Why Buy This Bundle?</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-foreground">Save {bundle.discountPercentage}% compared to buying separately</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-foreground">Free shipping included</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-foreground">30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4 bg-background/95 backdrop-blur border-t border-border"
        style={{ maxWidth: "430px", margin: "0 auto" }}>
        <div className="flex items-center gap-3">
          {/* Qty stepper */}
          <div className="flex items-center border border-border rounded-xl overflow-hidden">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-10 h-11 flex items-center justify-center text-lg font-semibold text-muted-foreground hover:bg-muted transition-colors">
              −
            </button>
            <span className="w-8 text-center text-sm font-semibold text-foreground">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)}
              className="w-10 h-11 flex items-center justify-center text-lg font-semibold text-muted-foreground hover:bg-muted transition-colors">
              +
            </button>
          </div>
          <button onClick={handleAddBundle}
            className="btn btn-primary flex-1 h-11 text-sm justify-center">
            Add Bundle to Cart — {(bundle.bundlePrice * qty).toLocaleString("fr-MA")} MAD
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
