"use client";

import React from "react";
import { ProductCard } from "../ProductCard";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";

interface SponsoredProductsSectionProps {
  config: any;
  products?: any[];
}

export function SponsoredProductsSection({ config, products = [] }: SponsoredProductsSectionProps) {
  // Show placeholder if no products available
  const displayProducts = products.length > 0 ? products : [
    { id: '1', product: { id: '1', name: 'Luxury Handbag', price: 2500, comparePrice: 3000, rating: 4.5, reviewCount: 120, slug: 'luxury-handbag', category: { name: 'Fashion' }, images: [] } },
    { id: '2', product: { id: '2', name: 'Designer Watch', price: 1500, comparePrice: 1800, rating: 4.8, reviewCount: 85, slug: 'designer-watch', category: { name: 'Accessories' }, images: [] } },
    { id: '3', product: { id: '3', name: 'Premium Perfume', price: 800, comparePrice: 1000, rating: 4.7, reviewCount: 200, slug: 'premium-perfume', category: { name: 'Beauty' }, images: [] } },
    { id: '4', product: { id: '4', name: 'Silk Scarf', price: 450, comparePrice: 600, rating: 4.6, reviewCount: 45, slug: 'silk-scarf', category: { name: 'Fashion' }, images: [] } },
    { id: '5', product: { id: '5', name: 'Leather Belt', price: 350, comparePrice: 450, rating: 4.4, reviewCount: 30, slug: 'leather-belt', category: { name: 'Accessories' }, images: [] } },
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
    <section className="py-20 bg-gradient-to-b from-white via-gray-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0D7A5E]/10 to-[#C89B3C]/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#0D7A5E]" />
            <span className="text-sm font-semibold text-[#0D7A5E] uppercase tracking-wider">Sponsored</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {config.title || "Featured Products"}
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
          {displayProducts.map((item: any) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <ProductCard product={item.product} />
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-xl"
            >
              View All Products
              <TrendingUp className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
