"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award, ArrowRight } from "lucide-react";

interface FeaturedBrandsSectionProps {
  config: any;
  brands?: any[];
}

export function FeaturedBrandsSection({ config, brands = [] }: FeaturedBrandsSectionProps) {
  // Show placeholder if no brands available
  const displayBrands = brands.length > 0 ? brands : [
    { id: '1', name: 'Luxury Brand', slug: 'luxury-brand', logoUrl: null },
    { id: '2', name: 'Designer Collection', slug: 'designer-collection', logoUrl: null },
    { id: '3', name: 'Premium Fashion', slug: 'premium-fashion', logoUrl: null },
    { id: '4', name: 'Moroccan Artisan', slug: 'moroccan-artisan', logoUrl: null },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white via-gray-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-slate-100 rounded-full mb-6">
            <Award className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Featured</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {config.title || "Featured Brands"}
          </h2>
          {config.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {config.subtitle}
            </p>
          )}
        </motion.div>

        {/* Brands Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {displayBrands.map((brand: any) => (
            <motion.div
              key={brand.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="group block"
              >
                <div className="bg-white rounded-3xl p-8 flex items-center justify-center hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 border border-gray-100/50 group-hover:border-gray-200">
                  {brand.logoUrl ? (
                    <Image
                      src={brand.logoUrl}
                      alt={brand.name}
                      width={120}
                      height={60}
                      className="object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-400">{brand.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <p className="text-center mt-4 font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  {brand.name}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        {config.showViewAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-xl"
            >
              View All Brands
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
