"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Smartphone,
  Shirt,
  Sparkles,
  Home,
  Zap,
  Gamepad2,
  Package,
  ShoppingBag,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgGradient: string;
  image?: string;
}

const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    icon: <Smartphone className="w-8 h-8" />,
    href: "/categories/electronics",
    color: "text-blue-600",
    bgGradient: "from-blue-50 to-blue-100",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: <Shirt className="w-8 h-8" />,
    href: "/categories/fashion",
    color: "text-pink-600",
    bgGradient: "from-pink-50 to-pink-100",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: "beauty",
    name: "Beauty",
    icon: <Sparkles className="w-8 h-8" />,
    href: "/categories/beauty",
    color: "text-purple-600",
    bgGradient: "from-purple-50 to-purple-100",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: "home",
    name: "Home",
    icon: <Home className="w-8 h-8" />,
    href: "/categories/home",
    color: "text-orange-600",
    bgGradient: "from-orange-50 to-orange-100",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: "moroccan-products",
    name: "Moroccan",
    icon: <ShoppingBag className="w-8 h-8" />,
    href: "/categories/moroccan-products",
    color: "text-amber-600",
    bgGradient: "from-amber-50 to-amber-100",
    image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: <Gamepad2 className="w-8 h-8" />,
    href: "/categories/gaming",
    color: "text-green-600",
    bgGradient: "from-green-50 to-green-100",
    image: "https://images.unsplash.com/photo-1538481143235-5d8a6653bda4?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: "deals",
    name: "Deals",
    icon: <Zap className="w-8 h-8" />,
    href: "/deals",
    color: "text-red-600",
    bgGradient: "from-red-50 to-red-100",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=300&h=300&q=80",
  },
  {
    id: "accessories",
    name: "Accessories",
    icon: <Package className="w-8 h-8" />,
    href: "/categories/accessories",
    color: "text-indigo-600",
    bgGradient: "from-indigo-50 to-indigo-100",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&h=300&q=80",
  },
];

export function CategoriesShowcase() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-slate-100/50 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore our carefully curated collections across 9 departments
          </p>
        </motion.div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Link href={category.href}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative h-40 sm:h-48 lg:h-56 rounded-2xl overflow-hidden cursor-pointer"
                >
                  {/* Background image */}
                  {category.image && (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}

                  {/* Overlay gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-80 group-hover:opacity-60 transition-opacity duration-300`} />

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    {/* Icon */}
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.1 }}
                      className={`${category.color} mb-3 sm:mb-4 p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-sm`}
                    >
                      {category.icon}
                    </motion.div>

                    {/* Label */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 text-center">
                      {category.name}
                    </h3>

                    {/* Arrow indicator */}
                    <motion.div
                      initial={{ x: 0, opacity: 0 }}
                      whileHover={{ x: 4, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-4 right-4"
                    >
                      <svg
                        className="w-5 h-5 text-slate-900"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Border highlight on hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 rounded-2xl border-2 border-white/50 pointer-events-none"
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <Link
            href="/categories"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-colors"
          >
            View All Categories
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
