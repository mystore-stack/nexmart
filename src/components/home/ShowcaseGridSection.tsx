"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import { deduplicateProducts } from "@/lib/product-deduplication";

interface ShowcaseGridProps {
  sponsored?: any[];
  bestsellers?: any[];
  newArrivals?: any[];
  mysteryBoxes?: any[];
  config?: any;
}

export function ShowcaseGridSection({ bestsellers = [], newArrivals = [], config = {} }: ShowcaseGridProps) {
  const dedupedBestsellers = deduplicateProducts(bestsellers).slice(0, 3);
  const dedupedNewArrivals = deduplicateProducts(newArrivals).slice(0, 3);

  const bestsellerItems = dedupedBestsellers.length ? dedupedBestsellers : [
    { id: "b-1", name: "Apple AirPods Pro 2", price: 18900, rating: 4.9, image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80" },
    { id: "b-2", name: "iPhone 15 Pro Max", price: 1599900, rating: 4.8, image: "https://images.unsplash.com/photo-1598327105666-5b89351cb31b?w=500&q=80" },
    { id: "b-3", name: "Samsung Galaxy S24 Ultra", price: 1299900, rating: 4.7, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80" },
  ];

  const newArrivalItems = dedupedNewArrivals.length ? dedupedNewArrivals : [
    { id: "n-1", name: "Nike Air Max 270", price: 119000, rating: 4.8, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80" },
    { id: "n-2", name: "Marshall Acton III", price: 259000, rating: 4.7, image: "https://images.unsplash.com/photo-1608223652631-7b897858f96e?w=500&q=80" },
    { id: "n-3", name: "DJI Mini 4 Pro", price: 899900, rating: 4.6, image: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=500&q=80" },
  ];

  return (
    <section className="my-8 md:my-12 relative section-glow-base section-glow-default overflow-hidden sm:overflow-visible">
      {/* Background Lighting Effects */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-slate-300/20 blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 relative z-0">
        
        {/* Sponsorisé */}
        <div className="bg-[#f8f9fa] rounded-[24px] p-5 sm:p-6 flex justify-between relative overflow-hidden">
          <div className="relative z-10 w-3/5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white shadow-sm border border-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-[0.15em] rounded-full mb-4">
              Sponsorisé
            </span>
            <h3 className="text-[18px] sm:text-xl font-bold text-slate-900 leading-tight mb-2">Xiaomi 14 Ultra</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mb-3">Performance sans compromis</p>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mb-4">
              À partir de <span className="font-bold text-slate-900">9.999 DH</span>
            </p>
            <Link href="/sponsored" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0d7a5e] px-4 py-2 text-[11px] font-bold text-white transition hover:bg-[#0b6a51]">
              Découvrir
            </Link>
          </div>
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 h-[120%] w-[50%]">
             <Image src="/images/sponsorise_phone.jpg" alt="Xiaomi 14 Ultra" fill className="object-contain object-right" />
          </div>
        </div>

        {/* Meilleures ventes */}
        {config.showBestsellers !== false && (
          <div className="bg-white border border-slate-100 rounded-[24px] p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Meilleures ventes</h3>
            </div>
            <div className="space-y-4">
              {bestsellerItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-4 bg-white p-2 transition hover:bg-slate-50 rounded-2xl group cursor-pointer border border-transparent hover:border-slate-100">
                  <span className="text-2xl font-light text-slate-200 w-8 tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                  <div className="w-14 h-14 relative bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 truncate mb-1">{item.name}</h4>
                    <div className="flex items-center gap-1.5">
                       <p className="text-xs font-bold text-slate-900">{(item.price / 100).toLocaleString("fr-MA")} DH</p>
                       <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                         <Star className="w-2.5 h-2.5 fill-amber-400" />
                         <span className="text-[10px] font-bold text-amber-500">{item.rating || "4.8"}</span>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nouveautés */}
        {config.showNewArrivals !== false && (
          <div className="bg-transparent sm:bg-white sm:border border-slate-100 rounded-[24px] sm:p-6 p-0 mt-2 sm:mt-0">
            <div className="flex justify-between items-center mb-4 sm:mb-6 px-1 sm:px-0">
              <h3 className="text-[15px] sm:text-sm font-bold text-slate-900">Nouveautés</h3>
            </div>
            <div className="flex sm:flex-col gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-2 sm:px-0 snap-x w-full max-w-full">
              {newArrivalItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 bg-white p-2.5 sm:p-2 transition hover:bg-slate-50 rounded-[18px] sm:rounded-2xl group cursor-pointer border border-slate-100 sm:border-transparent hover:border-slate-100 w-[130px] sm:w-auto shrink-0 snap-start relative">
                  <span className="absolute top-4 left-4 z-10 bg-[#0d7a5e] text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider sm:relative sm:top-auto sm:left-auto sm:shrink-0 sm:w-8 sm:text-center">New</span>
                  <div className="w-full h-[110px] sm:w-14 sm:h-14 relative bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover p-1 sm:p-0" />
                  </div>
                  <div className="flex-1 min-w-0 w-full mt-1 sm:mt-0">
                    <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 truncate mb-0.5 sm:mb-1">{item.name}</h4>
                    <p className="text-[12px] sm:text-xs font-bold text-[#0d7a5e] sm:text-slate-900 mt-1">{(item.price / 100).toLocaleString("fr-MA")} DH</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saisonnier Banner */}
        <div className="relative rounded-[24px] overflow-hidden flex flex-col p-4 sm:p-6 bg-[#f2f8f5] group">
           <Image src="/images/spring_collection.jpg" alt="Collection Printemps" fill className="object-cover object-right-bottom transition-transform duration-700 group-hover:scale-105" />
           <div className="absolute inset-0 bg-gradient-to-r from-[#f2f8f5]/90 via-[#f2f8f5]/70 to-transparent" />
           
           <div className="relative z-10 w-4/5 h-full flex flex-col">
             <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full mb-4 w-fit">
               Collection Saisonnière
             </span>
             <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">Printemps / Été 2024</h3>
             <p className="text-xs text-slate-600 mb-6">Les tendances de la saison à ne pas manquer.</p>
             <Link href="/spring-collection" className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition">
               Explorer <ArrowRight className="w-3 h-3" />
             </Link>
           </div>
        </div>

      </div>
    </section>
  );
}

