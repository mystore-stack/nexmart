"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, ShoppingCart, Star, ArrowRight } from "lucide-react";
import { PremiumProductCard } from "./PremiumProductCard";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  ordersCount?: number;
  inStock?: boolean;
}

interface PremiumBestSellersProps {
  products: Product[];
}

export function PremiumBestSellers({ products }: PremiumBestSellersProps) {
  if (products.length === 0) return null;

  const topSellers = products.slice(0, 10);

  return (
    <section className="relative bg-[#FAF9F7] py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(15 107 87 / 0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#C8A04D]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#0F6B57]/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-[#C8A04D] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Trophy className="w-4 h-4" />
              <span>Meilleures Ventes</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-[#111111] mb-2 font-display">
              Top Vendeurs
              <span className="block text-[#C8A04D]">
                Les plus populaires
              </span>
            </h2>
          </div>

          <Link href="/best-sellers">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:flex items-center gap-2 bg-[#0F6B57] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {topSellers.slice(0, 3).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`relative ${i === 0 ? 'md:-mt-8' : i === 1 ? 'md:mt-4' : ''}`}
            >
              <div className={`bg-gradient-to-br ${
                i === 0 ? 'from-[#C8A04D] to-[#C8A04D]/80' : i === 1 ? 'from-gray-200 to-gray-300' : 'from-[#0F6B57]/60 to-[#0F6B57]/40'
              } rounded-3xl p-6 shadow-2xl`}>
                {/* Ranking Badge */}
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                  i === 0 ? 'bg-[#C8A04D] text-2xl' : 
                  i === 1 ? 'bg-gray-400 text-xl' : 
                  'bg-[#0F6B57] text-lg'
                }`}>
                  #{i + 1}
                </div>

                {/* Product */}
                <div className="bg-white rounded-2xl p-4 mt-4">
                  <PremiumProductCard
                    {...product}
                    badge={i === 0 ? "Top Vendeur" : undefined}
                    ranking={i + 1}
                  />
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 text-center">
                    <ShoppingCart className="w-5 h-5 mx-auto mb-1 text-[#111111]" />
                    <p className="text-lg font-bold text-[#111111]">{product.ordersCount || 0}</p>
                    <p className="text-xs text-gray-600">Commandes</p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 text-center">
                    <Star className="w-5 h-5 mx-auto mb-1 text-[#C8A04D]" />
                    <p className="text-lg font-bold text-[#111111]">{product.rating || 0}</p>
                    <p className="text-xs text-gray-600">Note</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Other Best Sellers */}
        {topSellers.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {topSellers.slice(3).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="relative"
                >
                  {/* Ranking Badge */}
                  <div className="absolute top-2 left-2 z-10 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                    #{i + 4}
                  </div>

                  <PremiumProductCard {...product} ranking={i + 4} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mobile View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="md:hidden text-center mt-8"
        >
          <Link href="/best-sellers">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
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
