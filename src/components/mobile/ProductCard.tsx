// src/components/mobile/ProductCard.tsx
import Link from "next/link";
import { cn } from "@/utils/cn";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
  variant?: "default" | "compact";
}

/**
 * Reusable product card — image, name, price, minimal design.
 */
export function ProductCard({ product, className, variant = "default" }: ProductCardProps) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <Link
      href={`/m/products/${product.slug}`}
      className={cn("product-card group flex flex-col", className)}
    >
      {/* Image */}
      <div
        className={cn(
          "w-full overflow-hidden rounded-xl bg-neutral-50 relative",
          variant === "compact" ? "aspect-square" : "aspect-[3/4]"
        )}
      >
        <img
          src={product.images[0] || "/placeholder-product.png"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            -{discount}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className={cn("p-3", variant === "compact" && "p-2")}>
        <p className={cn("truncate font-medium text-foreground", variant === "compact" ? "text-xs" : "text-[13px]")}>
          {product.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className={cn("font-semibold text-foreground", variant === "compact" ? "text-sm" : "text-sm")}>
            {product.price.toLocaleString("fr-MA")} MAD
          </p>
          {product.comparePrice && (
            <p className="text-xs text-muted-foreground line-through">
              {product.comparePrice.toLocaleString("fr-MA")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
