"use client";

import { motion } from "framer-motion";
import { Star, Zap, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { MysteryBox, Product } from "@/types";

interface PremiumBoxCardProps {
  box: MysteryBox;
  onReveal?: () => void;
  compact?: boolean;
}

export function PremiumBoxCard({ box, onReveal, compact = false }: PremiumBoxCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  // Create stub product for cart
  const boxAsProduct: Product = {
    id: box.id,
    name: box.name,
    slug: box.slug || box.id,
    description: box.description,
    price: box.price,
    categoryId: "mystery",
    category: { id: "mystery", name: "Mystery", slug: "mystery" },
    images: [box.image || "/placeholder-mystery-box.jpg"],
    tags: ["mystery"],
    sku: `MB-${box.id}`,
    stock: box.stock,
    lowStockAt: 3,
    published: true,
    featured: false,
    rating: 4.5,
    reviewCount: 128,
    soldCount: 342,
    variants: [],
    createdAt: box.createdAt,
    updatedAt: box.createdAt,
  };

  // Determine tier colors
  const getTierColors = (name: string) => {
    if (name.includes("Bronze")) return { bg: "from-amber-600 to-amber-700", accent: "bg-amber-500" };
    if (name.includes("Silver")) return { bg: "from-slate-400 to-slate-500", accent: "bg-slate-400" };
    if (name.includes("Gold")) return { bg: "from-yellow-500 to-yellow-600", accent: "bg-yellow-500" };
    if (name.includes("Platinum")) return { bg: "from-purple-600 to-purple-700", accent: "bg-purple-500" };
    return { bg: "from-neutral-600 to-neutral-700", accent: "bg-neutral-500" };
  };

  const colors = getTierColors(box.name);

  const discountPercent = Math.round(((100 - box.price / 50) / 100) * 20); // Mock discount
  
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        whileHover={{ y: -4 }}
        className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white border border-neutral-100"
      >
        <div className={`relative h-24 bg-gradient-to-br ${colors.bg}`} />
        <div className="p-3 space-y-2">
          <h3 className="font-bold text-sm text-neutral-900">{box.name}</h3>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg font-black text-neutral-900">
              {box.price.toLocaleString("fr-MA")} MAD
            </span>
            {discountPercent > 0 && (
              <span className={`${colors.accent} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                -{discountPercent}%
              </span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => addItem(boxAsProduct, 1)}
            className={`w-full py-2 bg-gradient-to-r ${colors.bg} text-white font-bold text-sm rounded-lg`}
          >
            Add
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow bg-white border border-neutral-100"
    >
      {/* Tier gradient header */}
      <motion.div
        className={`relative h-40 bg-gradient-to-br ${colors.bg} overflow-hidden`}
      >
        {/* Animated background pattern */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2"
        />

        {/* Stock indicator */}
        {box.stock < 20 && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-3 right-3 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            Only {box.stock} left!
          </motion.div>
        )}

        {/* Box name overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-5xl mb-2"
          >
            🎁
          </motion.div>
          <h3 className="text-xl font-black text-white drop-shadow-lg">{box.name}</h3>
        </div>
      </motion.div>

      {/* Content section */}
      <div className="p-4 space-y-3">
        {/* Value label */}
        <div className="bg-neutral-50 px-3 py-2 rounded-xl">
          <p className="text-xs text-neutral-600 font-semibold">WORTH UP TO</p>
          <p className="text-lg font-black text-neutral-900">{box.valueLabel}</p>
        </div>

        {/* Price and discount */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900">
              {box.price.toLocaleString("fr-MA")} MAD
            </span>
            {discountPercent > 0 && (
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`${colors.accent} text-white text-xs font-bold px-2 py-0.5 rounded-full`}
              >
                {discountPercent}% OFF
              </motion.span>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <span className="text-neutral-600 font-medium">4.8 (342 reviews)</span>
        </div>

        {/* Items count */}
        <div className="text-sm text-neutral-600">
          Contains <span className="font-bold text-neutral-900">3-5 premium items</span>
        </div>

        {/* Reveal button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReveal}
          className="w-full py-2.5 border-2 border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
        >
          View Possible Items
        </motion.button>

        {/* Add to cart button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addItem(boxAsProduct, 1)}
          className={`w-full py-3 bg-gradient-to-r ${colors.bg} text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow`}
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}
