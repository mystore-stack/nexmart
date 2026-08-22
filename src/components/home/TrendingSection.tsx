"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

export function TrendingSection({ products = [] }: { products?: any[] }) {
  const [activeTab, setActiveTab] = useState("Tout");
  const tabs = ["Tout", "Tech & Gadgets", "Mode", "Maison", "Audio"];

  // Mock products to match image layout
  const mockProducts = [
    { id: "t-1", name: "Drone DJI Mini 3 Pro", price: 899000, oldPrice: 1050000, rating: 4.9, reviews: "2.1k", images: ["https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=500&q=80"] },
    { id: "t-2", name: "Nike Air Jordan 1", price: 189900, rating: 4.8, reviews: "4.5k", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"], tag: "Nouveau" },
    { id: "t-3", name: "Marshall Acton II", price: 299900, oldPrice: 349900, rating: 4.7, reviews: "1.2k", images: ["https://images.unsplash.com/photo-1608223652631-7b897858f96e?w=500&q=80"] },
    { id: "t-4", name: "Cafetière Smeg Années 50", price: 429900, rating: 4.9, reviews: "850", images: ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&q=80"], tag: "Tendance" },
    { id: "t-5", name: "Samsung Galaxy Watch 6", price: 349900, rating: 4.8, reviews: "3.2k", images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"] },
    { id: "t-6", name: "Lunettes de soleil Ray-Ban", price: 159900, oldPrice: 189900, rating: 4.6, reviews: "1.8k", images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80"] },
  ];

  return (
    <section className="my-8 md:my-12 relative section-glow-base section-glow-trending overflow-hidden sm:overflow-visible">
      {/* Background Lighting Effects */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 blur-[120px] pointer-events-none -z-10 rounded-full" />
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4 relative z-0">
        
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">TENDANCES DU MOMENT</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
            À ne pas rater
          </span>
        </div>

        <div className="flex overflow-x-auto whitespace-nowrap pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-center gap-2 px-2 sm:px-0 w-full max-w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition shrink-0 ${
                activeTab === tab
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {mockProducts.map((product) => (
          <Link href={`/products/${product.id}`} key={product.id} className="group flex flex-col bg-white p-3 sm:p-4 rounded-3xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition">
            
            <div className="relative h-32 w-full mb-4 bg-[#f8f9fa] rounded-2xl overflow-hidden">
              {product.tag && (
                <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-slate-900 text-[9px] font-bold px-2 py-1 rounded-md z-10 uppercase tracking-wider">
                  {product.tag}
                </span>
              )}
              <Image src={product.images[0]} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            
            <h3 className="text-xs font-bold text-slate-900 mb-2 line-clamp-2 min-h-[32px]">{product.name}</h3>
            
            <div className="flex items-baseline gap-2 mb-2 mt-auto">
              <span className="text-sm font-black text-emerald-600">{(product.price / 100).toLocaleString("fr-MA")} DH</span>
              {product.oldPrice && <span className="text-[10px] text-slate-400 line-through">{(product.oldPrice / 100).toLocaleString("fr-MA")} DH</span>}
            </div>
            
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3 w-3 fill-amber-400" />
              <span className="text-[10px] font-bold text-slate-500">{product.rating} <span className="font-normal text-slate-400">({product.reviews})</span></span>
            </div>
            
          </Link>
        ))}
      </div>
    </section>
  );
}
