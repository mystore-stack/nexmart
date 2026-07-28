"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Gift, ArrowRight } from "lucide-react";
import type { Bundle } from "@/types";

interface BundleOffers {
  id: string;
  name: string;
  products: Array<{ id: string; images: string[] }>;
  bundlePrice: number;
  totalPrice: number;
  discountPercentage: number;
  slug: string;
}

interface BundleDealsSectionProps {
  bundles: BundleOffers[];
  title?: string;
  cardsPerRow?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function BundleDealsSection({
  bundles,
  title = "Bundle Deals",
  cardsPerRow = { mobile: 2, tablet: 2, desktop: 3 },
}: BundleDealsSectionProps) {
  if (!bundles || bundles.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const gridClass = `grid grid-cols-${cardsPerRow.mobile || 2} md:grid-cols-${cardsPerRow.tablet || 2} lg:grid-cols-${cardsPerRow.desktop || 3} gap-3 sm:gap-4 lg:gap-6`;

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="w-full"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-2">
          <Gift className="w-6 h-6 text-[#0f5d43]" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{title}</h2>
        </div>
        <p className="text-sm text-slate-600">Save more with curated product bundles</p>
      </div>

      <motion.div className={gridClass}>
        {bundles.slice(0, 6).map((bundle, index) => (
          <motion.div key={bundle.id} variants={itemVariants}>
            <Link href={`/bundles/${bundle.slug}`}>
              <div className="group relative h-full rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-lg transition-all duration-300 active:scale-95">
                {/* Product Preview Grid */}
                <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 grid grid-cols-2 gap-2">
                  {bundle.products.slice(0, 4).map((product, idx) => (
                    <div
                      key={product.id}
                      className="relative aspect-square rounded-lg overflow-hidden bg-white border border-slate-200"
                    >
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={`Product ${idx + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="150px"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Info Section */}
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                      -
                      {bundle.discountPercentage}%
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">
                      {bundle.products.length} items
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2 group-hover:text-[#0f5d43] transition-colors">
                    {bundle.name}
                  </h3>

                  {/* Pricing */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg sm:text-xl font-black text-slate-900">
                        {(bundle.bundlePrice || 0).toLocaleString("fr-MA")} MAD
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 line-through">
                        {(bundle.totalPrice || 0).toLocaleString("fr-MA")} MAD
                      </span>
                    </div>
                    <p className="text-xs text-green-600 font-semibold">
                      Save {((bundle.totalPrice || 0) - (bundle.bundlePrice || 0)).toLocaleString("fr-MA")} MAD
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full py-2.5 px-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#0f5d43] to-[#0a4834] text-white hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 group/btn">
                    <span>View Bundle</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* View All Button */}
      <div className="mt-8 text-center">
        <Link
          href="/bundles"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[#0f5d43] border-2 border-[#0f5d43] hover:bg-[#0f5d43] hover:text-white transition-all active:scale-95"
        >
          Browse all bundles
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.section>
  );
}
