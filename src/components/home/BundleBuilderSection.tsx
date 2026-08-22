"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { ArrowRight, Gift, Check } from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import { deduplicateProducts } from "@/lib/product-deduplication";

interface BundleBuilderSectionProps {
  products?: any[];
  config?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    maxDiscountPercent?: number;
    showGift?: boolean;
    giftTitle?: string;
    giftDescription?: string;
    giftImage?: string;
  };
}

export function BundleBuilderSection({ products = [], config = {} }: BundleBuilderSectionProps) {
  const addItem = useCartStore((state) => state.addItem);
  
  const defaultProducts = [
    { id: "b1", name: "Smartwatch", price: 119900, oldPrice: 159900, images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"] },
    { id: "b2", name: "Écouteurs sans-fil", price: 79900, oldPrice: 99900, images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80"] },
    { id: "b3", name: "Enceinte Bluetooth", price: 39900, oldPrice: 49900, images: ["https://images.unsplash.com/photo-1608223652631-7b897858f96e?w=500&q=80"] },
    { id: "b4", name: "Chargeur rapide", price: 24900, oldPrice: 34900, images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80"] }
  ];

  const dedupedProducts = deduplicateProducts(products);
  const displayProducts = dedupedProducts.length >= 4 
    ? dedupedProducts.slice(0, 4) 
    : dedupedProducts.length > 0 
      ? [...dedupedProducts, ...defaultProducts].slice(0, 4)
      : defaultProducts;

  const maxDiscount = config.maxDiscountPercent || 30;
  const totalPriceRaw = displayProducts.reduce((sum, p) => sum + (p.oldPrice || p.price || 0), 0);
  const finalPrice = totalPriceRaw * (1 - (maxDiscount / 100));

  const handleCreateBundle = () => {
    displayProducts.forEach(p => {
      addItem(p, 1);
    });
  };

  return (
    <section className="my-8 md:my-16 max-w-[1200px] mx-auto">
      {/* Products Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 relative">
        {displayProducts.map((product, idx) => (
          <React.Fragment key={product.id || idx}>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm relative w-full md:w-1/4 flex flex-col items-center group hover:shadow-md transition-all">
              <div className="absolute top-4 right-4 bg-[#2cb174] text-white rounded-full p-1 shadow-sm z-10">
                <Check className="w-4 h-4" />
              </div>
              <div className="relative w-28 h-28 mb-4">
                <Image src={product.images?.[0] || defaultProducts[0].images[0]} alt={product.name} fill className="object-contain group-hover:scale-105 transition-transform" />
              </div>
              <h4 className="font-bold text-slate-900 text-center text-sm mb-1">{product.name}</h4>
              <p className="text-slate-500 font-medium text-xs">{(product.price / 100).toLocaleString("fr-MA")} DH</p>
            </div>
            {idx < displayProducts.length - 1 && (
              <div className="hidden md:flex text-[#2cb174] font-black text-2xl shrink-0">
                +
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Gift Section */}
      {config.showGift !== false && (
        <div className="bg-[#f0f9f4] border border-[#d6f0e1] rounded-3xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
           <div className="flex items-start gap-5 relative z-10">
             <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-[#e1f5e9] flex items-center justify-center shrink-0">
               <Gift className="w-7 h-7 text-[#2cb174]" />
             </div>
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <span className="text-[#e05615] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                   🎁 VOTRE CADEAU OFFERT
                 </span>
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">{config.giftTitle || "Kit de nettoyage 7-en-1"}</h3>
               <p className="text-slate-600 text-sm max-w-md leading-relaxed">
                 {config.giftDescription || "Pour garder tous vos appareils propres et comme neufs au quotidien."}
               </p>
             </div>
           </div>
           
           <div className="hidden md:block absolute right-[25%] top-1/2 -translate-y-1/2">
             <svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M0 38C20 38 40 10 75 10" stroke="#2cb174" strokeWidth="2" strokeDasharray="4 4" fill="none" />
               <path d="M70 5 L78 10 L70 15" stroke="#2cb174" strokeWidth="2" fill="none" />
             </svg>
           </div>
           
           <div className="mt-6 md:mt-0 relative w-32 h-32 shrink-0 bg-white rounded-2xl shadow-sm border border-[#e1f5e9] p-2 z-10">
              <Image src={config.giftImage || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=200"} alt="Gift" fill className="object-contain rounded-xl" />
           </div>
           
           <div className="absolute right-0 top-0 text-[#2cb174]/10 w-64 h-64 -translate-y-1/4 translate-x-1/4">
             <SparklesIcon />
           </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="bg-[#fcfaf8] border border-[#f5ece4] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-[#f5ece4] flex flex-col items-center justify-center text-[#2cb174]">
            <span className="text-xl font-black">-{maxDiscount}%</span>
          </div>
          <div>
            <p className="text-[#2cb174] font-black text-xs uppercase tracking-wider mb-2">ÉCONOMIE INCROYABLE</p>
          </div>
        </div>
        
        <div className="flex-1 md:border-l md:border-slate-200 md:pl-8 text-center md:text-left">
           <p className="text-slate-900 font-bold text-lg mb-1">
             Total estimé : {(finalPrice / 100).toLocaleString("fr-MA")} DH
           </p>
           <p className="text-slate-500 text-sm">
             au lieu de <span className="line-through">{(totalPriceRaw / 100).toLocaleString("fr-MA")} DH</span>
           </p>
        </div>

        <button onClick={handleCreateBundle} className="w-full md:w-auto bg-[#1a4a38] hover:bg-[#123628] text-white font-bold py-4 px-8 rounded-full flex items-center justify-center gap-2 transition-colors">
          {config.ctaText || "Créer mon bundle"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}
