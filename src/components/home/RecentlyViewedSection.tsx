"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/types";

export function RecentlyViewedSection() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nexmart-recently-viewed");
      if (raw) setProducts(JSON.parse(raw).slice(0, 6));
    } catch {}
    
    // Mock for display if empty
    if (!products.length) {
      setProducts([
        { id: "rv-1", name: "Montre Connectée Sport", price: 89900, rating: 4.5, images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"], slug: "montre-sport" } as any,
        { id: "rv-2", name: "Écouteurs Sans Fil Pro", price: 59900, rating: 4.8, images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80"], slug: "ecouteurs-pro" } as any,
        { id: "rv-3", name: "Sac à main Premium", price: 45900, rating: 4.6, images: ["https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&q=80"], slug: "sac-urbain" } as any,
        { id: "rv-4", name: "Clavier Mécanique RGB", price: 74900, rating: 4.9, images: ["https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80"], slug: "clavier-mecanique" } as any,
        { id: "rv-5", name: "Enceinte Portable", price: 39900, rating: 4.7, images: ["https://images.unsplash.com/photo-1608223652631-7b897858f96e?w=500&q=80"], slug: "enceinte-portable" } as any,
        { id: "rv-6", name: "Souris Gamer Légère", price: 49900, rating: 4.8, images: ["https://images.unsplash.com/photo-1527814050087-379381547961?w=500&q=80"], slug: "souris-gamer" } as any,
      ]);
    }
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="my-8 md:my-12 section-glow-base section-glow-recent">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">VUS RÉCEMMENT</h2>
        <div className="h-[1px] flex-1 bg-slate-200 ml-4"></div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <Link href={`/products/${product.slug}`} key={product.id} className="w-[160px] shrink-0 group">
            <div className="relative h-40 w-full mb-3 bg-[#f8f9fa] rounded-2xl overflow-hidden transition-all group-hover:shadow-md">
              <Image src={product.images[0]} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <h3 className="text-[11px] font-bold text-slate-900 mb-1 line-clamp-1">{product.name}</h3>
            <p className="text-xs font-black text-slate-700 mb-1">{(product.price / 100).toLocaleString("fr-MA")} DH</p>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="h-3 w-3 fill-amber-400" />
              <span className="text-[9px] font-bold text-slate-500 ml-0.5">{product.rating || 4.5}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
