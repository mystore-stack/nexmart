"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingCart, Star, Heart } from "lucide-react";

export function RecommendedForYouSection({ products: cmsProducts = [], config = {} }: { products?: any[], config?: any }) {
  // Hide section if no real data available
  if (!cmsProducts || cmsProducts.length === 0) {
    return null;
  }

  const products = cmsProducts.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug || p.id,
    price: p.price,
    rating: p.rating || 4.8,
    images: p.images || ["/placeholder.svg"],
  }));

  return (
    <section className="relative my-4 overflow-visible">
      <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white px-4 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-6 md:px-8 md:py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0d7a5e] to-[#0a513f] text-white shadow-[0_10px_22px_rgba(13,122,94,0.25)]">
              <Star className="h-5 w-5 fill-amber-300 text-amber-300" />
            </span>
            <h2 className="truncate text-lg font-black uppercase tracking-[0.02em] text-slate-950 md:text-2xl">RECOMMANDÉ POUR VOUS</h2>
            <span className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-bold text-[#0d624f] shadow-sm sm:inline-flex">
            Pour vous
          </span>
        </div>
          <Link href="/products?sort=recommended" className="hidden items-center gap-3 rounded-full border border-emerald-100 bg-emerald-50 px-5 py-3 text-base font-black text-[#0d624f] shadow-sm transition hover:bg-emerald-100 sm:inline-flex">
          Voir tout <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

        <div className="relative">
        <button className="absolute -left-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-[#0d624f] shadow-[0_12px_28px_rgba(15,23,42,0.14)] transition hover:bg-emerald-50 lg:flex">
          <ChevronLeft className="h-6 w-6" />
        </button>
          <button className="absolute -right-2 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-[#0d624f] shadow-[0_14px_32px_rgba(15,23,42,0.16)] transition hover:bg-emerald-50 lg:flex">
          <ChevronRight className="h-7 w-7" />
        </button>

          <div className="flex gap-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((product) => (
              <motion.article
                key={product.id}
                className="group/card relative flex w-[220px] shrink-0 cursor-pointer flex-col rounded-[18px] border border-slate-200/75 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
              >
                <button className="absolute right-5 top-5 z-10 text-[#0d624f]" aria-label="Ajouter aux favoris">
                <Heart className="h-6 w-6" strokeWidth={2} />
              </button>
                <div className="relative mb-4 h-[190px] w-full overflow-hidden rounded-[16px] bg-[#f4f7f4]">
                {product.images[0] && (
                    <Image src={product.images[0]} alt={product.name} fill className="object-contain p-3 transition-transform duration-500 group-hover/card:scale-[1.03]" sizes="220px" />
                )}
              </div>
                <h3 className="mb-4 min-h-[3rem] text-[17px] font-black leading-tight text-slate-950 line-clamp-2">{product.name}</h3>
                <p className="mb-2 text-2xl font-black text-[#0d7a5e]">{product.price.toLocaleString("fr-MA")} DH</p>
                <div className="mt-auto flex items-center justify-between gap-3">
              {product.rating && (
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-base font-bold text-slate-800">{product.rating}</span>
                </div>
              )}
                  <button className="grid h-12 w-12 place-items-center rounded-[14px] border border-slate-200 bg-white text-[#0d7a5e] shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50" aria-label="Ajouter au panier">
                    <ShoppingCart className="h-6 w-6" />
                  </button>
                </div>
              </motion.article>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
