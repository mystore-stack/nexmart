"use client";
// src/components/home/BrandCarouselSection.tsx — Section 14: Brand Carousel
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const BRANDS = [
  { name: "Apple", font: "font-sans font-bold tracking-tighter text-xl", icon: "" },
  { name: "SAMSUNG", font: "font-sans font-black tracking-widest text-lg", icon: "" },
  { name: "SONY", font: "font-serif font-black tracking-widest text-xl", icon: "" },
  { name: "xiaomi", font: "font-sans font-bold tracking-normal text-xl text-orange-600", icon: "mi" },
  { name: "hp", font: "font-serif italic font-bold text-2xl", icon: "" },
  { name: "JBL", font: "font-sans font-black tracking-tighter text-2xl text-red-600", icon: "" },
  { name: "Canon", font: "font-serif font-bold text-2xl text-red-700", icon: "" },
  { name: "ASUS", font: "font-sans font-black tracking-widest text-lg text-blue-700", icon: "" },
];

export function BrandCarouselSection() {
  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
          NOS MARQUES PARTENAIRES
        </h2>
        <Link
          href="/brands"
          className="text-xs font-semibold text-muted-foreground hover:text-brand-700 transition-colors flex items-center gap-1"
        >
          Voir toutes
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {BRANDS.map((brand, i) => (
          <motion.div
            key={brand.name}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Link
              href={`/products?brand=${brand.name.toLowerCase()}`}
              className="group flex h-20 items-center justify-center rounded-2xl border border-border/70 bg-card p-4 shadow-sm hover:border-gold-300 hover:shadow-luxury transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
                {brand.icon && <span className="text-xl font-bold">{brand.icon}</span>}
                <span className={`${brand.font} group-hover:scale-105 transition-transform duration-300`}>
                  {brand.name}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
