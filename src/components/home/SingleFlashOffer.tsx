"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Star, Zap, Flame } from "lucide-react";
import { useCartStore } from "@/store/cart";

export function SingleFlashOffer({ products = [], config = {} }: { products?: any[], config?: any }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const targetDate = config.endDate ? new Date(config.endDate).getTime() : new Date().getTime() + 5 * 60 * 60 * 1000 + 47 * 60 * 1000;
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [config.endDate]);

  const formatTime = (v: number) => v.toString().padStart(2, "0");

  const fallbackProduct = {
    id: "sfo-1",
    name: "Apple AirPods Pro 2",
    description: "Écouteurs sans fil avec réduction de bruit",
    price: 18900,
    oldPrice: 24900,
    rating: 4.8,
    reviews: "18k",
    discount: 24,
    images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80"]
  };

  const product = products[0] || fallbackProduct;
  const stockRemaining = config.stockRemaining || 8;
  const totalStock = config.totalStock || 50;
  const stockPercentage = Math.round((stockRemaining / totalStock) * 100);

  return (
    <section className="my-8 md:my-16 container-main max-w-[1000px] mx-auto">
      <div className="bg-[#fcfaf8] rounded-[2rem] border border-[#f5ece4] p-8 md:p-12 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
        
        {/* Left Side: Timer and Info */}
        <div className="flex-1 w-full md:w-auto relative z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-[#f36b2b] font-black text-xl md:text-2xl mb-3 tracking-wide">
            <Zap className="w-6 h-6 fill-current" />
            OFFRE FLASH
          </div>
          <p className="text-slate-600 text-sm mb-8 max-w-[250px] mx-auto md:mx-0">
            {config.subtitle || "Prix réduit pendant une durée limitée !"}
          </p>

          <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
            <div className="flex flex-col items-center">
              <div className="bg-[#f9eee6] text-[#f36b2b] w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold border border-[#f5dfd0]">
                {formatTime(timeLeft.hours + (timeLeft.days * 24))}
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-2">HRS</span>
            </div>
            <span className="text-slate-400 text-2xl font-bold mb-5">:</span>
            <div className="flex flex-col items-center">
              <div className="bg-[#f9eee6] text-[#f36b2b] w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold border border-[#f5dfd0]">
                {formatTime(timeLeft.minutes)}
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-2">MIN</span>
            </div>
            <span className="text-slate-400 text-2xl font-bold mb-5">:</span>
            <div className="flex flex-col items-center">
              <div className="bg-[#f9eee6] text-[#f36b2b] w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold border border-[#f5dfd0]">
                {formatTime(timeLeft.seconds)}
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-2">SEC</span>
            </div>
          </div>

          <div className="max-w-[280px] mx-auto md:mx-0">
            <p className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mb-3">
              <Flame className="w-4 h-4 text-[#f36b2b] fill-current" />
              Plus que <span className="text-[#f36b2b] font-bold">{stockRemaining} pièces</span> en stock
            </p>
            <div className="w-full h-2 bg-[#f9eee6] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#f36b2b] rounded-full" 
                style={{ width: `${stockPercentage}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Center: Image Showcase */}
        <div className="w-full md:w-[350px] shrink-0 relative flex justify-center py-6">
          <div className="absolute inset-0 bg-[#faefe7] rounded-full opacity-60 blur-2xl transform scale-110"></div>
          <div className="w-64 h-64 rounded-full bg-[#faefe7] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-[#f5dfd0]/50 z-0"></div>
          
          <div className="relative z-10 w-56 h-56 drop-shadow-2xl hover:scale-105 transition-transform duration-500">
             <Image src={product.images[0]} alt={product.name} fill className="object-contain" />
          </div>
          
          {/* Pedestal effect */}
          <div className="absolute -bottom-6 w-56 h-12 bg-gradient-to-t from-[#ebd6c5] to-[#f9eee6] rounded-[100%] shadow-lg z-0"></div>
          <div className="absolute -bottom-10 w-64 h-8 bg-[#ebd6c5] rounded-[100%] shadow-xl z-[-1] opacity-50"></div>
        </div>

        {/* Right Side: Product Details */}
        <div className="flex-1 w-full md:w-auto relative z-10 text-center md:text-left">
          <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
            {product.name}
          </h2>
          <p className="text-slate-500 text-sm mb-6 max-w-[280px] mx-auto md:mx-0 leading-relaxed">
            {product.description || config.description || "Écouteurs sans fil avec réduction de bruit"}
          </p>

          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            <span className="font-black text-[#f36b2b] text-4xl tracking-tight">{(product.price / 100).toLocaleString("fr-MA")} <span className="text-2xl">DH</span></span>
            {product.oldPrice && (
              <span className="text-slate-400 text-xl font-bold line-through">{(product.oldPrice / 100).toLocaleString("fr-MA")} DH</span>
            )}
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
             {product.discount && (
                <div className="bg-[#f9eee6] text-[#f36b2b] font-bold px-3 py-1.5 rounded-lg text-sm border border-[#f5dfd0]">
                  -{product.discount}%
                </div>
             )}
             <div className="flex items-center gap-1.5 text-sm">
                <Star className="w-4 h-4 fill-[#fbbf24] text-[#fbbf24]" />
                <span className="font-bold text-slate-700">{product.rating}</span>
                <span className="text-slate-400">({product.reviews || "18k"})</span>
             </div>
          </div>

          <button onClick={() => addItem({ ...product, quantity: 1 } as any)} className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#f36b2b] hover:bg-[#e05615] text-white font-bold py-4 px-8 rounded-full transition-colors shadow-lg shadow-[#f36b2b]/30">
            Acheter maintenant
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
}
