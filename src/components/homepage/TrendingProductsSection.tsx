"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart, Zap } from "lucide-react";

interface TrendingProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  href: string;
  badge?: "trending" | "hot" | "new";
}

const products: TrendingProduct[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 2490,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&h=300&q=80",
    rating: 4.8,
    reviews: 245,
    href: "/products/headphones-1",
    badge: "trending",
  },
  {
    id: "2",
    name: "Luxury Leather Handbag",
    price: 1890,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&h=300&q=80",
    rating: 4.9,
    reviews: 189,
    href: "/products/handbag-1",
    badge: "hot",
  },
  {
    id: "3",
    name: "Moroccan Argan Oil",
    price: 490,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&h=300&q=80",
    rating: 4.7,
    reviews: 512,
    href: "/products/argan-oil-1",
  },
  {
    id: "4",
    name: "Smart Watch Pro",
    price: 3290,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&h=300&q=80",
    rating: 4.6,
    reviews: 418,
    href: "/products/smartwatch-1",
    badge: "new",
  },
  {
    id: "5",
    name: "Premium Coffee Maker",
    price: 890,
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?auto=format&fit=crop&w=300&h=300&q=80",
    rating: 4.8,
    reviews: 334,
    href: "/products/coffee-1",
  },
  {
    id: "6",
    name: "Designer Sunglasses",
    price: 1290,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=300&h=300&q=80",
    rating: 4.9,
    reviews: 267,
    href: "/products/sunglasses-1",
  },
];

function getBadgeStyles(badge?: string) {
  switch (badge) {
    case "trending":
      return "bg-red-500/90 text-white";
    case "hot":
      return "bg-orange-500/90 text-white";
    case "new":
      return "bg-blue-500/90 text-white";
    default:
      return "";
  }
}

function getBadgeText(badge?: string) {
  switch (badge) {
    case "trending":
      return "🔥 Trending";
    case "hot":
      return "🔥 Hot Deal";
    case "new":
      return "✨ New";
    default:
      return "";
  }
}

export function TrendingProductsSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-slate-50">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-100/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-4">
            Trending Now
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            This week's most popular items and bestsellers
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Link href={product.href}>
                <motion.div
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />

                    {/* Badge */}
                    {product.badge && (
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        className={`absolute top-2 left-2 px-2 py-1 rounded-lg ${getBadgeStyles(
                          product.badge
                        )} text-xs font-bold backdrop-blur-sm`}
                      >
                        {getBadgeText(product.badge)}
                      </motion.div>
                    )}

                    {/* Wishlist Icon */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Add to wishlist"
                    >
                      <Heart className="w-4 h-4 text-slate-900" />
                    </motion.button>

                    {/* Quick Add */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-3 flex gap-2"
                    >
                      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors text-xs sm:text-sm">
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 space-y-2">
                    {/* Name */}
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-slate-950">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              i < Math.floor(product.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-600">({product.reviews})</span>
                    </div>

                    {/* Price */}
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-sm sm:text-base font-bold text-slate-900">
                        {product.price.toLocaleString("fr-MA")} MAD
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View More */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            href="/products?sort=trending"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-200"
          >
            View All Trending Products
            <Zap className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
