"use client";

import React from "react";
import { motion } from "framer-motion";
import { Package, Percent, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { bundleDealUrl, bundleDealsListingUrl } from "@/lib/navigation/NavigationService";

interface BundleProduct {
  id: string;
  name: string;
  image: string;
  price: number;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  products: BundleProduct[];
  originalPrice: number;
  bundlePrice: number;
  discountPercent: number;
  savings: number;
  badge: string;
  gradient: string;
}

interface PremiumBundleDealsProps {
  bundles: Bundle[];
}

export function PremiumBundleDeals({ bundles }: PremiumBundleDealsProps) {
  const addBundleDeal = useCartStore((state: any) => state.addBundleDeal);

  const handleAddToCart = (bundle: Bundle, e: React.MouseEvent) => {
    console.log("[PREMIUM BUNDLE] handleAddToCart called", bundle);
    e.preventDefault();
    e.stopPropagation();
    addBundleDeal(bundle, 1);
  };

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
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#0F6B57]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#C8A04D]/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#0F6B57] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Package className="w-4 h-4" />
            <span>Offres Groupées</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-[#111111] mb-4 font-display">
            Packs & Bundles
            <span className="block text-[#0F6B57]">
              Économisez en achetant en lot
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez nos packs sélectionnés pour vous faire économiser jusqu&apos;à 40%
          </p>
        </motion.div>

        {/* Featured Bundle */}
        {bundles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className={`${bundles[0].gradient} rounded-3xl p-8 lg:p-12 shadow-2xl`}>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: Products */}
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    <span>{bundles[0].badge}</span>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-[#111111] font-display">{bundles[0].name}</h3>
                  <p className="text-gray-600 text-lg">{bundles[0].description}</p>

                  {/* Products Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {bundles[0].products.map((product, i) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="relative aspect-square rounded-xl overflow-hidden shadow-lg bg-white border border-[#ECECEC]"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#ECECEC]">
                    <div className="flex items-baseline gap-4 mb-2">
                      <span className="text-4xl font-bold text-[#111111]">
                        {bundles[0].bundlePrice.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        {bundles[0].originalPrice.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-[#C8A04D] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        -{bundles[0].discountPercent}%
                      </div>
                      <span className="text-[#0F6B57] font-semibold">
                        Vous économisez {bundles[0].savings.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => handleAddToCart(bundles[0], e)}
                      className="w-full bg-[#0F6B57] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>Ajouter au panier</span>
                    </motion.button>
                  </div>
                </div>

                {/* Right: Visual */}
                <div className="relative">
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-white/50 backdrop-blur-sm">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl">
                          <Percent className="w-16 h-16 text-white" />
                        </div>
                        <p className="text-6xl font-bold text-gray-900">-{bundles[0].discountPercent}%</p>
                        <p className="text-xl text-gray-600">d&apos;économie</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl"
                  >
                    <p className="text-sm text-gray-500">Prix total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bundles[0].originalPrice.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                    </p>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl"
                  >
                    <p className="text-sm text-gray-500">Prix du pack</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {bundles[0].bundlePrice.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other Bundles */}
        {bundles.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bundles.slice(1).map((bundle, i) => (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className={`${bundle.gradient} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="bg-white/80 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                        {bundle.badge}
                      </span>
                      <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        -{bundle.discountPercent}%
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-gray-900">{bundle.name}</h4>
                    <p className="text-gray-600 text-sm line-clamp-2">{bundle.description}</p>

                    {/* Products Preview */}
                    <div className="flex -space-x-3">
                      {bundle.products.slice(0, 3).map((product, j) => (
                        <div
                          key={product.id}
                          className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white shadow-md"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {bundle.products.length > 3 && (
                        <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shadow-md">
                          +{bundle.products.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 pt-2 border-t border-white/30">
                      <span className="text-2xl font-bold text-gray-900">
                        {bundle.bundlePrice.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {bundle.originalPrice.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => handleAddToCart(bundle, e)}
                      className="w-full bg-white/80 backdrop-blur-sm text-gray-900 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white transition-all"
                    >
                      <span>Ajouter au panier</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link href={bundleDealsListingUrl()}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <span>Voir tous les packs</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
