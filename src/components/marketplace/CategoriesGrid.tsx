"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MonitorSmartphone,
  Shirt,
  Sparkles,
  Home,
  Gamepad2,
  Dumbbell,
  ShoppingBasket,
  Gem,
  Car,
} from "lucide-react";
import type { MarketplaceCategory } from "@/lib/marketplace-data";

interface CategoriesGridProps {
  categories: MarketplaceCategory[];
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  variant?: "default" | "compact" | "featured";
  onCategoryClick?: (category: MarketplaceCategory) => void;
}

const IconComponent = ({ name }: { name: string }) => {
  switch (name) {
    case "monitor-smartphone":
      return <MonitorSmartphone className="w-5 h-5" />;
    case "shirt":
      return <Shirt className="w-5 h-5" />;
    case "sparkles":
      return <Sparkles className="w-5 h-5" />;
    case "home":
      return <Home className="w-5 h-5" />;
    case "gamepad2":
      return <Gamepad2 className="w-5 h-5" />;
    case "dumbbell":
      return <Dumbbell className="w-5 h-5" />;
    case "shopping-basket":
      return <ShoppingBasket className="w-5 h-5" />;
    case "gem":
      return <Gem className="w-5 h-5" />;
    case "car":
      return <Car className="w-5 h-5" />;
    default:
      return null;
  }
};

export function CategoriesGrid({
  categories,
  columns = { mobile: 2, tablet: 3, desktop: 6 },
  variant = "default",
  onCategoryClick,
}: CategoriesGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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

  const gridColsClass = {
    mobile: `grid-cols-${columns.mobile || 2}`,
    tablet: `md:grid-cols-${columns.tablet || 3}`,
    desktop: `lg:grid-cols-${columns.desktop || 6}`,
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid ${gridColsClass.mobile} ${gridColsClass.tablet} ${gridColsClass.desktop} gap-3 sm:gap-4 lg:gap-5`}
    >
      {categories.map((category, index) => (
        <motion.div key={category.slug} variants={itemVariants}>
          <Link
            href={`/products?category=${category.slug}`}
            onClick={() => onCategoryClick?.(category)}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Background Image */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/30 to-transparent group-hover:from-slate-900/70 transition-all duration-300" />

              {/* Icon Badge */}
              <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-[#0f5d43]">
                <IconComponent name={category.icon} />
              </div>

              {/* Content overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4">
                <h3 className="font-bold text-sm sm:text-base text-white leading-tight group-hover:text-[#d6b25e] transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-white/75 mt-1 line-clamp-1">
                  {category.accent}
                </p>
                <p className="text-[10px] text-white/60 mt-1.5 font-medium">
                  {category.count} items
                </p>
              </div>

              {/* Hover indicator */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 rounded-full bg-[#d6b25e]/80 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
