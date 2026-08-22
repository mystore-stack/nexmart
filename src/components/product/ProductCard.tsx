"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Eye, Crown, Truck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/index";
import { formatPrice, discountPercentage } from "@/utils/format";
import type { Product } from "@/types";
import { trackAiEvent } from "@/lib/ai/client-events";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
  compact?: boolean;
}

export function ProductCard({ product, priority = false, index = 0, compact = false }: ProductCardProps) {
  const [imageIdx, setImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { addItem } = useCartStore();
  const { addItem: addWishlist, hasItem } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const images = product.images?.length ? product.images : ["/placeholder.svg"];
  const inWishlist = mounted ? hasItem(product.id) : false;
  const discount = product.comparePrice ? discountPercentage(product.price, product.comparePrice) : 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockAt || 5);
  const isOutOfStock = product.stock === 0;

  const trackView = () => trackAiEvent({ type: "VIEW", productId: product.id, metadata: { source: "product_card" } });

  const cardContent = (
    <>
      <div className={`relative ${compact ? "h-32 w-full mb-4 bg-[#f8f9fa] rounded-2xl overflow-hidden" : "overflow-hidden aspect-[3/3.3] bg-slate-100 rounded-[16px]"}`}>
        {compact ? (
          <Image
            src={imageError ? "/placeholder.svg" : images[imageIdx] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            onError={() => setImageError(true)}
          />
        ) : (
          <>
            <Link href={`/products/${product.slug}`} onClick={trackView} className="block h-full w-full">
              <Image
                src={imageError ? "/placeholder.svg" : images[imageIdx] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                onError={() => setImageError(true)}
              />
            </Link>

            <div className={`absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5`}>
              {discount > 0 && (
                <span className="inline-flex items-center rounded-full bg-red-500 font-bold text-white px-2 py-1 text-[9px]">-{discount}%</span>
              )}
              {product.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 font-bold text-white px-2 py-1 text-[9px]">
                  <Crown className="h-2.5 w-2.5" /> PREMIUM
                </span>
              )}
              {isLowStock && (
                <span className="inline-flex items-center rounded-full bg-amber-500 px-2 py-1 text-[9px] font-bold text-white">Stock limité</span>
              )}
              {isOutOfStock && (
                <span className="inline-flex items-center rounded-full bg-slate-600 px-2 py-1 text-[9px] font-bold text-white">Épuisé</span>
              )}
            </div>

            <div className={`absolute right-2.5 top-2.5 flex flex-col gap-2 transition ${isHovered ? "opacity-100" : "opacity-0"}`}>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  e.preventDefault();
                  addWishlist(product);
                  trackAiEvent({ type: "WISHLIST", productId: product.id, metadata: { source: "product_card" } });
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${inWishlist ? "border-red-200 bg-red-500 text-white" : "border-slate-200 bg-white/90 text-slate-700"}`}
                aria-label={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart className={`h-3.5 w-3.5 ${inWishlist ? "fill-current" : ""}`} />
              </motion.button>
              <Link href={`/products/${product.slug}`} onClick={trackView} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700" aria-label="Voir le produit">
                <Eye className="h-3.5 w-3.5" />
              </Link>
            </div>

            <motion.div initial={false} animate={{ y: isHovered && !isOutOfStock ? 0 : 26, opacity: isHovered && !isOutOfStock ? 1 : 0 }} transition={{ duration: 0.2 }} className="absolute inset-x-2.5 bottom-2.5 z-10">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addItem(product);
                  trackAiEvent({ type: "ADD_TO_CART", productId: product.id, metadata: { source: "product_card" } });
                }}
                disabled={isOutOfStock}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShoppingCart className="h-4 w-4" />
                Ajouter
              </button>
            </motion.div>
          </>
        )}
      </div>

      <div className={`space-y-1.5 ${compact ? "pt-0" : "p-3"}`}>
        {compact ? (
          <>
            <h3 className="text-xs font-bold text-slate-900 mb-2 line-clamp-2 min-h-[32px]">{product.name}</h3>
            <div className="flex items-baseline gap-2 mb-2 mt-auto">
              <span className="text-sm font-black text-emerald-600">{formatPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-[10px] text-slate-400 line-through">{formatPrice(product.comparePrice)}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3 w-3 fill-amber-400" />
              <span className="text-[10px] font-bold text-slate-500">{product.rating.toFixed(1)} <span className="font-normal text-slate-400">({new Intl.NumberFormat("fr-MA").format(product.reviewCount || 0)})</span></span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 font-bold uppercase tracking-wide text-slate-700 px-2 py-1 text-[9px]">
                <Truck className="h-2.5 w-2.5" /> Livraison rapide
              </span>
              {!isOutOfStock && <span className="font-bold text-emerald-600 text-[9px]">En stock</span>}
            </div>

            <Link href={`/products/${product.slug}`} onClick={trackView} className="block font-semibold leading-snug text-slate-900 line-clamp-2 hover:text-slate-700 min-h-[2.6rem] text-sm">
              {product.name}
            </Link>

            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-3 w-3 ${s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                  ))}
                </div>
                <span>{product.rating.toFixed(1)} ({new Intl.NumberFormat("fr-MA").format(product.reviewCount)})</span>
              </div>
            )}

            <div className="flex items-baseline gap-2">
              <span className="font-bold text-slate-900 text-lg">{formatPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-slate-400 line-through text-xs">{formatPrice(product.comparePrice)}</span>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );

  if (compact) {
    return (
      <Link href={`/products/${product.slug}`} onClick={trackView} className="group flex flex-col bg-white p-3 sm:p-4 rounded-3xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition">
        {cardContent}
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
      className="group relative overflow-hidden border border-slate-200 bg-white rounded-[16px] transition hover:border-slate-300 hover:shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
      onMouseEnter={() => { setIsHovered(true); if (images.length > 1) setImageIdx(1); }}
      onMouseLeave={() => { setIsHovered(false); setImageIdx(0); }}
    >
      {cardContent}
    </motion.div>
  );
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
  compact?: boolean;
}

export function ProductGrid({ products, loading, columns = 4, compact = false }: ProductGridProps) {
  const gridClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-4 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
  }[columns];

  if (loading) {
    return (
      <div className={`grid ${gridClass} gap-4 md:gap-5`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} compact={compact} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <ShoppingCart className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mb-1 text-xl font-semibold text-slate-900">Aucun produit trouvé</h3>
        <p className="text-sm text-slate-500">Essayez de modifier vos filtres ou votre recherche.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClass} gap-4 md:gap-5`}>
      {products.map((product, index) => (
        <ProductCard key={`${product.id}-${index}`} product={product} index={index} priority={index < 4} compact={compact} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-3 sm:p-4">
        <div className="h-32 w-full mb-4 bg-[#f8f9fa] rounded-2xl animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-3 w-full animate-pulse rounded-full bg-slate-200 min-h-[32px]" />
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-white">
      <div className="aspect-[3/3.3] rounded-[16px] animate-pulse bg-slate-200" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-slate-200" />
        <div className="h-5 w-1/3 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
