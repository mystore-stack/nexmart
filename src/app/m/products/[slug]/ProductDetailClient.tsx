"use client";
// src/app/m/products/[slug]/ProductDetailClient.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { ProductCard } from "@/components/mobile/ProductCard";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store";
import { cn } from "@/utils/cn";
import type { Product } from "@/types";

interface Props { product: Product; related: Product[] }

export function ProductDetailClient({ product, related }: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants[0] ?? null
  );
  const addItem = useCartStore((s) => s.addItem);
  const { hasItem, addItem: toggleWishlist } = useWishlistStore();
  const router = useRouter();

  const price = selectedVariant?.price ?? product.price;
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const inWishlist = hasItem(product.id);

  const handleAddToCart = () => {
    addItem(product, qty, selectedVariant ?? undefined);
    router.push("/m/cart");
  };

  return (
    <MobileLayout showNav={false}>
      {/* Back bar */}
      <header className="flex items-center justify-between px-4 py-4 sticky top-0 z-30 bg-background/95 backdrop-blur">
        <Link href={-1 as unknown as string} onClick={(e) => { e.preventDefault(); router.back(); }}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center" aria-label="Back">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <button onClick={() => toggleWishlist(product)}
          className={cn("w-9 h-9 rounded-full flex items-center justify-center transition-colors",
            inWishlist ? "bg-red-50 text-red-500" : "bg-muted text-muted-foreground")}
          aria-label="Wishlist">
          <svg className="w-4 h-4" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </header>

      {/* Image gallery */}
      <div className="px-4 space-y-2">
        <div className="relative overflow-hidden rounded-2xl bg-neutral-50" style={{ aspectRatio: "1" }}>
          <img src={product.images[activeImage] || "/placeholder-product.png"}
            alt={product.name} className="w-full h-full object-cover" loading="eager" />
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{discount}%
            </div>
          )}
        </div>
        {/* Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)}
                className={cn("flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors",
                  activeImage === i ? "border-primary" : "border-transparent")}>
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-5 pb-32 space-y-5">
        {/* Title + price */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">{product.category.name}</p>
          <h1 className="font-display text-2xl font-semibold text-foreground leading-tight mb-3">
            {product.name}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-foreground">
              {price.toLocaleString("fr-MA")} MAD
            </span>
            {product.comparePrice && (
              <span className="text-sm text-muted-foreground line-through">
                {product.comparePrice.toLocaleString("fr-MA")} MAD
              </span>
            )}
            {discount > 0 && (
              <span className="badge badge-sale text-xs">-{discount}%</span>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <svg key={s} className={cn("w-4 h-4", s <= Math.round(product.rating) ? "text-[#D4AF37]" : "text-muted")}
                fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
        </div>

        {/* Variants */}
        {product.variants.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Options</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button key={v.id} onClick={() => setSelectedVariant(v)}
                  className={cn("h-9 px-4 rounded-xl border text-sm font-medium transition-colors",
                    selectedVariant?.id === v.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50")}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Description</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Stock */}
        {product.stock <= product.lowStockAt * 3 && product.stock > 0 && (
          <p className="text-xs font-semibold text-orange-500">
            Only {product.stock} in stock — order soon
          </p>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="pt-2">
            <SectionHeader title="You May Also Like" />
            <div className="grid grid-cols-2 gap-3">
              {related.map((p) => <ProductCard key={p.id} product={p} variant="compact" />)}
            </div>
          </div>
        )}
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
            <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              className="w-10 h-11 flex items-center justify-center text-lg font-semibold text-muted-foreground hover:bg-muted transition-colors">
              +
            </button>
          </div>
          <button onClick={handleAddToCart}
            className="btn btn-primary flex-1 h-11 text-sm justify-center" disabled={product.stock === 0}>
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
