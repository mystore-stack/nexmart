"use client";
// src/components/home/ShowcaseGridSection.tsx — Sections 9, 10, 11, 12: Showcase Grid
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, Star, Sparkles, ArrowRight, Award } from "lucide-react";

interface ShowcaseGridProps {
  sponsored?: any[];
  bestsellers?: any[];
  newArrivals?: any[];
  mysteryBoxes?: any[];
}

export function ShowcaseGridSection({ sponsored = [], bestsellers = [], newArrivals = [], mysteryBoxes = [] }: ShowcaseGridProps) {
  // Fallback data if CMS data is empty
  const sponsoredItems = sponsored.length > 0 ? sponsored : [
    {
      id: "sp-1",
      name: "Casque Sony WH-1000XM5",
      price: 2499,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "sp-2",
      name: "iPad Air 5 M1 64GB Blue",
      price: 6499,
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "sp-3",
      name: "Samsung S24 Ultra 512GB",
      price: 12999,
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80",
    },
  ];

  const bestsellerItems = bestsellers.length > 0 ? bestsellers : [
    {
      rank: 1,
      name: "Apple AirPods Pro 2",
      price: 1799,
      rating: 4.9,
      reviewCount: 1432,
      image: "/images/promo_flash_sale.jpg",
    },
    {
      rank: 2,
      name: "iPhone 15 Pro",
      price: 12499,
      rating: 5.0,
      reviewCount: 3125,
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80",
    },
    {
      rank: 3,
      name: "Montre Series 8",
      price: 1199,
      rating: 4.8,
      reviewCount: 2143,
      image: "/images/promo_bundle.jpg",
    },
  ];

  const newArrivalItems = newArrivals.length > 0 ? newArrivals : [
    {
      name: "MacBook Air M3",
      price: 13999,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "PlayStation 5 Slim",
      price: 6499,
      image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "GoPro Hero 12",
      price: 3999,
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80",
    },
  ];

  const mysteryBoxItem = mysteryBoxes.length > 0 ? mysteryBoxes[0] : {
    title: "Boîte Mystère Premium",
    subtitle: "Édition Limitée",
    startingPrice: 199,
    rating: 4.9,
    reviewCount: 4502,
    image: "/images/promo_mystery_box.jpg",
    link: "/products?tag=mystery-box",
    ctaText: "Découvrir",
  };

  return (
    <section className="my-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Column 1: SPONSORED PRODUCTS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Sponsored Products
            </h3>
            <Link href="/products?tag=sponsored" className="text-xs text-muted-foreground hover:text-brand-700 transition-colors flex items-center">
              Voir tout <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-card p-3 rounded-2xl border border-border/80 shadow-sm">
            {sponsoredItems.map((item) => (
              <div key={item.id} className="group flex flex-col items-center text-center">
                <div className="relative h-20 w-full mb-2 rounded-xl bg-surface p-1">
                  <Image src={item.image} alt={item.name} fill className="object-contain group-hover:scale-105 transition-transform" />
                </div>
                <h4 className="line-clamp-2 text-[11px] font-bold text-foreground leading-tight mb-1">{item.name}</h4>
                <span className="text-[11px] font-black text-brand-700">{item.price.toLocaleString("fr-MA")} DH</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">Sponsored</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: MEILLEURES VENTES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Meilleures Ventes
            </h3>
            <Link href="/products?sort=bestselling" className="text-xs text-muted-foreground hover:text-brand-700 transition-colors flex items-center">
              Voir tout <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {bestsellerItems.map((item) => (
              <div key={item.rank || item.id} className="flex items-center gap-3 bg-card p-2.5 rounded-2xl border border-border/80 shadow-sm hover:border-gold-300 transition-all">
                <span className="font-display font-black text-base text-muted-foreground w-4 text-center">
                  {item.rank}
                </span>
                <div className="relative h-12 w-12 rounded-xl bg-surface p-1 flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-xs font-bold text-foreground">{item.name}</h4>
                  <span className="font-display text-xs font-black text-brand-700">
                    {item.price.toLocaleString("fr-MA")} DH
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-amber-500">
                    <Star className="h-2.5 w-2.5 fill-amber-400" />
                    <span className="font-bold">{item.rating}</span>
                    <span className="text-muted-foreground">({item.reviewCount || item.reviews})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: NOUVEAUTÉS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Nouveautés
            </h3>
            <Link href="/new-arrivals" className="text-xs text-muted-foreground hover:text-brand-700 transition-colors flex items-center">
              Voir tout <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {newArrivalItems.map((item, idx) => (
              <div key={item.id || idx} className="flex items-center gap-3 bg-card p-2.5 rounded-2xl border border-border/80 shadow-sm hover:border-brand-300 transition-all">
                <div className="relative h-12 w-12 rounded-xl bg-surface p-1 flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-xs font-bold text-foreground">{item.name}</h4>
                  <span className="font-display text-xs font-black text-brand-700">
                    {item.price.toLocaleString("fr-MA")} DH
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 4: MYSTERY BOXES Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Mystery Boxes
            </h3>
            <Link href="/products?tag=mystery-box" className="text-xs text-muted-foreground hover:text-brand-700 transition-colors flex items-center">
              Voir tout <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900 p-5 text-white shadow-luxury flex flex-col justify-between h-[210px]">
            <div className="absolute inset-0 moroccan-pattern-bg opacity-15 pointer-events-none" />
            
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full mb-2 backdrop-blur-sm">
                <Sparkles className="h-2.5 w-2.5" /> {mysteryBoxItem.subtitle || "Édition Limitée"}
              </span>
              <h4 className="font-display text-lg font-bold text-white leading-tight">
                {mysteryBoxItem.title}
              </h4>
              <p className="text-xs text-white/80 mt-1">
                À partir de <span className="font-black text-gold-300">{mysteryBoxItem.startingPrice?.toLocaleString("fr-MA") || "199,00"} DH</span>
              </p>

              <div className="flex items-center gap-1 text-[10px] text-gold-300 mt-2">
                <div className="flex text-amber-400">
                  {"★".repeat(Math.floor(mysteryBoxItem.rating || 4.9))}
                </div>
                <span className="font-bold text-white">{mysteryBoxItem.rating || 4.9}</span>
                <span className="text-white/60">({(mysteryBoxItem.reviewCount || 4502).toLocaleString("fr-MA")})</span>
              </div>
            </div>

            <div className="relative z-10">
              <Link
                href={mysteryBoxItem.link || "/products?tag=mystery-box"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 hover:bg-gold-300 text-purple-950 font-bold text-xs py-2 shadow-md transition-all group-hover:scale-102"
              >
                {mysteryBoxItem.ctaText || "Découvrir"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
