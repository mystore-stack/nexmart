"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Star, Heart } from "lucide-react";

interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  rating: number;
  images: string[];
}

export function RecommendedForYouSection({ products: cmsProducts = [], config = {} }: { products?: any[], config?: any }) {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cmsProducts && cmsProducts.length > 0) {
      setProducts(cmsProducts.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug || p.id,
        price: p.price,
        rating: p.rating || 4.8,
        images: p.images || ["/placeholder.svg"],
      })));
    } else {
      // Mock products to match image as fallback
      setProducts([
        { id: "r-1", name: "Logitech MX Master 3S", slug: "logitech-mx", price: 99900, rating: 4.8, images: ["https://images.unsplash.com/photo-1527814050087-379381547961?w=500&q=80"] },
        { id: "r-2", name: "Sac à main Premium", slug: "sac-main", price: 79900, rating: 4.9, images: ["https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&q=80"] },
        { id: "r-3", name: "Sony WH-1000XM5", slug: "sony-wh", price: 279900, rating: 4.8, images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80"] },
        { id: "r-4", name: "Lit Premium Confort", slug: "lit-premium", price: 429900, rating: 4.9, images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80"] },
        { id: "r-5", name: "Casio G-Shock GA-2100", slug: "casio", price: 119900, rating: 4.7, images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"] },
        { id: "r-6", name: "Dyson V15 Detect", slug: "dyson", price: 699900, rating: 4.8, images: ["https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&q=80"] },
      ]);
    }
    setLoading(false);
  }, [cmsProducts]);

  return (
    <section className="my-8 md:my-12 relative section-glow-base section-glow-recommended overflow-hidden sm:overflow-visible">
      {/* Background Lighting Effects */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="flex items-center justify-between mb-6 relative z-0">
        <div className="flex items-center gap-3">
          <h2 className="text-[11px] sm:text-xs font-bold text-[#0d7a5e] uppercase tracking-[0.15em]">RECOMMANDÉ POUR VOUS</h2>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#0d7a5e]/10 text-[#0d7a5e] text-[9px] sm:text-[10px] font-bold">
            Pour vous
          </span>
        </div>
        <Link href="/products?sort=recommended" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full">
          Voir tout <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="relative group">
        {/* Navigation Buttons */}
        <button className="absolute -left-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-slate-100 text-slate-400 hover:text-slate-600 z-10 hidden lg:flex">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button className="absolute -right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-slate-100 text-slate-400 hover:text-slate-600 z-10 hidden lg:flex">
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((product) => (
            <motion.div key={product.id} className="w-[145px] sm:w-[180px] shrink-0 group/card cursor-pointer bg-white rounded-2xl border border-slate-200 p-2.5 sm:p-3 relative flex flex-col">
              <button className="absolute top-2.5 right-2.5 z-10 text-[#0d7a5e]">
                <Heart className="w-4 h-4" strokeWidth={2} />
              </button>
              <div className="relative h-32 w-full mb-4 bg-[#f8f9fa] rounded-2xl overflow-hidden">
                <Image src={product.images[0]} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover/card:scale-110" />
              </div>
              <h3 className="text-[11px] sm:text-xs font-bold text-slate-900 mb-1 line-clamp-2 min-h-[32px]">{product.name}</h3>
              <p className="text-[13px] sm:text-sm font-bold text-[#0d7a5e] mb-1">{(product.price / 100).toLocaleString("fr-MA")} DH</p>
              <div className="flex items-center gap-1 mt-auto">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700">{product.rating} <span className="text-slate-400 font-medium">(1.2k)</span></span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

