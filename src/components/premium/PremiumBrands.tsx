"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  isFeatured: boolean;
  productCount: number;
}

interface PremiumBrandsProps {
  brands: Brand[];
}

export function PremiumBrands({ brands }: PremiumBrandsProps) {
  if (brands.length === 0) return null;

  const featuredBrand = brands[0];
  const otherBrands = brands.slice(1, 9);

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
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#0F6B57] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Award className="w-4 h-4" />
            <span>Marques Premium</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-[#111111] mb-4 font-display">
            Nos Marques
            <span className="block text-[#0F6B57]">
              Partenaires de Confiance
            </span>
          </h2>
        </motion.div>

        {/* Featured Brand Spotlight */}
        {featuredBrand && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="bg-white rounded-3xl p-8 lg:p-12 border border-[#ECECEC] shadow-lg">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Brand Info */}
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-[#C8A04D] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <Star className="w-4 h-4" />
                    <span>Marque Vedette</span>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-[#111111] font-display">{featuredBrand.name}</h3>
                  <p className="text-gray-600 text-lg">{featuredBrand.description}</p>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-[#111111]">{featuredBrand.productCount}</p>
                      <p className="text-sm text-gray-500">Produits</p>
                    </div>
                    <div className="w-px h-12 bg-[#ECECEC]" />
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-[#C8A04D] text-[#C8A04D]" />
                      ))}
                    </div>
                  </div>

                  <Link href={`/brands/${featuredBrand.slug}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 bg-[#0F6B57] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <span>Explorer la marque</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>

                {/* Brand Logo/Image */}
                <div className="relative aspect-square rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden">
                  {featuredBrand.logoUrl ? (
                    <img
                      src={featuredBrand.logoUrl}
                      alt={featuredBrand.name}
                      className="max-w-[80%] max-h-[80%] object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto bg-[#C8A04D] rounded-2xl flex items-center justify-center mb-4">
                        <Award className="w-16 h-16 text-white" />
                      </div>
                      <p className="text-gray-500 font-semibold">{featuredBrand.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Animated Logo Wall */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {otherBrands.map((brand, i) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group cursor-pointer"
              >
                <Link href={`/brands/${brand.slug}`}>
                  <div className="aspect-square rounded-xl bg-white border border-[#ECECEC] hover:border-[#C8A04D] hover:shadow-lg transition-all flex items-center justify-center overflow-hidden">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="max-w-[70%] max-h-[70%] object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <p className="font-semibold text-[#111111] text-sm line-clamp-2">{brand.name}</p>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link href="/brands">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              <span>Voir toutes les marques</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
