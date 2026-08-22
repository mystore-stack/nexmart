"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star, Eye, GitCompare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: any;
  dealPrice?: number;
}

function ProductCard({ product, dealPrice }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Memoize price calculations to prevent recalculation on re-renders
  const price = useMemo(() => dealPrice || product.price, [dealPrice, product.price]);
  const originalPrice = useMemo(() => dealPrice ? product.price : product.comparePrice, [dealPrice, product.price, product.comparePrice]);
  const discount = useMemo(() => originalPrice ? Math.round((1 - price / originalPrice) * 100) : null, [originalPrice, price]);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100/50 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500">
          {/* Image */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" role="img" aria-label={product.name}>
                <span className="text-5xl font-bold text-gray-300">{product.name.charAt(0)}</span>
              </div>
            )}
            
            {/* Discount Badge */}
            {discount && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm px-4 py-2 rounded-2xl font-bold shadow-lg"
              >
                -{discount}%
              </motion.div>
            )}

            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsWishlisted(!isWishlisted);
                  }}
                  className="p-3 bg-white rounded-2xl shadow-xl hover:bg-gray-50 transition-colors"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-white rounded-2xl shadow-xl hover:bg-gray-50 transition-colors"
                  aria-label="Quick view"
                >
                  <Eye className="w-5 h-5 text-gray-700" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-white rounded-2xl shadow-xl hover:bg-gray-50 transition-colors"
                  aria-label="Compare product"
                >
                  <GitCompare className="w-5 h-5 text-gray-700" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Category */}
            {product.category && (
              <p className="text-xs font-semibold text-[#0D7A5E] mb-2 uppercase tracking-wider">
                {product.category.name}
              </p>
            )}
            
            {/* Title */}
            <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-lg leading-snug">
              {product.name}
            </h3>
            
            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{product.rating.toFixed(1)}</span>
                {product.reviewCount > 0 && (
                  <span className="text-sm text-gray-400">({product.reviewCount})</span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl font-bold text-gray-900">{price.toLocaleString()} MAD</span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">{originalPrice.toLocaleString()} MAD</span>
              )}
            </div>

            {/* Add to Cart */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#0D7A5E] to-[#0D7A5E] hover:from-[#0a634d] hover:to-[#0a634d] text-white py-4 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0D7A5E]/20"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
              <ArrowRight className="w-4 h-4 ml-auto" />
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export const ProductCardMemo = React.memo(ProductCard);
export { ProductCard };
