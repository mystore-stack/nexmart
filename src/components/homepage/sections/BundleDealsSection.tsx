"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, CheckCircle, ArrowRight, Percent } from "lucide-react";

interface BundleDealsSectionProps {
  config: any;
  bundleDeals?: any[];
}

export function BundleDealsSection({ config, bundleDeals = [] }: BundleDealsSectionProps) {
  // Show placeholder if no bundle deals available
  const displayBundleDeals = bundleDeals.length > 0 ? bundleDeals : [
    { id: '1', name: 'Summer Essentials', description: 'Complete summer wardrobe package', discountPercent: 35, bundlePrice: 2500, originalPrice: 3800, buttonText: 'Get Bundle', products: [{ id: '1', product: { name: 'Summer Dress' } }, { id: '2', product: { name: 'Sandals' } }, { id: '3', product: { name: 'Hat' } }] },
    { id: '2', name: 'Beauty Kit', description: 'Premium skincare collection', discountPercent: 40, bundlePrice: 1200, originalPrice: 2000, buttonText: 'Get Bundle', products: [{ id: '1', product: { name: 'Face Serum' } }, { id: '2', product: { name: 'Moisturizer' } }, { id: '3', product: { name: 'Sunscreen' } }] },
    { id: '3', name: 'Tech Bundle', description: 'Essential electronics package', discountPercent: 25, bundlePrice: 3500, originalPrice: 4600, buttonText: 'Get Bundle', products: [{ id: '1', product: { name: 'Wireless Earbuds' } }, { id: '2', product: { name: 'Phone Case' } }, { id: '3', product: { name: 'Charger' } }] },
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
    <section className="py-20 bg-gradient-to-b from-white via-purple-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
            <Package className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Bundle</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {config.title || "Bundle Deals"}
          </h2>
          {config.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {config.subtitle}
            </p>
          )}
        </motion.div>

        {/* Bundle Deals Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {displayBundleDeals.map((bundle: any) => (
            <motion.div
              key={bundle.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="group bg-white rounded-3xl p-8 border border-gray-100/50 hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-500">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  {config.showSaveAmount && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                      <Percent className="w-4 h-4" />
                      Save {bundle.discountPercent}%
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3">{bundle.name}</h3>
                
                {/* Description */}
                {bundle.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed">{bundle.description}</p>
                )}

                {/* Products List */}
                <div className="space-y-3 mb-6">
                  {bundle.products.map((bp: any) => (
                    <div key={bp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">{bp.product.name}</span>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold text-purple-600">{bundle.bundlePrice} MAD</span>
                  {bundle.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">{bundle.originalPrice} MAD</span>
                  )}
                </div>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`/bundle/${bundle.id}`}
                    className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold text-center hover:from-purple-700 hover:to-pink-700 transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
                  >
                    {bundle.buttonText || "Get Bundle"}
                    <ArrowRight className="w-5 h-5 ml-auto" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
