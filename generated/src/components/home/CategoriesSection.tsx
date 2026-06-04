"use client";
// src/components/home/CategoriesSection.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";

const CATEGORY_GRADIENTS = [
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-purple-400",
  "from-rose-500 to-pink-400",
  "from-amber-500 to-orange-400",
  "from-emerald-500 to-green-400",
  "from-sky-500 to-blue-400",
  "from-red-500 to-rose-400",
  "from-indigo-500 to-violet-400",
];

interface Props { categories: Category[] }

export function CategoriesSection({ categories }: Props) {
  if (categories.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
          <p className="text-muted-foreground mt-1">Explore our curated departments</p>
        </div>
        <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors">
          All categories <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.slice(0, 8).map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/products?categoryId=${cat.id}`}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-border hover:border-transparent hover:shadow-luxury transition-all bg-card"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length]} flex items-center justify-center group-hover:scale-110 transition-transform shadow-md overflow-hidden`}>
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">{cat.name[0]}</span>
                )}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold leading-tight">{cat.name}</p>
                {cat._count && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {cat._count.products}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
