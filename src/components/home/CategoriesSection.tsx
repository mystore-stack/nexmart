"use client";
// src/components/home/CategoriesSection.tsx — Section 5: Categories Grid
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Smartphone, Shirt, Home, Sparkles, Dumbbell, Car, Gamepad2, Grid } from "lucide-react";
import type { Category } from "@/types";

const DEFAULT_CATEGORIES = [
  { id: "cat-1", name: "Électronique", icon: Smartphone, gradient: "from-blue-600 to-indigo-700", bg: "bg-blue-50 text-blue-600" },
  { id: "cat-2", name: "Mode", icon: Shirt, gradient: "from-amber-600 to-amber-700", bg: "bg-amber-50 text-amber-600" },
  { id: "cat-3", name: "Maison", icon: Home, gradient: "from-emerald-600 to-teal-700", bg: "bg-emerald-50 text-emerald-600" },
  { id: "cat-4", name: "Beauté", icon: Sparkles, gradient: "from-rose-500 to-pink-600", bg: "bg-rose-50 text-rose-600" },
  { id: "cat-5", name: "Sport", icon: Dumbbell, gradient: "from-violet-600 to-purple-700", bg: "bg-purple-50 text-purple-600" },
  { id: "cat-6", name: "Automobile", icon: Car, gradient: "from-slate-700 to-slate-800", bg: "bg-slate-100 text-slate-700" },
  { id: "cat-7", name: "Jouets", icon: Gamepad2, gradient: "from-amber-500 to-orange-600", bg: "bg-orange-50 text-orange-600" },
  { id: "cat-8", name: "Voir toutes", icon: Grid, gradient: "from-brand-700 to-brand-800", bg: "bg-brand-50 text-brand-700", isLinkAll: true },
];

interface Props { categories?: Category[] }

export function CategoriesSection({ categories }: Props) {
  const displayList = (categories && categories.length > 0) ? categories.slice(0, 7) : [];

  return (
    <div className="space-y-6 my-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="section-label mb-1 block text-xs font-bold uppercase tracking-wider text-gold-600">
            <span className="inline-block w-6 h-px bg-gold-500 mr-2 align-middle" />
            Catégories Populaires
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Parcourir par catégorie
          </h2>
        </div>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors group"
        >
          Tout voir
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {DEFAULT_CATEGORIES.map((catItem, i) => {
          const dbCat = displayList[i];
          const IconComp = catItem.icon;
          const href = catItem.isLinkAll ? "/categories" : dbCat ? `/products?categoryId=${dbCat.id}` : `/products?category=${catItem.name.toLowerCase()}`;

          return (
            <motion.div
              key={catItem.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Link
                href={href}
                className="group flex flex-col items-center gap-2.5 p-4 rounded-3xl border border-border/70 bg-card hover:border-gold-300 hover:shadow-luxury transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ${catItem.bg} group-hover:scale-110 transition-transform duration-300 shadow-sm overflow-hidden`}>
                  {dbCat?.image ? (
                    <Image src={dbCat.image} alt={dbCat.name} width={56} height={56} className="object-cover h-full w-full" />
                  ) : (
                    <IconComp className="h-7 w-7" />
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-brand-700 transition-colors leading-tight">
                    {dbCat ? dbCat.name : catItem.name}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
