"use client";

import { motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import type { Deal } from "@/types";

interface SuperDealsSectionProps {
  title?: string;
  deals?: Deal[];
  onViewAll?: () => void;
}

export function SuperDealsSection({
  title = "🏆 Top Deals",
  deals = [],
  onViewAll,
}: SuperDealsSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-4"
      >
        <h2 className="text-xl font-black text-neutral-900">{title}</h2>
        <motion.button
          whileHover={{ scale: 1.05, x: 4 }}
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {deals.slice(0, 4).map((deal, idx) => (
          <motion.div
            key={deal.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -4 }}
            className="relative rounded-2xl overflow-hidden bg-white border border-neutral-100 hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* Image */}
            <div className="relative h-32 bg-gradient-to-br from-neutral-100 to-neutral-50 overflow-hidden group">
              <img
                src={deal.product.images[0] || "/placeholder.jpg"}
                alt={deal.product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />

              {/* Discount badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                -{deal.discountPercentage}%
              </div>

              {/* Star badge */}
              <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-1 bg-yellow-400 text-white rounded-lg">
                <Star className="w-3 h-3 fill-white" />
                <span className="text-xs font-bold">4.8</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <p className="text-xs font-bold text-neutral-900 line-clamp-2 mb-2">
                {deal.product.name}
              </p>

              {/* Price */}
              <div className="flex items-center gap-1 mb-2">
                <span className="text-sm font-black text-red-600">
                  {deal.salePrice.toLocaleString("fr-MA")}
                </span>
                <span className="text-xs text-neutral-500 line-through">
                  {deal.regularPrice?.toLocaleString("fr-MA")}
                </span>
              </div>

              {/* "Sold" text */}
              <p className="text-xs text-neutral-600">
                {Math.floor(Math.random() * 5000) + 100} sold
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
