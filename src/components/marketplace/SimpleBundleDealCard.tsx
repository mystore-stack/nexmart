"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Gift } from "lucide-react";

interface SimpleBundleDealCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice: number;
  itemCount: number;
  savings: number;
  index?: number;
}

export function SimpleBundleDealCard({
  id,
  name,
  description,
  image,
  price,
  originalPrice,
  itemCount,
  savings,
  index = 0,
}: SimpleBundleDealCardProps) {
  const savingPercent = Math.round((savings / originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm hover:shadow-lg transition-all"
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

        {/* Gift badge */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
        >
          <Gift className="h-3 w-3" />
          Lot
        </motion.div>

        {/* Savings badge */}
        {savingPercent > 0 && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-bold">
            Économisez {savingPercent}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-2">
        {/* Name */}
        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2">
          {name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-1">{description}</p>

        {/* Item count */}
        <div className="text-xs text-slate-500 font-medium">
          {itemCount} articles
        </div>

        {/* Price section */}
        <div className="space-y-1 pt-1 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">
              {price.toLocaleString("fr-MA")} MAD
            </span>
            {originalPrice > price && (
              <span className="text-xs text-slate-500 line-through">
                {originalPrice.toLocaleString("fr-MA")} MAD
              </span>
            )}
          </div>
          <p className="text-xs text-green-600 font-semibold">
            Économisez {savings.toLocaleString("fr-MA")} MAD
          </p>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 h-8 sm:h-9 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs font-bold hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          <ShoppingCart className="h-3 w-3" />
          Ajouter le lot
        </motion.button>
      </div>
    </motion.div>
  );
}
