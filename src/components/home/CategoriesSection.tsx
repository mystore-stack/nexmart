"use client";
// src/components/home/CategoriesSection.tsx - Moroccan Luxury
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";

const CATEGORY_CONFIGS = [
  { gradient: "from-brand-700 to-brand-600", light: "from-brand-50 to-brand-100/50" },
  { gradient: "from-gold-600 to-gold-500", light: "from-gold-50 to-gold-100/50" },
  { gradient: "from-moroccan-cobalt to-blue-700", light: "from-blue-50 to-blue-100/50" },
  { gradient: "from-moroccan-terracotta to-orange-600", light: "from-orange-50 to-orange-100/50" },
  { gradient: "from-violet-700 to-violet-600", light: "from-violet-50 to-violet-100/50" },
  { gradient: "from-rose-600 to-rose-500", light: "from-rose-50 to-rose-100/50" },
  { gradient: "from-teal-700 to-teal-600", light: "from-teal-50 to-teal-100/50" },
  { gradient: "from-slate-700 to-slate-600", light: "from-slate-50 to-slate-100/50" },
];

interface Props { categories: Category[] }

export function CategoriesSection({ categories }: Props) {
  if (categories.length === 0) return null;

  return (
    <div className="space-y-7">
      <div className="flex items-end justify-between">
        <div>
          <span className="section-label mb-2 block">
            <span className="inline-block w-8 h-px bg-gold-500 mr-2 align-middle" />
            Nos collections
          </span>
          <h2 className="font-display text-3xl font-semibold md:text-4xl text-foreground">
            Parcourir par catégorie
          </h2>
        </div>
        <Link
          href="/categories"
          className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-400 hover:text-brand-600 transition-colors group"
        >
          Tout voir
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.slice(0, 8).map((cat, i) => {
          const cfg = CATEGORY_CONFIGS[i % CATEGORY_CONFIGS.length];
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
            >
              <Link
                href={`/products?categoryId=${cat.id}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card hover:border-gold-400/50 dark:hover:border-gold-600/30 transition-all duration-300 hover:-translate-y-1.5"
                style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}
              >
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md overflow-hidden`}>
                  {/* Moroccan pattern overlay on icon */}
                  <div className="absolute inset-0 moroccan-pattern-bg opacity-20" />
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} width={48} height={48} className="object-cover relative z-10" />
                  ) : (
                    <span className="text-white font-display font-bold text-lg relative z-10">{cat.name[0]}</span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold leading-tight text-foreground group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">{cat.name}</p>
                  {cat._count?.products && (
                    <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                      {cat._count.products} produits
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
