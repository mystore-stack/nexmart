"use client";

import { motion } from "framer-motion";

interface Category {
  id: string;
  emoji: string;
  name: string;
  description: string;
  color: string;
  borderColor: string;
}

const CATEGORIES: Category[] = [
  {
    id: "beauty",
    emoji: "🎁",
    name: "Beauty Box",
    description: "Premium cosmetics",
    color: "from-pink-50 to-rose-50",
    borderColor: "border-pink-200",
  },
  {
    id: "tech",
    emoji: "🎮",
    name: "Gaming Box",
    description: "Tech gadgets",
    color: "from-purple-50 to-violet-50",
    borderColor: "border-purple-200",
  },
  {
    id: "electronics",
    emoji: "📱",
    name: "Tech Box",
    description: "Electronics",
    color: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
  },
  {
    id: "home",
    emoji: "🏠",
    name: "Home Box",
    description: "Home essentials",
    color: "from-amber-50 to-yellow-50",
    borderColor: "border-amber-200",
  },
  {
    id: "morocco",
    emoji: "🇲🇦",
    name: "Morocco Box",
    description: "Moroccan crafts",
    color: "from-orange-50 to-red-50",
    borderColor: "border-orange-200",
  },
  {
    id: "limited",
    emoji: "🎉",
    name: "Limited Edition",
    description: "Exclusive items",
    color: "from-indigo-50 to-purple-50",
    borderColor: "border-indigo-200",
  },
];

interface CategoryCardsProps {
  onCategoryClick?: (categoryId: string) => void;
}

export function CategoryCards({ onCategoryClick }: CategoryCardsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="px-4 py-4"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="text-xl font-bold text-neutral-900 mb-4"
      >
        Explore Categories
      </motion.h2>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => (
          <motion.button
            key={category.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryClick?.(category.id)}
            className={`relative overflow-hidden rounded-2xl p-4 border-2 ${category.borderColor} transition-all duration-300 group`}
            style={{
              background: `linear-gradient(135deg, var(--color-from) 0%, var(--color-to) 100%)`,
              '--color-from': 'rgb(245, 245, 245)',
              '--color-to': 'rgb(245, 245, 245)',
            } as any}
          >
            {/* Gradient background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                className="text-3xl mb-2"
              >
                {category.emoji}
              </motion.div>
              <h3 className="font-bold text-sm text-neutral-900 group-hover:text-neutral-900 transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-neutral-600 group-hover:text-neutral-700 transition-colors mt-0.5">
                {category.description}
              </p>
            </div>

            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
