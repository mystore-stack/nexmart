"use client";

import React from "react";
import { ProductCard } from "../ProductCard";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";

interface TrendingProductsSectionProps {
  config: any;
  products?: any[];
}

export function TrendingProductsSection({ config, products = [] }: TrendingProductsSectionProps) {
  // Show placeholder if no products available
  const displayProducts = products.length > 0 ? products : [
    { id: '1', name: 'Designer Bag', price: 3200, comparePrice: 4000, rating: 4.7, reviewCount: 150, slug: 'designer-bag', category: { name: 'Fashion' }, images: [] },
    { id: '2', name: 'Smart Watch', price: 1800, comparePrice: 2200, rating: 4.6, reviewCount: 95, slug: 'smart-watch', category: { name: 'Electronics' }, images: [] },
    { id: '3', name: 'Luxury Perfume', price: 950, comparePrice: 1200, rating: 4.8, reviewCount: 210, slug: 'luxury-perfume', category: { name: 'Beauty' }, images: [] },
    { id: '4', name: 'Silk Blouse', price: 650, comparePrice: 850, rating: 4.5, reviewCount: 75, slug: 'silk-blouse', category: { name: 'Fashion' }, images: [] },
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
    <section className="py-20 bg-gradient-to-b from-white via-green-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-6">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">Trending</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {config.title || "Trending Products"}
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
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {displayProducts.map((product: any) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <ProductCard product={product} />
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-xl shadow-green-500/20"
            >
              View All Trending
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
