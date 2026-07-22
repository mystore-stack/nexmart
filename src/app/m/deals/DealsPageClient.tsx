"use client";
// src/app/m/deals/DealsPageClient.tsx
import Link from "next/link";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { CountdownTimer } from "@/components/mobile/CountdownTimer";
import { StockBar } from "@/components/mobile/StockBar";
import { useCartStore } from "@/store/cart";
import { cn } from "@/utils/cn";
import type { Deal } from "@/types";

interface Props { deals: Deal[] }

export function DealsPageClient({ deals }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-5 py-5 sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
              Limited Time
            </p>
            <h1 className="font-display text-2xl font-semibold text-foreground">Super Deals</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-500">LIVE</span>
          </div>
        </div>
      </header>

      {/* Deals list */}
      <div className="px-4 py-5 space-y-4">
        {deals.map((deal) => {
          const product = deal.product;
          const isLow = deal.stockRemaining <= Math.floor(deal.stockLimit * 0.3);

          return (
            <div key={deal.id}
              className={cn(
                "card-luxury rounded-2xl overflow-hidden flex gap-0",
                isLow && "ring-1 ring-red-200"
              )}>
              {/* Image */}
              <Link href={`/m/products/${product.slug}`}
                className="flex-shrink-0 w-36 bg-neutral-50 overflow-hidden">
                <img src={product.images[0] || "/placeholder-product.png"} alt={product.name}
                  className="w-full h-full object-cover" loading="lazy" />
              </Link>

              {/* Info */}
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  {/* Discount badge */}
                  <span className="inline-block mb-2 px-2 py-0.5 rounded-md bg-red-500 text-white text-[11px] font-black">
                    -{deal.discountPercentage}% OFF
                  </span>
                  <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>

                  {/* Prices */}
                  <div className="flex items-center gap-2 mt-1 mb-3">
                    <span className="text-base font-black text-primary">
                      {product.price.toLocaleString("fr-MA")} MAD
                    </span>
                    {product.comparePrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {product.comparePrice.toLocaleString("fr-MA")}
                      </span>
                    )}
                  </div>

                  {/* Countdown */}
                  <CountdownTimer endTime={deal.endTime} className="mb-3" />

                  {/* Stock */}
                  <StockBar
                    current={deal.stockRemaining}
                    max={deal.stockLimit}
                    lowThreshold={Math.floor(deal.stockLimit * 0.3)}
                    className="mb-3"
                  />
                </div>

                {/* CTA */}
                <button
                  onClick={() => addItem(product, 1)}
                  className="btn btn-primary btn-sm w-full justify-center text-xs h-9">
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}

        {deals.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground text-sm">No active deals right now.</p>
            <Link href="/m" className="mt-4 inline-block text-primary text-sm font-semibold">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
