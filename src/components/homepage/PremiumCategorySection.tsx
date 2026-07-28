"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Smartphone,
  Shirt,
  Sparkles,
  Home,
  ShoppingBag,
  Gamepad2,
  Zap,
  Package,
} from "lucide-react";

interface CategoryCardData {
  id: string;
  name: string;
  tagline: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
  image: string;
  badge?: "trending" | "new" | "featured";
  featured?: boolean;
}

const categories: CategoryCardData[] = [
  {
    id: "electronics",
    name: "Electronics",
    tagline: "Latest tech & gadgets",
    href: "/categories/electronics",
    icon: <Smartphone className="w-12 h-12" />,
    gradient: "from-blue-600/10 to-cyan-600/10",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&h=600&q=80",
    featured: true,
  },
  {
    id: "fashion",
    name: "Fashion",
    tagline: "Premium clothing & wear",
    href: "/categories/fashion",
    icon: <Shirt className="w-12 h-12" />,
    gradient: "from-pink-600/10 to-rose-600/10",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&h=600&q=80",
    badge: "trending",
  },
  {
    id: "beauty",
    name: "Beauty",
    tagline: "Luxury skincare & cosmetics",
    href: "/categories/beauty",
    icon: <Sparkles className="w-12 h-12" />,
    gradient: "from-purple-600/10 to-pink-600/10",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=500&h=600&q=80",
    badge: "new",
  },
  {
    id: "home",
    name: "Home & Living",
    tagline: "Elegant home collections",
    href: "/categories/home",
    icon: <Home className="w-12 h-12" />,
    gradient: "from-orange-600/10 to-amber-600/10",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&h=600&q=80",
  },
  {
    id: "moroccan",
    name: "Moroccan Products",
    tagline: "Authentic artisan crafts",
    href: "/categories/moroccan-products",
    icon: <ShoppingBag className="w-12 h-12" />,
    gradient: "from-amber-600/10 to-yellow-600/10",
    image:
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=500&h=600&q=80",
  },
  {
    id: "gaming",
    name: "Gaming",
    tagline: "Next-gen gaming gear",
    href: "/categories/gaming",
    icon: <Gamepad2 className="w-12 h-12" />,
    gradient: "from-green-600/10 to-emerald-600/10",
    image:
      "https://images.unsplash.com/photo-1538481143235-5d8a6653bda4?auto=format&fit=crop&w=500&h=600&q=80",
  },
  {
    id: "deals",
    name: "Deals",
    tagline: "Limited-time offers",
    href: "/deals",
    icon: <Zap className="w-12 h-12" />,
    gradient: "from-red-600/10 to-orange-600/10",
    image:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=500&h=600&q=80",
  },
  {
    id: "accessories",
    name: "Accessories",
    tagline: "Essential add-ons",
    href: "/categories/accessories",
    icon: <Package className="w-12 h-12" />,
    gradient: "from-indigo-600/10 to-purple-600/10",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&h=600&q=80",
  },
];

interface CategoryCardProps {
  data: CategoryCardData;
  index: number;
  isMobile?: boolean;
}

function CategoryCard({ data, index, isMobile }: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const cardClass = data.featured && !isMobile ? "md:col-span-2 md:row-span-2" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={cardClass}
    >
      <Link href={data.href}>
        <motion.div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.98 }}
          className={`group relative h-64 ${
            data.featured && !isMobile ? "md:h-96" : ""
          } rounded-3xl overflow-hidden cursor-pointer`}
        >
          {/* Background Image */}
          <Image
            src={data.image}
            alt={data.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes={data.featured && !isMobile ? "50vw" : "25vw"}
          />

          {/* Gradient Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-b ${data.gradient} group-hover:opacity-40 transition-opacity duration-300`}
          />

          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent opacity-70 group-hover:opacity-60 transition-opacity duration-300" />

          {/* Glassmorphic overlay on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20"
            transition={{ duration: 0.3 }}
          />

          {/* Content Container */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
            {/* Top Section: Icon & Badges */}
            <div className="flex items-start justify-between">
              {/* Floating Icon */}
              <motion.div
                animate={{ y: isHovered ? -8 : 0 }}
                transition={{ duration: 0.3 }}
                className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white group-hover:bg-white/20 transition-all"
              >
                {data.icon}
              </motion.div>

              {/* Badges */}
              {data.badge === "trending" && (
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  className="px-3 py-1 rounded-full bg-red-500/90 backdrop-blur text-white text-xs font-bold flex items-center gap-1 border border-red-400/50"
                >
                  🔥 Trending
                </motion.div>
              )}
              {data.badge === "new" && (
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  className="px-3 py-1 rounded-full bg-blue-500/90 backdrop-blur text-white text-xs font-bold border border-blue-400/50"
                >
                  ✨ New
                </motion.div>
              )}
              {data.badge === "featured" && (
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  className="px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur text-white text-xs font-bold flex items-center gap-1 border border-amber-400/50"
                >
                  ⭐ Featured
                </motion.div>
              )}
            </div>

            {/* Bottom Section: Category Info & CTA */}
            <div className="space-y-3">
              {/* Category Name */}
              <div>
                <motion.h3
                  animate={{ y: isHovered ? -4 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`font-black text-white drop-shadow-lg ${
                    data.featured && !isMobile ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
                  }`}
                >
                  {data.name}
                </motion.h3>

                {/* Tagline */}
                <motion.p
                  animate={{ y: isHovered ? -2 : 0, opacity: isHovered ? 1 : 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm sm:text-base text-white/90 drop-shadow-md"
                >
                  {data.tagline}
                </motion.p>
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base group/cta"
              >
                Explore
                <motion.span
                  animate={{ x: isHovered ? 4 : 0 }}
                  className="inline-block"
                >
                  →
                </motion.span>
              </motion.div>
            </div>
          </div>

          {/* Hover Border Glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 rounded-3xl border-2 border-white/40 pointer-events-none"
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function PremiumCategorySection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile scroll snap
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isMobile) return;

    container.style.scrollBehavior = "smooth";
    container.addEventListener("scroll", (e) => {
      const target = e.target as HTMLElement;
      // Scroll snap is handled by CSS
    });
  }, [isMobile]);

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
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
            Browse Categories
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Explore premium collections curated for you
          </p>
        </motion.div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} data={category} index={index} isMobile={false} />
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden">
          <motion.div
            ref={scrollContainerRef}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4"
            style={{ scrollBehavior: "smooth" }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex-shrink-0 w-56 sm:w-64 snap-center"
              >
                <CategoryCard data={category} index={index} isMobile={true} />
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile scroll hint */}
          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center mt-4 text-sm text-slate-500 flex items-center justify-center gap-2"
          >
            <span>Swipe for more</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.div>
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-200"
          >
            View All Categories
            <motion.svg
              animate={{ x: 0 }}
              whileHover={{ x: 4 }}
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </motion.svg>
          </Link>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-32 left-10 w-20 h-20 rounded-full border-2 border-amber-200/20 pointer-events-none" />
      <div className="absolute bottom-20 right-16 w-32 h-32 rounded-full border-2 border-blue-200/20 pointer-events-none" />
    </section>
  );
}
