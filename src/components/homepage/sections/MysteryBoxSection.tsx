"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gift, Sparkles, ArrowRight, Lock } from "lucide-react";

interface MysteryBoxSectionProps {
  config: any;
  mysteryBoxes?: any[];
}

export function MysteryBoxSection({ config, mysteryBoxes = [] }: MysteryBoxSectionProps) {
  // Show placeholder if no mystery boxes available
  const displayMysteryBoxes = mysteryBoxes.length > 0 ? mysteryBoxes : [
    { id: '1', name: 'Luxury Box', description: 'Premium items worth up to 5000 MAD', price: 1500, originalValue: 5000, stockRemaining: 45, stockLimit: 100, slug: 'luxury-box' },
    { id: '2', name: 'Fashion Box', description: 'Curated fashion items and accessories', price: 800, originalValue: 2000, stockRemaining: 78, stockLimit: 150, slug: 'fashion-box' },
    { id: '3', name: 'Beauty Box', description: 'Skincare and cosmetic products', price: 500, originalValue: 1200, stockRemaining: 120, stockLimit: 200, slug: 'beauty-box' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0D7A5E] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C89B3C] rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full mb-6">
            <Gift className="w-4 h-4 text-[#C89B3C]" />
            <span className="text-sm font-semibold text-[#C89B3C] uppercase tracking-wider">Mystery</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {config.title || "Mystery Boxes"}
          </h2>
          {config.subtitle && (
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {config.subtitle}
            </p>
          )}
        </motion.div>

        {/* Mystery Boxes Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {displayMysteryBoxes.map((box: any) => (
            <motion.div
              key={box.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="group bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 hover:border-[#C89B3C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C89B3C]/10">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#0D7A5E] to-[#C89B3C] rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <Gift className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3">{box.name}</h3>
                
                {/* Description */}
                {box.description && (
                  <p className="text-gray-400 mb-6 leading-relaxed">{box.description}</p>
                )}

                {/* Price */}
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <span className="text-3xl font-bold text-[#C89B3C]">{box.price} MAD</span>
                    {box.originalValue && (
                      <span className="text-lg text-gray-500 line-through ml-2">{box.originalValue} MAD</span>
                    )}
                  </div>
                </div>

                {/* Stock */}
                {config.showStock && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                      <span>Stock Remaining</span>
                      <span className="text-[#C89B3C] font-semibold">
                        {box.stockRemaining} / {box.stockLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(box.stockRemaining / box.stockLimit) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-[#0D7A5E] to-[#C89B3C] rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`/mystery-box/${box.slug}`}
                    className="block w-full bg-gradient-to-r from-[#0D7A5E] to-[#C89B3C] text-white py-4 rounded-2xl font-semibold text-center hover:from-[#0a634d] hover:to-[#a67e2f] transition-all shadow-xl shadow-[#0D7A5E]/20 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    Unlock Mystery
                    <ArrowRight className="w-5 h-5 ml-auto" />
                  </Link>
                </motion.div>
              </div>
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
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <Sparkles className="w-5 h-5 text-[#C89B3C]" />
            <span className="text-sm text-gray-300">
              Guaranteed value higher than purchase price
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
