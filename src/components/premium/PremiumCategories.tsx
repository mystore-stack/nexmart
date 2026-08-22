"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Grid3X3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { categoryUrl } from "@/lib/navigation/NavigationService";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  description: string;
  featured: boolean;
}

interface PremiumCategoriesProps {
  categories: Category[];
}

export function PremiumCategories({ categories }: PremiumCategoriesProps) {
  if (categories.length === 0) return null;

  // Create varied layout: 1 large, 2 medium, 4 small
  const largeCategory = categories[0];
  const mediumCategories = categories.slice(1, 3);
  const smallCategories = categories.slice(3, 7);

  return (
    <section className="relative bg-[#FAF9F7] py-20 overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(15 107 87 / 0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-[#0F6B57] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Grid3X3 className="w-4 h-4" />
              <span>Catégories</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-[#111111] mb-2 font-display">
              Explorer par
              <span className="block text-[#0F6B57]">
                Catégorie
              </span>
            </h2>
          </div>

          <Link href={categoryUrl('all')}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:flex items-center gap-2 bg-white text-[#111111] px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-[#ECECEC]"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Editorial Layout */}
        <div className="space-y-6">
          {/* Large Featured Category */}
          {largeCategory && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative group cursor-pointer"
            >
              <Link href={categoryUrl(largeCategory.slug)}>
                <div className="relative aspect-[21/9] rounded-3xl overflow-hidden">
                  <Image
                    src={largeCategory.image}
                    alt={largeCategory.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="max-w-2xl">
                      <h3 className="text-4xl font-bold text-white mb-2 font-display">{largeCategory.name}</h3>
                      <p className="text-lg text-gray-200 mb-4 line-clamp-2">{largeCategory.description}</p>
                      <div className="flex items-center gap-4">
                        <span className="bg-[#C8A04D] text-white px-4 py-2 rounded-full text-sm font-semibold">
                          {largeCategory.productCount} produits
                        </span>
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-white font-semibold"
                        >
                          <span>Explorer</span>
                          <ArrowRight className="w-5 h-5" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Medium Categories */}
          {mediumCategories.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {mediumCategories.map((category, i) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="relative group cursor-pointer"
                >
                  <Link href={categoryUrl(category.slug)}>
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h4 className="text-2xl font-bold text-white mb-1 font-display">{category.name}</h4>
                        <p className="text-sm text-gray-200 mb-3 line-clamp-1">{category.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="bg-[#C8A04D] text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {category.productCount} produits
                          </span>
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-1 text-white text-sm font-semibold"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Small Categories Grid */}
          {smallCategories.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {smallCategories.map((category, i) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="relative group cursor-pointer"
                >
                  <Link href={categoryUrl(category.slug)}>
                    <div className="relative aspect-square rounded-xl overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h5 className="text-lg font-bold text-white mb-1 font-display">{category.name}</h5>
                        <p className="text-xs text-gray-200">{category.productCount} produits</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="md:hidden text-center mt-8"
        >
          <Link href={categoryUrl('all')}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-white text-[#111111] px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-[#ECECEC]"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
