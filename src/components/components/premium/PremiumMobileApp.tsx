"use client";

import React from "react";
import { motion } from "framer-motion";
import { Smartphone, Download, QrCode, Apple, PlayCircle, ArrowRight, Zap, Shield, Star } from "lucide-react";

export function PremiumMobileApp() {
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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#C8A04D] text-white px-4 py-2 rounded-full text-sm font-semibold">
              <Smartphone className="w-4 h-4" />
              <span>Application Mobile</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight font-display">
              Téléchargez
              <span className="block text-[#C8A04D]">
                Notre App
              </span>
            </h2>

            {/* Description */}
            <p className="text-xl text-gray-300 leading-relaxed">
              Profitez d&apos;une expérience shopping optimisée avec des offres exclusives et des notifications en temps réel.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Zap className="w-5 h-5" />, text: "Performance rapide" },
                { icon: <Shield className="w-5 h-5" />, text: "Paiement sécurisé" },
                { icon: <Star className="w-5 h-5" />, text: "Offres exclusives" },
                { icon: <Download className="w-5 h-5" />, text: "Mises à jour auto" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <div className="text-[#C8A04D]">{feature.icon}</div>
                  <span className="text-white font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 bg-white text-gray-900 px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Télécharger sur</p>
                  <p className="text-sm font-bold">App Store</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 bg-white text-gray-900 px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <PlayCircle className="w-6 h-6" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Disponible sur</p>
                  <p className="text-sm font-bold">Google Play</p>
                </div>
              </motion.button>
            </div>

            {/* QR Code */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="bg-white rounded-lg p-3">
                <QrCode className="w-16 h-16 text-gray-900" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Scannez pour télécharger</p>
                <p className="text-gray-400 text-sm">Pointez votre camera pour obtenir l&apos;application</p>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            {/* Phone Frame */}
            <div className="relative mx-auto w-80 h-[600px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl border-4 border-gray-700">
              {/* Screen */}
              <div className="relative w-full h-full bg-gradient-to-br from-[#0F6B57] to-[#C8A04D] rounded-[2.5rem] overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl" />
                
                {/* App Content */}
                <div className="absolute inset-0 pt-10 px-4 pb-4 flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-white/70 text-xs">Bienvenue</p>
                      <p className="text-white font-bold">NexMart</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-4">
                    <p className="text-white/70 text-sm">Rechercher...</p>
                  </div>

                  {/* Banner */}
                  <div className="bg-[#C8A04D] rounded-xl p-4 mb-4">
                    <p className="text-white font-bold text-sm mb-1">-50% sur tout</p>
                    <p className="text-white/80 text-xs">Offre limitée</p>
                  </div>

                  {/* Categories */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {['Tech', 'Mode', 'Maison', 'Sport'].map((cat, i) => (
                      <div key={i} className="bg-white/20 rounded-lg p-2 text-center">
                        <p className="text-white text-xs font-medium">{cat}</p>
                      </div>
                    ))}
                  </div>

                  {/* Products */}
                  <div className="space-y-3 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/30 rounded-lg" />
                        <div className="flex-1">
                          <div className="h-2 bg-white/40 rounded w-3/4 mb-1" />
                          <div className="h-2 bg-white/30 rounded w-1/2" />
                        </div>
                        <div className="h-6 w-6 bg-white/30 rounded-full" />
                      </div>
                    ))}
                  </div>

                  {/* Bottom Nav */}
                  <div className="flex items-center justify-around mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-6 h-6 bg-white/40 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-8 -right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
            >
              4.9 ★
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-8 -left-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
            >
              1M+ Téléchargements
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
