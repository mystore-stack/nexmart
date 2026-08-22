"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Flame, ArrowRight, ShoppingBag } from "lucide-react";
import { PremiumProductCard } from "./PremiumProductCard";
import Link from "next/link";
import { productUrl, flashDealUrl, flashDealsListingUrl } from "@/lib/navigation/NavigationService";

interface FlashDeal {
  id: string;
  name: string;
  slug: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  stock: number;
  sold: number;
  endTime: string;
}

interface PremiumFlashDealsProps {
  deals: FlashDeal[];
}

export function PremiumFlashDeals({ deals }: PremiumFlashDealsProps) {
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

  const featuredDeal = deals[0];
  const otherDeals = deals.slice(1, 5);

  return (
    <section className="relative bg-[#111111] py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C8A04D]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0F6B57]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#C8A04D] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Flame className="w-4 h-4" />
            <span>Offres Flash</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-display">
            Ventes Flash
            <span className="block text-[#C8A04D]">
              Jusqu&apos;à -70%
            </span>
          </h2>

          {/* Countdown Timer */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <Clock className="w-6 h-6 text-[#C8A04D]" />
              <div className="flex items-center gap-3">
                {[
                  { value: timeLeft.hours, label: "Heures" },
                  { value: timeLeft.minutes, label: "Minutes" },
                  { value: timeLeft.seconds, label: "Secondes" },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <p className="text-3xl font-bold text-white">{String(item.value).padStart(2, '0')}</p>
                    <p className="text-xs text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured Deal */}
        {featuredDeal && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-[#0F6B57]/20 backdrop-blur-sm rounded-3xl p-8 border border-[#C8A04D]/30">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-[#C8A04D] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <Flame className="w-4 h-4" />
                    <span>Offre Vedette</span>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white font-display">{featuredDeal.name}</h3>
                  
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-white">
                      {featuredDeal.salePrice.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      {featuredDeal.originalPrice.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                    </span>
                    <span className="bg-[#C8A04D] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      -{featuredDeal.discountPercent}%
                    </span>
                  </div>

                  {/* Stock Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{featuredDeal.sold} vendus</span>
                      <span className="text-[#C8A04D] font-semibold">{featuredDeal.stock} restants</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(featuredDeal.sold / (featuredDeal.sold + featuredDeal.stock)) * 100}%` }}
                        viewport={{ once: true }}
                        className="bg-[#C8A04D] h-3 rounded-full"
                      />
                    </div>
                  </div>

                  <Link href={productUrl(featuredDeal.slug)}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-[#C8A04D] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>Acheter maintenant</span>
                    </motion.button>
                  </Link>
                </div>

                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <img
                    src={featuredDeal.image}
                    alt={featuredDeal.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other Deals */}
        {otherDeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {otherDeals.map((deal, i) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-[#C8A04D]/50 transition-all group">
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                      <img
                        src={deal.image}
                        alt={deal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-[#C8A04D] text-white px-2 py-1 rounded-full text-xs font-semibold">
                        -{deal.discountPercent}%
                      </div>
                    </div>

                    <h4 className="font-semibold text-white mb-2 line-clamp-2">{deal.name}</h4>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-[#C8A04D]">
                        {deal.salePrice.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {deal.originalPrice.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}
                      </span>
                    </div>

                    {/* Mini Stock Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{deal.sold} vendus</span>
                        <span className="text-[#C8A04D]">{deal.stock} restants</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-[#C8A04D] h-1.5 rounded-full"
                          style={{ width: `${(deal.sold / (deal.sold + deal.stock)) * 100}%` }}
                        />
                      </div>
                    </div>
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
          <Link href={flashDealsListingUrl()}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all"
            >
              <span>Voir toutes les offres</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
