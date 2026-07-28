"use client";
// src/components/product/ProductCard.tsx - Premium Moroccan Luxury Card
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Eye, Truck, Crown } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/index";
import { formatPrice, discountPercentage } from "@/utils/format";
import type { Product } from "@/types";
import { trackAiEvent } from "@/lib/ai/client-events";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
}

export function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  const [imageIdx, setImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCartStore();
  const { addItem: addWishlist, hasItem } = useWishlistStore();

  const images = product.images?.length ? product.images : ["/placeholder.jpg"];
  const inWishlist = hasItem(product.id);
  const discount = product.comparePrice ? discountPercentage(product.price, product.comparePrice) : 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockAt;
  const isOutOfStock = product.stock === 0;

  const trackView = () => trackAiEvent({ type: "VIEW", productId: product.id, metadata: { source: "product_card" } });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: "easeOut" }}
      className="product-card group relative bg-white"
      onMouseEnter={() => { setIsHovered(true); if (images.length > 1) setImageIdx(1); }}
      onMouseLeave={() => { setIsHovered(false); setImageIdx(0); }}
    >
      {/* Moroccan gold top accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-400/0 to-transparent transition-all duration-500 group-hover:via-orange-400/60 z-10" />

      {/* Image area */}
      <div className="relative aspect-[3/3.5] overflow-hidden bg-gradient-to-br from-orange-50 to-slate-100">
        <Link href={`/products/${product.slug}`} onClick={trackView}>
          <Image
            src={images[imageIdx] || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-108"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />
          {/* Overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge badge-sale text-[10px] font-black">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="badge bg-gradient-to-r from-brand-700 to-brand-600 text-white text-[10px] font-bold flex items-center gap-1">
              <Crown className="w-2.5 h-2.5" /> PREMIUM
            </span>
          )}
          {isLowStock && (
            <span className="badge bg-amber-500 text-white text-[10px] font-black">STOCK LIMITÉ</span>
          )}
          {isOutOfStock && (
            <span className="badge bg-zinc-600 text-white text-[10px] font-black">ÉPUISÉ</span>
          )}
        </div>

        {/* Wishlist & View buttons */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
        }`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              addWishlist(product);
              trackAiEvent({ type: "WISHLIST", productId: product.id, metadata: { source: "product_card" } });
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all border ${
              inWishlist
                ? "bg-red-500 text-white border-red-400/50"
                : "bg-white text-slate-700 hover:bg-red-50 hover:text-red-500 border-slate-200"
            }`}
            aria-label={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
          </motion.button>
          <Link
            href={`/products/${product.slug}`}
            onClick={trackView}
            className="w-9 h-9 rounded-xl bg-white text-slate-700 flex items-center justify-center shadow-sm hover:bg-orange-50 hover:text-orange-700 transition-all border border-slate-200"
            aria-label="Voir le produit"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Add to Cart */}
        <motion.div
          initial={false}
          animate={{ y: isHovered && !isOutOfStock ? 0 : 56, opacity: isHovered && !isOutOfStock ? 1 : 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="absolute bottom-3 left-3 right-3"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
              trackAiEvent({ type: "ADD_TO_CART", productId: product.id, metadata: { source: "product_card" } });
            }}
            disabled={isOutOfStock}
            className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-all hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart className="w-4 h-4 flex-shrink-0" />
            Ajouter au panier
          </button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="space-y-2.5 p-4">
        {/* Fast ship + stock indicator */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
            <Truck className="h-2.5 w-2.5" />
            Livraison rapide
          </span>
          {!isOutOfStock && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">● En stock</span>
          )}
        </div>

        {/* Product name */}
        <Link
          href={`/products/${product.slug}`}
          onClick={trackView}
          className="block min-h-[2.5rem] text-sm font-semibold leading-snug text-slate-700 transition-colors line-clamp-2 hover:text-orange-600"
        >
          {product.name}
        </Link>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3 w-3 ${
                    s <= Math.round(product.rating)
                      ? "fill-orange-500 text-orange-500"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-500">
              {product.rating.toFixed(1)} ({new Intl.NumberFormat("fr-MA").format(product.reviewCount)})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-base font-bold text-slate-900">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-slate-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>

        {/* Color variants */}
        {product.variants.filter((v) => v.name === "Color").length > 0 && (
          <div className="flex gap-1.5 pt-1">
            {product.variants
              .filter((v) => v.name === "Color")
              .slice(0, 5)
              .map((v) => (
                <div
                  key={v.id}
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-border/50"
                  style={{ backgroundColor: v.value }}
                  title={v.label}
                />
              ))}
            {product.variants.filter((v) => v.name === "Color").length > 5 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{product.variants.filter((v) => v.name === "Color").length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom gold accent on hover */}
      <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400/0 to-transparent transition-all duration-500 group-hover:via-orange-400/50" />
    </motion.div>
  );
}

// Product Grid
interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: 2 | 3 | 4 | 5;
}

export function ProductGrid({ products, loading, columns = 4 }: ProductGridProps) {
  const gridClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  }[columns];

  if (loading) {
    return (
      <div className={`grid ${gridClass} gap-3 sm:gap-4 md:gap-5`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="font-display text-2xl font-semibold mb-2">Aucun produit trouvé</h3>
        <p className="text-muted-foreground">Essayez de modifier vos filtres ou votre recherche.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClass} gap-3 sm:gap-4 md:gap-5`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} priority={index < 4} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[3/3.5] skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-3.5 rounded-full w-2/3" />
        <div className="skeleton h-4 rounded w-full" />
        <div className="skeleton h-4 rounded w-4/5" />
        <div className="skeleton h-5 rounded w-1/3" />
      </div>
    </div>
  );
}
