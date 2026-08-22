"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye, Scale, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { mapProductToCartItem } from "@/lib/cart/cart.mapper";
import { addCartItem } from "@/lib/cart/cart.service";
import { productUrl } from "@/lib/navigation/NavigationService";

interface PremiumProductCardProps {
  id: string;
  name: string;
  slug: string;
  image: string;
  hoverImage?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  stock?: number;
  freeShipping?: boolean;
  installmentAvailable?: boolean;
  colors?: string[];
  brand?: string;
  category?: string;
  badge?: string;
  ranking?: number;
}

export function PremiumProductCard({
  id,
  name,
  slug,
  image,
  hoverImage,
  price,
  originalPrice,
  discountPercent,
  rating = 0,
  reviewCount = 0,
  inStock = true,
  stock = 0,
  freeShipping = false,
  installmentAvailable = false,
  colors = [],
  brand,
  category,
  badge,
  ranking,
}: PremiumProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    if (!inStock) return;
    
    // Map product to unified cart item
    const product = {
      id,
      name,
      slug,
      price,
      images: [image],
      categoryId: category,
    };
    
    const cartItem = mapProductToCartItem(product, 1);
    addCartItem(cartItem);
  };

  const discount = discountPercent || (originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0);
  const stockPercentage = stock > 0 ? Math.min(100, (stock / 50) * 100) : 0;

  return (
    <motion.div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Ranking Badge */}
      {ranking && ranking <= 10 && (
        <div className="absolute top-3 left-3 z-20">
          <div className="bg-[#C8A04D] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
            #{ranking}
          </div>
        </div>
      )}

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-3 right-3 z-20">
          <div className="bg-[#0F6B57] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            -{discount}%
          </div>
        </div>
      )}

      {/* Custom Badge */}
      {badge && !discount && (
        <div className="absolute top-3 right-3 z-20">
          <div className="bg-[#0F6B57] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            {badge}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-1/2 right-3 z-20 flex flex-col gap-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isWishlisted ? "fill-[#C8A04D] text-[#C8A04D]" : "text-gray-700"}`}
          />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <Eye className="w-5 h-5 text-gray-700" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <Scale className="w-5 h-5 text-gray-700" />
        </motion.button>
      </div>

      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF9F7]">
        <Link href={productUrl(slug)}>
          <motion.div
            className="relative w-full h-full"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {hoverImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={hoverImage}
                  alt={`${name} hover`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </motion.div>
            )}
          </motion.div>
        </Link>

        {/* Stock Progress */}
        {!inStock && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm py-2 px-4">
            <p className="text-white text-sm font-semibold text-center">Épuisé</p>
          </div>
        )}
        {inStock && stock <= 10 && stock > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm py-2 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-xs font-semibold">Stock limité</span>
              <span className="text-white text-xs">{stock} restants</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-1.5">
              <div
                className="bg-[#C8A04D] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stockPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Brand */}
        {brand && (
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{brand}</p>
        )}

        {/* Name */}
        <Link href={productUrl(slug)}>
          <h3 className="font-semibold text-[#111111] line-clamp-2 group-hover:text-[#0F6B57] transition-colors min-h-[2.5rem]">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? "fill-[#C8A04D] text-[#C8A04D]"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        )}

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {colors.slice(0, 4).map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-xs text-gray-500">+{colors.length - 4}</span>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {freeShipping && (
            <div className="flex items-center gap-1 text-xs text-[#0F6B57] font-medium">
              <Truck className="w-3 h-3" />
              <span>Livraison gratuite</span>
            </div>
          )}
          {installmentAvailable && (
            <div className="bg-[#C8A04D]/10 text-[#C8A04D] text-xs px-2 py-0.5 rounded-full font-medium">
              Paiement en 3x
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end gap-2">
          <span className="text-xl font-bold text-[#111111]">
            {price.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-400 line-through">
              {originalPrice.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl ${
            inStock
              ? "bg-[#0F6B57] text-white hover:bg-[#0F6B57]/90"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{inStock ? "Ajouter au panier" : "Épuisé"}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
