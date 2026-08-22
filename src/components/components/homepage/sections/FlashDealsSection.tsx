"use client";

import React, { useState, useEffect } from "react";
import { ProductCard } from "../ProductCard";
import { motion } from "framer-motion";
import { Clock, Zap, Flame } from "lucide-react";

interface FlashDealsSectionProps {
  config: any;
  flashDeal?: any;
}

export function FlashDealsSection({ config, flashDeal }: FlashDealsSectionProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  // Show placeholder if no flash deal available
  const displayFlashDeal = flashDeal || {
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    products: [
      { id: '1', product: { id: '1', name: 'Summer Dress', price: 800, comparePrice: 1200, rating: 4.5, reviewCount: 95, slug: 'summer-dress', category: { name: 'Fashion' }, images: [] }, dealPrice: 800 },
      { id: '2', product: { id: '2', name: 'Wireless Headphones', price: 1200, comparePrice: 1800, rating: 4.7, reviewCount: 150, slug: 'wireless-headphones', category: { name: 'Electronics' }, images: [] }, dealPrice: 1200 },
      { id: '3', product: { id: '3', name: 'Skincare Set', price: 450, comparePrice: 700, rating: 4.8, reviewCount: 200, slug: 'skincare-set', category: { name: 'Beauty' }, images: [] }, dealPrice: 450 },
      { id: '4', product: { id: '4', name: 'Running Shoes', price: 600, comparePrice: 900, rating: 4.6, reviewCount: 80, slug: 'running-shoes', category: { name: 'Sports' }, images: [] }, dealPrice: 600 },
    ],
  };

  useEffect(() => {
    if (displayFlashDeal?.endDate) {
      const timer = setInterval(() => {
        const now = new Date();
        const diff = new Date(displayFlashDeal.endDate).getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft({ hours, minutes, seconds });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [displayFlashDeal?.endDate]);

  if (!displayFlashDeal || !displayFlashDeal.products || displayFlashDeal.products.length === 0) return null;

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
    <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                {config.title || "Flash Deals"}
              </h2>
              {config.subtitle && (
                <p className="text-gray-600 mt-1">{config.subtitle}</p>
              )}
            </div>
          </div>

          {/* Countdown Timer */}
          {config.countdownEnabled && displayFlashDeal.endDate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 bg-white/80 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-xl border border-white/50"
            >
              <div className="flex items-center gap-2 text-red-600">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Ends in:</span>
              </div>
              <div className="flex items-center gap-3">
                {[
                  { value: timeLeft.hours, label: 'H' },
                  { value: timeLeft.minutes, label: 'M' },
                  { value: timeLeft.seconds, label: 'S' },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white px-4 py-2 rounded-xl font-mono font-bold text-xl min-w-[60px] shadow-lg">
                      {String(item.value).padStart(2, '0')}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          {displayFlashDeal.products.map((item: any) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <ProductCard product={item.product} dealPrice={item.dealPrice} />
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all shadow-xl"
            >
              View All Deals
              <Flame className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
