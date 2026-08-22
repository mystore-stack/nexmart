"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  MonitorSmartphone, 
  Shirt, 
  Sofa, 
  Sparkles, 
  Dumbbell, 
  Gamepad2, 
  Car, 
  BookOpen, 
  Baby,
  ShoppingBag,
  LayoutGrid,
  ArrowRight
} from "lucide-react";
import type { Category } from "@/types";

const fallbackCategories = [
  { name: "Livres", icon: null },
  { name: "Électronique", icon: null },
  { name: "Mode", icon: null },
  { name: "Maison", icon: null },
  { name: "Audio", icon: null },
];

const getCategoryIcon = (name: string, className: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('électronique') || lower.includes('electronic')) return <MonitorSmartphone className={className} />;
  if (lower.includes('mode') || lower.includes('fashion') || lower.includes('vêtement')) return <Shirt className={className} />;
  if (lower.includes('maison') || lower.includes('home') || lower.includes('déco')) return <Sofa className={className} />;
  if (lower.includes('beauté') || lower.includes('beauty') || lower.includes('cosmétique')) return <Sparkles className={className} />;
  if (lower.includes('sport')) return <Dumbbell className={className} />;
  if (lower.includes('gaming') || lower.includes('jeu') || lower.includes('console')) return <Gamepad2 className={className} />;
  if (lower.includes('auto') || lower.includes('voiture')) return <Car className={className} />;
  if (lower.includes('livre') || lower.includes('book')) return <BookOpen className={className} />;
  if (lower.includes('enfant') || lower.includes('kid') || lower.includes('bébé')) return <Baby className={className} />;
  
  return <ShoppingBag className={className} />;
};

const getCategoryAccent = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('électronique')) return 'hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:bg-cyan-50/30 text-cyan-600';
  if (lower.includes('mode')) return 'hover:border-purple-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:bg-purple-50/30 text-purple-600';
  if (lower.includes('maison')) return 'hover:border-green-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] hover:bg-green-50/30 text-green-600';
  if (lower.includes('beauté')) return 'hover:border-pink-300 hover:shadow-[0_0_15px_rgba(236,72,153,0.15)] hover:bg-pink-50/30 text-pink-600';
  if (lower.includes('sport')) return 'hover:border-emerald-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-50/30 text-emerald-600';
  if (lower.includes('gaming')) return 'hover:border-violet-300 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:bg-violet-50/30 text-violet-600';
  if (lower.includes('auto')) return 'hover:border-orange-300 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:bg-orange-50/30 text-orange-600';
  if (lower.includes('livre')) return 'hover:border-blue-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:bg-blue-50/30 text-blue-600';
  if (lower.includes('enfant')) return 'hover:border-yellow-300 hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:bg-yellow-50/30 text-yellow-600';
  
  return 'hover:border-slate-300 hover:shadow-[0_0_15px_rgba(148,163,184,0.15)] hover:bg-slate-50/50 text-slate-600';
};

interface Props { categories: Category[]; config?: any }

export function CategoriesSection({ categories, config = {} }: Props) {
  const limit = config.limit || 9;
  
  // Use CMS categories if available, otherwise use fallback layout
  const visibleCategories = categories.length > 0 ? categories.slice(0, limit) : fallbackCategories.map((cat, index) => ({
    id: `fallback-${index}`,
    name: cat.name,
    slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
    image: cat.icon || null,
    _count: { products: 120 - index * 8 },
  }));

  return (
    <section className="my-10 md:my-16">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6 px-2">
        <div>
          <span className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-[#0d7a5e] uppercase mb-1 block">
            Catégories
          </span>
          <h2 className="hidden sm:block text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Parcourir par catégorie
          </h2>
        </div>
        <Link 
          href="/categories" 
          className="flex items-center gap-1 text-[11px] sm:text-sm font-bold text-slate-600 hover:text-[#0d7a5e] transition-colors group"
        >
          Voir tout 
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="flex gap-4 sm:gap-5 justify-start md:justify-between overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-2 sm:px-0 snap-x w-full max-w-full">
        {visibleCategories.map((cat, index) => {
          const accentClass = getCategoryAccent(cat.name);
          
          return (
            <motion.div 
              key={cat.id} 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
              className="shrink-0 snap-start"
            >
              <Link 
                href={`/products?categoryId=${cat.id}`} 
                className={`group relative flex flex-col items-center justify-center p-2.5 sm:p-4 gap-2 sm:gap-3 w-[80px] h-[95px] sm:w-[120px] sm:h-[135px] rounded-[20px] border border-slate-200 bg-white sm:shadow-sm transition-all duration-300 sm:hover:-translate-y-1 sm:${accentClass}`}
              >
                <div className="flex-1 flex items-center justify-center text-slate-500 group-hover:text-slate-800 transition-colors">
                  {cat.image && typeof cat.image === "string" && cat.image.trim() ? (
                    <Image 
                      src={cat.image} 
                      alt={cat.name} 
                      width={44} 
                      height={44} 
                      className="object-contain drop-shadow-sm transition-transform duration-300 sm:group-hover:scale-110" 
                    />
                  ) : (
                    <div className="transition-transform duration-300 sm:group-hover:scale-110">
                      {getCategoryIcon(cat.name, "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 stroke-[1.5]")}
                    </div>
                  )}
                </div>
                <span className="text-[11px] md:text-[13px] font-bold text-slate-700 text-center leading-tight line-clamp-1 w-full px-1">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          );
        })}

        {/* View All Button (Mobile & Desktop) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: visibleCategories.length * 0.05, duration: 0.4, ease: "easeOut" }} 
          className="shrink-0 snap-start"
        >
          <Link 
            href="/categories" 
            className="group relative flex flex-col items-center justify-center p-3 md:p-4 gap-3 w-[85px] h-[105px] sm:w-[120px] sm:h-[135px] rounded-[20px] border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 hover:shadow-[0_0_15px_rgba(148,163,184,0.15)] transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex-1 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 text-slate-500 group-hover:text-slate-700 group-hover:bg-slate-200 transition-colors">
                <LayoutGrid className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
            <span className="text-[12px] md:text-[13px] font-semibold text-slate-700 text-center flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

