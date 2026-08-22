"use client";

import React from "react";
import { ProductCard } from "../ProductCard";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

interface RecommendedForYouSectionProps {
  config: any;
  products?: any[];
}

export function RecommendedForYouSection({ config, products = [] }: RecommendedForYouSectionProps) {
  // Show placeholder if no products available
  const displayProducts = products.length > 0 ? products : [
    { id: '1', name: 'Personalized Skincare Set', price: 450, comparePrice: 600, rating: 4.8, reviewCount: 95, slug: 'skincare-set', category: { name: 'Beauty' }, images: [] },
    { id: '2', name: 'Custom Jewelry Box', price: 850, comparePrice: 1100, rating: 4.7, reviewCount: 65, slug: 'jewelry-box', category: { name: 'Fashion' }, images: [] },
    { id: '3', name: 'Tailored Blazer', price: 1200, comparePrice: 1500, rating: 4.6, reviewCount: 45, slug: 'blazer', category: { name: 'Fashion' }, images: [] },
    { id: '4', name: 'Designer Accessories', price: 550, comparePrice: 750, rating: 4.5, reviewCount: 80, slug: 'accessories', category: { name: 'Fashion' }, images: [] },
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
    <section className="py-20 bg-gradient-to-b from-white via-purple-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">AI Powered</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {config.title || "Recommended For You"}
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

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-50 rounded-2xl border border-purple-100">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-700">
              AI-powered recommendations based on your preferences
            </span>
          </div>
        </motion.div>

        {/* View All Button */}
        {config.showViewAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-xl shadow-purple-500/20"
            >
              View All Recommendations
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
