"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Heart, Eye, ShoppingCart, Clock, Flame, Tag } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";

interface SuperDealCardProps {
  deal: {
    id: string;
    product: {
      id: string;
      name: string;
      slug: string;
      image: string;
      price: number;
      comparePrice?: number;
      rating: number;
      soldCount: number;
    };
    dealPrice: number;
    discountType: string;
    discountValue: number;
    endDate?: string;
    countdown?: boolean;
    featured?: boolean;
    flashSale?: boolean;
    buttonText?: string;
    buttonUrl?: string;
  };
}

export function SuperDealCard({ deal }: SuperDealCardProps) {
  const { product, dealPrice, discountType, discountValue, endDate, countdown, flashSale, buttonText, buttonUrl } = deal;

  const calculateDiscount = () => {
    if (discountType === "PERCENTAGE") {
      return discountValue;
    } else if (discountType === "FIXED_AMOUNT" && product.comparePrice) {
      return Math.round((discountValue / product.comparePrice) * 100);
    }
    return 0;
  };

  const discount = calculateDiscount();

  const handleClick = () => {
    // Track click event
    fetch(`/api/super-deals/${deal.id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "CLICK" }),
    }).catch(console.error);

    if (buttonUrl) {
      window.open(buttonUrl, "_blank");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Flash Sale Badge */}
      {flashSale && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Flame className="w-3 h-3" />
          Flash Sale
        </div>
      )}

      {/* Discount Badge */}
      {discount > 0 && !flashSale && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          -{discount}%
        </div>
      )}

      {/* Discount Type Badge */}
      {discountType === "BUY_ONE_GET_ONE" && (
        <div className="absolute top-3 left-3 z-10 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Tag className="w-3 h-3" />
          BOGO
        </div>
      )}

      {/* Wishlist Button */}
      <button className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
        <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
      </button>

      {/* Quick View Button */}
      <button className="absolute top-12 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50">
        <Eye className="w-4 h-4 text-gray-600 hover:text-blue-500" />
      </button>

      {/* Product Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating & Sold */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{product.soldCount} sold</span>
        </div>

        {/* Countdown Timer */}
        {countdown && endDate && (
          <div className="mb-3">
            <CountdownTimer endDate={endDate} compact showLabel={false} />
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-primary">
            {dealPrice.toFixed(2)} MAD
          </span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.comparePrice.toFixed(2)} MAD
            </span>
          )}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClick}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
            flashSale
              ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {buttonText || "Add to Cart"}
        </motion.button>
      </div>
    </motion.div>
  );
}
