"use client";
// src/app/m/bundles/BundlesPageClient.tsx
import Link from "next/link";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useCartStore } from "@/store/cart";
import type { Bundle } from "@/types";

interface Props { bundles: Bundle[] }

export function BundlesPageClient({ bundles }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const addBundle = (bundle: Bundle) => {
    bundle.products.forEach((p) => addItem(p, 1));
  };

  return (
    <MobileLayout>
      <header className="px-5 py-5 sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Save More</p>
        <h1 className="font-display text-2xl font-semibold text-foreground">Bundle Deals</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        {bundles.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} onAddToCart={() => addBundle(bundle)} />
        ))}
      </div>
    </MobileLayout>
  );
}

function BundleCard({ bundle, onAddToCart }: { bundle: Bundle; onAddToCart: () => void }) {
  return (
    <div className="card-luxury rounded-2xl p-5">
      {/* Name + badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">{bundle.name}</h2>
          {bundle.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{bundle.description}</p>
          )}
        </div>
        <span className="flex-shrink-0 ml-3 badge badge-sale text-xs">
          -{bundle.discountPercentage}%
        </span>
      </div>

      {/* Product chain */}
      <div className="flex items-center gap-2 mb-5">
        {bundle.products.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2 flex-1 min-w-0">
            <Link href={`/m/products/${p.slug}`} className="flex-1 min-w-0">
              <div className="overflow-hidden rounded-xl bg-muted aspect-square">
                <img src={p.images[0]} alt={p.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy" />
              </div>
              <p className="mt-1 text-center text-[10px] text-muted-foreground truncate">{p.name}</p>
            </Link>
            {i < bundle.products.length - 1 && (
              <span className="flex-shrink-0 text-sm text-muted-foreground font-light pb-5">+</span>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-border mb-4" />

      {/* Price row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] text-muted-foreground mb-0.5">Bundle price</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">
              {bundle.bundlePrice.toLocaleString("fr-MA")} MAD
            </span>
            <span className="text-sm text-muted-foreground line-through">
              {bundle.totalPrice.toLocaleString("fr-MA")}
            </span>
          </div>
        </div>
        <div className="bg-primary/10 rounded-xl px-3 py-2 text-center">
          <p className="text-primary text-[10px] font-semibold">You save</p>
          <p className="text-primary text-sm font-black">{bundle.discount.toLocaleString("fr-MA")} MAD</p>
        </div>
      </div>

      <button onClick={onAddToCart}
        className="btn btn-primary w-full h-11 justify-center text-sm">
        Add Bundle to Cart
      </button>
    </div>
  );
}
