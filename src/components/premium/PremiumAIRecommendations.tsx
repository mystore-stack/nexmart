"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, Target, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";
import { PremiumProductCard } from "./PremiumProductCard";
import Link from "next/link";

interface AIProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  rating?: number;
  reason: string;
  matchScore: number;
}

interface PremiumAIRecommendationsProps {
  products: AIProduct[];
}

export function PremiumAIRecommendations({ products }: PremiumAIRecommendationsProps) {
  if (products.length === 0) return null;

  return (
    <section className="relative bg-[#111111] py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C8A04D]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0F6B57]/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(200 160 77 / 0.3) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#C8A04D] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
            <Brain className="w-4 h-4" />
            <span>IA Powered</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-display">
            Recommandations
            <span className="block text-[#C8A04D]">
              Personnalisées pour Vous
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Notre IA analyse vos préférences pour vous suggérer les produits parfaits
          </p>
        </motion.div>

        {/* AI Explanation Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-[#C8A04D] rounded-2xl flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Analyse de profil</h4>
                <p className="text-gray-400 text-sm">Basé sur votre historique de navigation et d&apos;achat</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-[#0F6B57] rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Tendances actuelles</h4>
                <p className="text-gray-400 text-sm">Produits populaires dans votre région</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-[#C8A04D] rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Match intelligent</h4>
                <p className="text-gray-400 text-sm">Algorithmes de matching avancés</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="relative"
            >
              {/* Glass Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:border-[#C8A04D]/50 transition-all">
                {/* AI Badge */}
                <div className="absolute top-4 right-4 bg-[#C8A04D] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  <span>{product.matchScore}% match</span>
                </div>

                {/* Product */}
                <div className="mb-4">
                  <PremiumProductCard
                    {...product}
                    badge={undefined}
                    ranking={undefined}
                  />
                </div>

                {/* AI Reason */}
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0F6B57]" />
                    <span className="text-sm text-gray-300">{product.reason}</span>
                  </div>
                  
                  {/* Match Score Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Score de compatibilité</span>
                      <span className="text-[#C8A04D] font-semibold">{product.matchScore}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${product.matchScore}%` }}
                        viewport={{ once: true }}
                        className="bg-[#C8A04D] h-2 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/recommendations">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <span>Voir plus de recommandations</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
