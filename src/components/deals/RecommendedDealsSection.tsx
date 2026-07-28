"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import type { Deal } from "@/types";

interface RecommendedDealsSectionProps {
  deals?: Deal[];
}

export function RecommendedDealsSection({
  deals = [],
}: RecommendedDealsSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  if (deals.length === 0) return null;

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="px-4 py-6"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="text-xl font-black text-neutral-900 mb-4"
      >
        👤 Recommended For You
      </motion.h2>

      <div className="grid grid-cols-2 gap-3">
        {deals.slice(0, 8).map((deal) => (
          <motion.div
            key={deal.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -4 }}
            className="relative rounded-2xl overflow-hidden bg-white border border-neutral-100 hover:shadow-lg transition-shadow group"
          >
            {/* Image */}
            <div className="relative h-32 bg-gradient-to-br from-neutral-100 to-neutral-50 overflow-hidden">
              <img
                src={deal.product.images[0] || "/placeholder.jpg"}
                alt={deal.product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />

              {/* Wishlist button */}
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-md hover:bg-red-50"
              >
                <Heart className="w-4 h-4 text-neutral-400 hover:text-red-500 transition-colors" />
              </motion.button>

              {/* Discount */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                -{deal.discountPercentage}%
              </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
              <p className="text-xs font-bold text-neutral-900 line-clamp-2">
                {deal.product.name}
              </p>

              <div className="flex items-center gap-1 text-xs">
                <span className="text-yellow-400">★</span>
                <span className="font-semibold text-neutral-900">4.5</span>
                <span className="text-neutral-500">({Math.floor(Math.random() * 500) + 50})</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="font-black text-red-600 text-sm">
                  {deal.salePrice.toLocaleString("fr-MA")}
                </span>
                <span className="text-xs text-neutral-500 line-through">
                  {deal.regularPrice?.toLocaleString("fr-MA")}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-1.5 bg-red-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:bg-red-600 transition-colors"
              >
                <ShoppingBag className="w-3 h-3" />
                Add
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
