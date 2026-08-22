"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Layers } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Collection {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  productCount: number;
}

interface PremiumCollectionsProps {
  collections: Collection[];
}

export function PremiumCollections({ collections }: PremiumCollectionsProps) {
  if (collections.length === 0) return null;

  // Create masonry layout: 1 large featured, 2 medium, rest small
  const featuredCollection = collections[0];
  const mediumCollections = collections.slice(1, 3);
  const smallCollections = collections.slice(3, 7);

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
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#0F6B57]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#C8A04D]/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-[#0F6B57] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Layers className="w-4 h-4" />
              <span>Collections</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-[#111111] mb-2 font-display">
              Collections
              <span className="block text-[#0F6B57]">
                Curated for You
              </span>
            </h2>
          </div>

          <Link href="/collections">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:flex items-center gap-2 bg-white text-[#111111] px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-[#ECECEC]"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Masonry Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[300px]">
          {/* Featured Large Collection */}
          {featuredCollection && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 md:row-span-2 relative group cursor-pointer"
            >
              <Link href={`/collections/${featuredCollection.slug}`}>
                <div className="relative w-full h-full rounded-3xl overflow-hidden">
                  <Image
                    src={featuredCollection.image}
                    alt={featuredCollection.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="inline-flex items-center gap-2 bg-[#C8A04D] text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      <span>Collection Vedette</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2 font-display">{featuredCollection.name}</h3>
                    <p className="text-gray-200 mb-4 line-clamp-2">{featuredCollection.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="bg-[#C8A04D] text-white px-4 py-2 rounded-full text-sm font-semibold">
                        {featuredCollection.productCount} produits
                      </span>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2 text-white font-semibold"
                      >
                        <span>Explorer</span>
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Medium Collections */}
          {mediumCollections.map((collection, i) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="relative group cursor-pointer"
            >
              <Link href={`/collections/${collection.slug}`}>
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="text-xl font-bold text-white mb-1 font-display">{collection.name}</h4>
                    <p className="text-sm text-gray-200 mb-3 line-clamp-2">{collection.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="bg-[#C8A04D] text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {collection.productCount} produits
                      </span>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-1 text-white text-sm font-semibold"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Small Collections */}
          {smallCollections.map((collection, i) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="relative group cursor-pointer"
            >
              <Link href={`/collections/${collection.slug}`}>
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h5 className="text-lg font-bold text-white mb-1 font-display">{collection.name}</h5>
                    <p className="text-xs text-gray-200 line-clamp-1">{collection.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="md:hidden text-center mt-8"
        >
          <Link href="/collections">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              <span>Voir tout</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
