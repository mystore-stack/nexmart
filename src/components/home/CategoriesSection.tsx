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
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="section-label mb-2 block">Nos collections</span>
          <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Parcourir par catégorie
          </h2>
        </div>
        <Link href="/categories" className="hidden items-center gap-2 text-sm font-semibold text-orange-600 transition-colors group sm:flex">
          Tout voir
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {categories.slice(0, 6).map((cat, i) => {
          const cfg = CATEGORY_CONFIGS[i % CATEGORY_CONFIGS.length];
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: "easeOut" }}
            >
              <Link
                href={`/products?categoryId=${cat.id}`}
                className="group flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
              >
                <div className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.gradient} shadow-md transition-transform duration-300 group-hover:scale-105`}>
                  <div className="absolute inset-0 moroccan-pattern-bg opacity-20" />
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} width={48} height={48} className="relative z-10 h-full w-full object-cover" />
                  ) : (
                    <span className="relative z-10 flex h-full w-full items-center justify-center text-lg font-semibold text-white">{cat.name[0]}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-orange-600">{cat.name}</p>
                  {cat._count && (
                    <p className="mt-1 text-[11px] font-medium text-slate-500">
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
