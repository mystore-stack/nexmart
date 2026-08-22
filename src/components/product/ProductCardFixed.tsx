"use client";
// src/components/product/ProductCardFixed.tsx — Production-ready Product Card
import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Eye, Crown, Truck, Package } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/index";
import { formatPrice, discountPercentage } from "@/utils/format";
import type { Product } from "@/types";
import { trackAiEvent } from "@/lib/ai/client-events";
import { getValidImageUrl, normalizeImageUrl, isValidImageUrl } from "@/lib/image-utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
}

/**
 * Production-ready ProductCard component with:
 * - Proper Next.js Image usage with fill, sizes, and parent positioning
 * - Image validation and fallbacks
 * - Error boundaries and loading states
 * - Data validation to prevent rendering issues
 * - No layout shift (CLS prevention)
 * - Fully responsive with Tailwind CSS
 */
export function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  const [imageIdx, setImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const { addItem } = useCartStore();
  const { addItem: addWishlist, hasItem } = useWishlistStore();

  // Prevent hydration mismatch by only accessing localStorage after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Data validation - ensure product has required fields
  if (!product || !product.id || !product.name) {
    console.warn('Invalid product data provided to ProductCard:', product);
    return null;
  }

  // Image validation and normalization
  const images = React.useMemo(() => {
    if (!product.images || product.images.length === 0) {
      return ['/placeholder.svg'];
    }
    
    // Filter and normalize image URLs
    const validImages = product.images
      .map(img => normalizeImageUrl(img))
      .filter(img => isValidImageUrl(img));
    
    return validImages.length > 0 ? validImages : ['/placeholder.svg'];
  }, [product.images]);

  const inWishlist = mounted ? hasItem(product.id) : false;
  const discount = product.comparePrice ? discountPercentage(product.price, product.comparePrice) : 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockAt || 5);
  const isOutOfStock = product.stock === 0;

  const trackView = useCallback(() => {
    trackAiEvent({ 
      type: "VIEW", 
      productId: product.id, 
      metadata: { source: "product_card" } 
    });
  }, [product.id]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: "easeOut" }}
      className="product-card group relative bg-white dark:bg-card rounded-2xl overflow-hidden border border-border hover:border-gold-300 transition-all duration-300"
      onMouseEnter={() => { 
        setIsHovered(true); 
        if (images.length > 1) setImageIdx(1); 
      }}
      onMouseLeave={() => { 
        setIsHovered(false); 
        setImageIdx(0); 
      }}
    >
      {/* Image container with proper positioning for Next.js Image fill */}
      <div className="relative aspect-[3/3.5] w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <Link href={`/products/${product.slug}`} onClick={trackView} className="block w-full h-full">
          <div className="relative w-full h-full">
            <Image
              src={imageError ? '/placeholder.svg' : images[imageIdx]}
              alt={product.name || 'Product'}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              onError={handleImageError}
              onLoad={handleImageLoad}
              quality={85}
            />
            
            {/* Loading skeleton */}
            {isLoading && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
            )}
            
            {/* Overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`} />
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold shadow-md">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white text-[10px] font-bold shadow-md">
              <Crown className="w-2.5 h-2.5" /> PREMIUM
            </span>
          )}
          {isLowStock && (
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-bold shadow-md">
              STOCK LIMITÉ
            </span>
          )}
          {isOutOfStock && (
            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-600 text-white text-[10px] font-bold shadow-md">
              ÉPUISÉ
            </span>
          )}
        </div>

        {/* Wishlist & View buttons */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 z-10 ${
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
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-md transition-all border ${
              inWishlist
                ? "bg-red-500 text-white border-red-400/50"
                : "bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 hover:bg-red-50 hover:text-red-500 border-white/60 dark:border-gray-700"
            }`}
            aria-label={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
          </motion.button>
          <Link
            href={`/products/${product.slug}`}
            onClick={trackView}
            className="w-9 h-9 rounded-xl bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 flex items-center justify-center shadow-lg backdrop-blur-md hover:bg-blue-50 hover:text-blue-600 transition-all border border-white/60 dark:border-gray-700"
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
          className="absolute bottom-3 left-3 right-3 z-10"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
              trackAiEvent({ type: "ADD_TO_CART", productId: product.id, metadata: { source: "product_card" } });
            }}
            disabled={isOutOfStock}
            className="w-full h-11 px-4 text-sm font-bold flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400">
            <Truck className="h-2.5 w-2.5" />
            Livraison rapide
          </span>
          {!isOutOfStock && (
            <span className="text-[10px] font-bold text-green-600 dark:text-green-400">● En stock</span>
          )}
        </div>

        {/* Product name */}
        <Link
          href={`/products/${product.slug}`}
          onClick={trackView}
          className="block min-h-[2.5rem] text-sm font-semibold line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug text-gray-900 dark:text-gray-100"
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
                  className={`w-3 h-3 ${
                    s <= Math.round(product.rating)
                      ? "text-amber-500 fill-amber-500"
                      : "text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-600 dark:text-gray-400">
              {product.rating.toFixed(1)} ({new Intl.NumberFormat("fr-MA").format(product.reviewCount)})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Color variants */}
        {product.variants && product.variants.filter((v) => v.name === "Color").length > 0 && (
          <div className="flex gap-1.5 pt-1">
            {product.variants
              .filter((v) => v.name === "Color")
              .slice(0, 5)
              .map((v) => (
                <div
                  key={v.id}
                  className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                  style={{ backgroundColor: v.value }}
                  title={v.label}
                />
              ))}
            {product.variants.filter((v) => v.name === "Color").length > 5 && (
              <span className="text-[10px] text-gray-600 dark:text-gray-400 self-center">
                +{product.variants.filter((v) => v.name === "Color").length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Product Grid Component
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
      <div className={`grid ${gridClass} gap-4 md:gap-6`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Aucun produit trouvé</h3>
        <p className="text-gray-600 dark:text-gray-400">Essayez de modifier vos filtres ou votre recherche.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClass} gap-4 md:gap-6`}>
      {products
        .filter(product => product && product.id && product.name) // Filter out invalid products
        .map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} priority={index < 4} />
        ))}
    </div>
  );
}

// Skeleton Component
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="aspect-[3/3.5] bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="p-4 space-y-2.5">
        <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
      </div>
    </div>
  );
}
