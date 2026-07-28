"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  href: string;
}

const products: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Earbuds",
    price: 1290,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.8,
    reviews: 245,
    href: "/products/earbuds-1",
  },
  {
    id: "2",
    name: "Luxury Leather Wallet",
    price: 690,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.9,
    reviews: 189,
    href: "/products/wallet-1",
  },
  {
    id: "3",
    name: "Moroccan Argan Oil Serum",
    price: 890,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.7,
    reviews: 512,
    href: "/products/argan-serum-1",
  },
  {
    id: "4",
    name: "Smart Home Hub",
    price: 2490,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.6,
    reviews: 418,
    href: "/products/hub-1",
  },
  {
    id: "5",
    name: "Ceramic Coffee Set",
    price: 1090,
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.8,
    reviews: 334,
    href: "/products/coffee-set-1",
  },
  {
    id: "6",
    name: "Premium Pillowcase Set",
    price: 790,
    image: "https://images.unsplash.com/photo-1585540220535-c3400ca199e7?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.9,
    reviews: 267,
    href: "/products/pillowcase-1",
  },
  {
    id: "7",
    name: "Essential Oil Diffuser",
    price: 590,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.7,
    reviews: 445,
    href: "/products/diffuser-1",
  },
  {
    id: "8",
    name: "Designer Sunglasses",
    price: 1590,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&h=400&q=80",
    rating: 4.9,
    reviews: 267,
    href: "/products/sunglasses-1",
  },
];

export function FeaturedProductsGrid() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-white">
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Handpicked items curated just for you
          </p>
        </motion.div>

        {/* Products Grid (4 columns) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-100"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />

                    {/* Wishlist Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Add to wishlist"
                    >
                      <Heart className="w-4 h-4 text-slate-900" />
                    </motion.button>

                    {/* Quick Add Cart */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-3 flex gap-2"
                    >
                      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors text-xs sm:text-sm"
                      aria-label="Add to cart">
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
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-200"
          >
            Shop All Products
            <motion.span
              animate={{ x: 0 }}
              whileHover={{ x: 4 }}
              className="inline-block"
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
