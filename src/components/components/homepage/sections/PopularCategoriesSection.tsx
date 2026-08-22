"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LayoutGrid, ArrowRight } from "lucide-react";

interface PopularCategoriesSectionProps {
  config: any;
  categories?: any[];
}

export function PopularCategoriesSection({ config, categories = [] }: PopularCategoriesSectionProps) {
  // Show placeholder if no categories available
  const displayCategories = categories.length > 0 ? categories : [
    { id: '1', name: 'Fashion', slug: 'fashion', image: null, _count: { products: 150 } },
    { id: '2', name: 'Electronics', slug: 'electronics', image: null, _count: { products: 85 } },
    { id: '3', name: 'Beauty', slug: 'beauty', image: null, _count: { products: 120 } },
    { id: '4', name: 'Home & Living', slug: 'home-living', image: null, _count: { products: 65 } },
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
    <section className="py-20 bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-6">
            <LayoutGrid className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Categories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {config.title || "Popular Categories"}
          </h2>
          {config.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {config.subtitle}
            </p>
          )}
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {displayCategories.map((category: any) => (
            <motion.div
              key={category.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Link
                href={`/categories/${category.slug}`}
                className="group block"
              >
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                      <span className="text-5xl font-bold text-blue-200">{category.name.charAt(0)}</span>
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="text-white font-bold text-xl mb-2 group-hover:translate-x-2 transition-transform">
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <span>{category._count?.products || 0} products</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl shadow-blue-500/20"
            >
              View All Categories
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
