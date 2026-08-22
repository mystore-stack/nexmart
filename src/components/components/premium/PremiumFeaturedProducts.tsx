"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Flame, Sparkles, Crown, ArrowRight } from "lucide-react";
import { PremiumProductCard } from "./PremiumProductCard";
import Link from "next/link";
import { productUrl } from "@/lib/navigation/NavigationService";

interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  hoverImage?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  stock?: number;
  freeShipping?: boolean;
  installmentAvailable?: boolean;
  colors?: string[];
  brand?: string;
  category?: string;
  badge?: string;
  ranking?: number;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  products: Product[];
}

interface PremiumFeaturedProductsProps {
  products: Product[];
}

export function PremiumFeaturedProducts({ products }: PremiumFeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState("trending");

  // Create tabs with different product selections
  const tabs: Tab[] = [
    {
      id: "trending",
      label: "Trending",
      icon: <TrendingUp className="w-4 h-4" />,
      products: products.slice(0, 8),
    },
    {
      id: "popular",
      label: "Populaire",
      icon: <Flame className="w-4 h-4" />,
      products: products.slice(2, 10),
    },
    {
      id: "new",
      label: "Nouveautés",
      icon: <Sparkles className="w-4 h-4" />,
      products: products.slice(4, 12),
    },
    {
      id: "luxury",
      label: "Luxe",
      icon: <Crown className="w-4 h-4" />,
      products: products.slice(0, 6).map(p => ({ ...p, badge: "Premium", price: p.price * 2 })),
    },
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];

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
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-12"
        >
          <div className="mb-6 md:mb-0">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#111111] mb-2 font-display">
              Produits
              <span className="block text-[#0F6B57]">
                en Vedette
              </span>
            </h2>
            <p className="text-gray-600 text-lg">Découvrez notre sélection de produits populaires</p>
          </div>

          <Link href={productUrl('all')}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-[#0F6B57] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#0F6B57] text-white shadow-lg"
                  : "bg-white text-[#111111] hover:bg-gray-50 border border-[#ECECEC]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {currentTab.products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PremiumProductCard {...product} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href={productUrl('all')}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              <span>Charger plus de produits</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
