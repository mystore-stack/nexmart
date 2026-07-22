"use client";
// src/components/mobile/DealCard.tsx
import Link from "next/link";
import { cn } from "@/utils/cn";
import type { Deal } from "@/types";
import { CountdownTimer } from "./CountdownTimer";
import { StockBar } from "./StockBar";

interface DealCardProps {
  deal: Deal;
  className?: string;
  showStock?: boolean;
}

/**
 * Deal card with countdown timer + stock bar.
 */
export function DealCard({ deal, className, showStock = true }: DealCardProps) {
  const product = deal.product;
  const discount = deal.discountPercentage;

  return (
    <Link
      href={`/m/products/${product.slug}`}
      className={cn("card-luxury flex-shrink-0 w-[180px] overflow-hidden rounded-2xl flex flex-col", className)}
    >
      {/* Image */}
      <div className="w-full bg-neutral-50 overflow-hidden relative" style={{ aspectRatio: "1" }}>
        <img
          src={product.images[0] || "/placeholder-product.png"}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        {/* Discount badge */}
        <div className="absolute top-2 left-2 bg-gradient-to-br from-red-500 to-orange-500 text-white text-xs font-black rounded-lg px-2 py-1 shadow-md">
          -{discount}%
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="truncate text-[13px] font-medium text-foreground">{product.name}</p>

        {/* Prices */}
        <div className="flex items-center gap-1.5">
          <span className="text-base font-black text-primary">{product.price.toLocaleString("fr-MA")} MAD</span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              {product.comparePrice.toLocaleString("fr-MA")}
            </span>
          )}
        </div>

        {/* Countdown */}
        <CountdownTimer endTime={deal.endTime} />

        {/* Stock bar */}
        {showStock && (
          <StockBar
            current={deal.stockRemaining}
            max={deal.stockLimit}
            lowThreshold={Math.floor(deal.stockLimit * 0.3)}
          />
        )}
      </div>
    </Link>
  );
}
