"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

interface Category {
  id: string;
  emoji: string;
  name: string;
  count?: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "flash", emoji: "🔥", name: "Flash Deals", count: 24 },
  { id: "electronics", emoji: "📱", name: "Electronics", count: 156 },
  { id: "fashion", emoji: "👕", name: "Fashion", count: 89 },
  { id: "home", emoji: "🏠", name: "Home", count: 72 },
  { id: "beauty", emoji: "💄", name: "Beauty", count: 45 },
  { id: "gaming", emoji: "🎮", name: "Gaming", count: 38 },
  { id: "moroccan", emoji: "🇲🇦", name: "Moroccan", count: 52 },
];

interface DealCategoriesProps {
  categories?: Category[];
  onCategoryClick?: (categoryId: string) => void;
  activeCategory?: string;
}

export function DealCategories({
  categories = DEFAULT_CATEGORIES,
  onCategoryClick,
  activeCategory = "flash",
}: DealCategoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="px-4 py-4"
    >
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
      >
        {categories.map((category) => (
          <motion.button
            key={category.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryClick?.(category.id)}
            className={`relative flex-shrink-0 px-4 py-3 rounded-2xl border-2 transition-all duration-300 ${
              activeCategory === category.id
                ? "border-red-500 bg-red-50"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="flex flex-col items-center gap-1 min-w-max">
              <div className="text-2xl">{category.emoji}</div>
              <div className="text-center">
                <p className="text-xs font-bold text-neutral-900">
                  {category.name}
                </p>
                {category.count && (
                  <p className="text-xs text-neutral-500">
                    {category.count}
                  </p>
                )}
              </div>
            </div>

            {/* Active indicator */}
            {activeCategory === category.id && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
