"use client";

import { useState, useRef } from "react";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import {
  DealsHeader,
  HeroBanner,
  DealCategories,
  FlashDealCard,
  BundleDealsSection,
  SuperDealsSection,
  SponsoredDealsSection,
  RecommendedDealsSection,
  TrustSection,
} from "@/components/deals";
import type { Deal } from "@/types";
import { motion } from "framer-motion";

interface Props {
  deals: Deal[];
}

export function DealsPageClientNew({ deals }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("flash");
  const flashDealsRef = useRef<HTMLDivElement>(null);

  const handleDiscoverClick = () => {
    flashDealsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Filter deals by category (for now, show all)
  const filteredDeals =
    selectedCategory === "flash" ? deals : deals.slice(0, 10);

  return (
    <MobileLayout className="bg-white">
      {/* Header */}
      <DealsHeader onSearchClick={() => {}} />

      {/* Hero Banner */}
      <HeroBanner
        title="Flash Sale"
        subtitle="Up to 70% off"
        endTime={new Date(Date.now() + 6 * 60 * 60 * 1000)}
      />

      {/* Categories */}
      <DealCategories
        activeCategory={selectedCategory}
        onCategoryClick={setSelectedCategory}
      />

      {/* Flash Deals Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="px-4 py-6"
        ref={flashDealsRef}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-black text-neutral-900 mb-1">
            ⚡ Flash Deals
          </h2>
          <p className="text-sm text-neutral-600 mb-4">
            Limited time offers - don't miss out!
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {filteredDeals.slice(0, 6).map((deal) => (
            <FlashDealCard key={deal.id} deal={deal} />
          ))}
        </div>

        {/* View all link */}
        {filteredDeals.length > 6 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-4 py-2.5 border-2 border-red-500 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-all"
          >
            View All Flash Deals
          </motion.button>
        )}
      </motion.section>

      {/* Super Deals */}
      {deals.length > 6 && (
        <SuperDealsSection
          title="🏆 Top Deals"
          deals={deals.slice(3, 7)}
        />
      )}

      {/* Bundle Deals */}
      <BundleDealsSection onBundleClick={() => {}} />

      {/* Sponsored Deals */}
      <SponsoredDealsSection />

      {/* Recommended For You */}
      {deals.length > 4 && (
        <RecommendedDealsSection deals={deals.slice(2, 10)} />
      )}

      {/* Trust Section */}
      <TrustSection />

      {/* Bottom CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="px-4 py-6 pb-20"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 p-6 text-center"
        >
          {/* Animated background */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-40 h-40 rounded-full bg-red-500/10 -translate-y-1/2 translate-x-1/2"
          />

          <div className="relative z-10">
            <p className="text-sm text-neutral-300 mb-2">Ready to save?</p>
            <h3 className="text-2xl font-black text-white mb-4">
              Explore More Deals
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              Continue Shopping
            </motion.button>
          </div>
        </motion.div>
      </motion.section>
    </MobileLayout>
  );
}
