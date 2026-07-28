"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Zap } from "lucide-react";

interface SimpleFlashDealCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  comparePrice?: number;
  discount?: number;
  index?: number;
}

export function SimpleFlashDealCard({
  id,
  name,
  image,
  price,
  comparePrice,
  discount = 0,
  index = 0,
}: SimpleFlashDealCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Discount badge */}
        {discount > 0 && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
          >
            <Zap className="h-3 w-3" />
            -{discount}%
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-2">
        {/* Name */}
        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-900">
            {price.toLocaleString("fr-MA")} MAD
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-slate-500 line-through">
              {comparePrice.toLocaleString("fr-MA")}
            </span>
          )}
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 h-8 sm:h-9 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-orange-600 transition-colors"
        >
          <ShoppingCart className="h-3 w-3" />
          Ajouter
        </motion.button>
      </div>
    </motion.div>
  );
}
