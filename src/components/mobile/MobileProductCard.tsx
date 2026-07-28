"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/index";
import { formatPrice, discountPercentage } from "@/utils/format";
import type { Product } from "@/types";

interface MobileProductCardProps {
  product: Product;
  index?: number;
}

export function MobileProductCard({ product, index = 0 }: MobileProductCardProps) {
  const { addItem } = useCartStore();
  const { addItem: addWishlist, hasItem } = useWishlistStore();
  const [added, setAdded] = useState(false);

  const discount = product.comparePrice
    ? discountPercentage(product.price, product.comparePrice)
    : 0;
  const isOutOfStock = product.stock === 0;
  const inWishlist = hasItem(product.id);

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex flex-col h-full"
    >
      <Link href={`/products/${product.slug}`} className="flex-1">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 mb-2">
          <Image
            src={product.images?.[0] || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="50vw"
            priority={index < 4}
          />

          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
              -{discount}%
            </div>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-bold">EPUISE</span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex-1 flex flex-col">
          {/* Name */}
          <h3 className="text-xs font-semibold text-slate-900 line-clamp-2 mb-1">
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-2.5 w-2.5 ${
                      s <= Math.round(product.rating)
                        ? "fill-orange-500 text-orange-500"
                        : "fill-slate-200 text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-500">
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-1 mb-2">
            <span className="text-sm font-bold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[10px] text-slate-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        {/* Add to cart button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          whileTap={{ scale: 0.95 }}
          className="flex-1 flex items-center justify-center gap-1 h-10 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {added ? "✓" : "Ajouter"}
        </motion.button>

        {/* Wishlist button */}
        <motion.button
          onClick={() => addWishlist(product)}
          whileTap={{ scale: 0.95 }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            inWishlist
              ? "bg-red-100 text-red-500"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
        </motion.button>
      </div>
    </motion.div>
  );
}
