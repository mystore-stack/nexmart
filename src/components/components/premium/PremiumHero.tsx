"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Zap, Gift, Box, TrendingUp, Shield, Truck, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchUrl, bundleDealUrl, mysteryBoxUrl, categoryUrl, flashDealUrl } from "@/lib/navigation/NavigationService";

export function PremiumHero() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const trendingSearches = [
    "iPhone 15 Pro",
    "Samsung Galaxy S24",
    "Nike Air Jordan",
    "MacBook Pro",
    "PS5 Console"
  ];

  const stats = [
    { icon: ShoppingBag, label: "Commandes", value: "50K+" },
    { icon: TrendingUp, label: "Produits", value: "100K+" },
    { icon: Shield, label: "Clients", value: "25K+" },
    { icon: Truck, label: "Livraisons", value: "99%" },
  ];

  return (
    <section className="relative min-h-screen bg-[#FAF9F7] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(15 107 87 / 0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#0F6B57]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#C8A04D]/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#0F6B57] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Nouvelle Collection 2024</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl lg:text-7xl font-bold text-[#111111] leading-tight font-display"
            >
              Découvrez le
              <span className="block text-[#0F6B57]">
                Shopping Premium
              </span>
              au Maroc
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 leading-relaxed max-w-xl"
            >
              Des milliers de produits sélectionnés avec soin. Livraison express, paiement sécurisé, et service client 24/7.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <div className="flex items-center bg-white rounded-2xl shadow-2xl p-2 border border-[#ECECEC]">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search className="w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un produit, une marque..."
                    className="w-full py-3 text-[#111111] placeholder-gray-400 focus:outline-none text-lg"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#0F6B57] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Rechercher
                </motion.button>
              </div>

              {/* Trending Searches */}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 font-medium">Tendances:</span>
                {trendingSearches.map((search, i) => (
                  <Link
                    key={i}
                    href={searchUrl(search)}
                    className="text-sm text-[#0F6B57] hover:text-[#0F6B57]/80 font-medium transition-colors"
                  >
                    {search}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(categoryUrl('all'))}
                className="bg-[#111111] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Explorer les offres</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(flashDealUrl('featured'))}
                className="bg-white text-[#111111] px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all border-2 border-[#ECECEC] flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Voir les promos</span>
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-[#ECECEC]"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-[#0F6B57]" />
                  <p className="text-2xl font-bold text-[#111111]">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop"
                alt="Premium Shopping"
                className="w-full h-full object-cover"
              />
              
              {/* Floating Offer Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl max-w-xs border border-[#ECECEC]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-[#C8A04D] text-white p-2 rounded-lg">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">Flash Deal</p>
                    <p className="text-xs text-gray-500">Se termine bientôt</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
                    <span className="text-lg font-bold text-[#111111]">{timeLeft.hours}</span>
                    <span className="text-xs text-gray-500">h</span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
                    <span className="text-lg font-bold text-[#111111]">{timeLeft.minutes}</span>
                    <span className="text-xs text-gray-500">m</span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
                    <span className="text-lg font-bold text-[#111111]">{timeLeft.seconds}</span>
                    <span className="text-xs text-gray-500">s</span>
                  </div>
                </div>
              </motion.div>

              {/* Bundle Shortcut */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                onClick={() => router.push(bundleDealUrl('featured'))}
                className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl max-w-xs border border-[#ECECEC] cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-[#0F6B57] text-white p-2 rounded-lg">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">Bundle Deals</p>
                    <p className="text-xs text-gray-500">Jusqu&apos;à -40%</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Économisez en achetant en lot</p>
              </motion.div>

              {/* Mystery Box Shortcut */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                onClick={() => router.push(mysteryBoxUrl('featured'))}
                className="absolute bottom-32 right-8 bg-[#111111] text-white rounded-2xl p-4 shadow-xl max-w-xs cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-[#C8A04D] text-[#111111] p-2 rounded-lg">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Mystery Box</p>
                    <p className="text-xs text-gray-300">Surprise garantie</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">Gagnez jusqu&apos;à 5000 MAD</p>
              </motion.div>
            </div>

            {/* Animated Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              {[
                { label: "Ventes aujourd'hui", value: "1,234", change: "+12%" },
                { label: "Visiteurs en ligne", value: "567", change: "+8%" },
                { label: "Produits vendus", value: "89,012", change: "+15%" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5 + i * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-[#ECECEC]"
                >
                  <p className="text-2xl font-bold text-[#111111]">{stat.value}</p>
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-xs font-semibold text-[#0F6B57]">{stat.change}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
