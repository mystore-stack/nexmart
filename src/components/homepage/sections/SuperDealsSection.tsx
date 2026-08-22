"use client";

import React from "react";
import { ProductCard } from "../ProductCard";
import { motion } from "framer-motion";
import { Zap, TrendingUp, ArrowRight } from "lucide-react";

interface SuperDealsSectionProps {
  config: any;
  superDeals?: any[];
}

export function SuperDealsSection({ config, superDeals = [] }: SuperDealsSectionProps) {
  // Show placeholder if no super deals available
  const displaySuperDeals = superDeals.length > 0 ? superDeals : [
    { id: '1', product: { id: '1', name: 'Premium Headphones', price: 2000, comparePrice: 2800, rating: 4.7, reviewCount: 120, slug: 'premium-headphones', category: { name: 'Electronics' }, images: [] }, dealPrice: 2000 },
    { id: '2', product: { id: '2', name: 'Designer Jacket', price: 1800, comparePrice: 2500, rating: 4.6, reviewCount: 85, slug: 'designer-jacket', category: { name: 'Fashion' }, images: [] }, dealPrice: 1800 },
    { id: '3', product: { id: '3', name: 'Smart TV', price: 3500, comparePrice: 4500, rating: 4.8, reviewCount: 200, slug: 'smart-tv', category: { name: 'Electronics' }, images: [] }, dealPrice: 3500 },
    { id: '4', product: { id: '4', name: 'Luxury Watch', price: 2800, comparePrice: 3500, rating: 4.5, reviewCount: 95, slug: 'luxury-watch', category: { name: 'Accessories' }, images: [] }, dealPrice: 2800 },
    { id: '5', product: { id: '5', name: 'Gaming Console', price: 2200, comparePrice: 3000, rating: 4.7, reviewCount: 150, slug: 'gaming-console', category: { name: 'Electronics' }, images: [] }, dealPrice: 2200 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full mb-6">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Super</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {config.title || "Super Deals"}
          </h2>
          {config.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {config.subtitle}
            </p>
          )}
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8"
        >
          {displaySuperDeals.map((deal: any) => (
            <motion.div
              key={deal.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <ProductCard product={deal.product} dealPrice={deal.dealPrice} />
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        {config.showViewAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-xl"
            >
              View All Super Deals
              <TrendingUp className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
