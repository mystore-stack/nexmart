"use client";
// src/components/product/ProductCard.tsx
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Eye, Zap } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/index";
import { formatPrice, discountPercentage } from "@/utils/format";
import type { Product } from "@/types";

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

  const inWishlist = hasItem(product.id);
  const discount = product.comparePrice
    ? discountPercentage(product.price, product.comparePrice)
    : 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockAt;
  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="product-card group"
      onMouseEnter={() => {
        setIsHovered(true);
        if (product.images.length > 1) setImageIdx(1);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setImageIdx(0);
      }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.images[imageIdx] || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge bg-red-500 text-white text-[10px] font-bold px-2 py-1">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="badge bg-brand-500 text-white text-[10px] font-bold px-2 py-1 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> HOT
            </span>
          )}
          {isLowStock && (
            <span className="badge bg-orange-500 text-white text-[10px] font-bold px-2 py-1">
              LOW STOCK
            </span>
          )}
          {isOutOfStock && (
            <span className="badge bg-gray-500 text-white text-[10px] font-bold px-2 py-1">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-200 ${
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
        }`}>
          <button
            onClick={(e) => { e.preventDefault(); addWishlist(product); }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-all ${
              inWishlist
                ? "bg-red-500 text-white"
                : "bg-white dark:bg-card text-foreground hover:bg-red-50 hover:text-red-500"
            }`}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="w-9 h-9 rounded-xl bg-white dark:bg-card text-foreground flex items-center justify-center shadow-md hover:bg-muted transition-all"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick add */}
        <motion.div
          initial={false}
          animate={{ y: isHovered && !isOutOfStock ? 0 : 60, opacity: isHovered && !isOutOfStock ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-3 left-3 right-3"
        >
          <button
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            disabled={isOutOfStock}
            className="w-full btn-primary py-2.5 text-xs justify-center shadow-lg"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4">
        <Link
          href={`/products/${product.slug}`}
          className="block text-sm font-medium line-clamp-2 hover:text-brand-500 transition-colors leading-snug mb-2"
        >
          {product.name}
        </Link>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(product.rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted-foreground/30 fill-muted-foreground/10"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">
              {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-base">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Variants preview */}
        {product.variants.filter((v) => v.name === "Color").length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {product.variants
              .filter((v) => v.name === "Color")
              .slice(0, 5)
              .map((v) => (
                <div
                  key={v.id}
                  className="w-4 h-4 rounded-full border-2 border-border"
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
    </motion.div>
  );
}

// ─── Product Grid ──────────────────────────────────────────────

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

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No products found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClass} gap-4 md:gap-6`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} priority={index < 4} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/50">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-1/2" />
        <div className="skeleton h-5 rounded w-1/3" />
      </div>
    </div>
  );
}
