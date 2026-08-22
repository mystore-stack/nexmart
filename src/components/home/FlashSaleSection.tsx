"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Heart, ShoppingCart, Clock, Tag, Shield, Truck, Gift, Lock } from "lucide-react";
import { deduplicateProducts } from "@/lib/product-deduplication";
import { useCartStore } from "@/store/cart";

export function FlashSaleSection({ products = [], config = {} }: { products?: any[], config?: any }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeTab, setActiveTab] = useState("Tout");
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const targetDate = config.endDate ? new Date(config.endDate).getTime() : new Date().getTime() + 5 * 60 * 60 * 1000 + 58 * 60 * 1000;
    
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

  const dedupedProducts = deduplicateProducts(products).slice(0, 6);
  const displayProducts = dedupedProducts.length ? dedupedProducts : [
    { id: "f-1", name: "Apple AirPods Pro 2", category: "Audio", price: 18900, oldPrice: 24900, rating: 4.8, discount: 24, images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80"] },
    { id: "f-2", name: "Nike Air Max 270", category: "Accessoires", price: 119900, oldPrice: 159900, rating: 4.7, discount: 25, images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"] },
    { id: "f-3", name: "Fossil Gen 6 Smartwatch", category: "Électronique", price: 129900, oldPrice: 169900, rating: 4.6, discount: 23, images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"] },
    { id: "f-4", name: "Sony WH-1000XM5", category: "Audio", price: 279900, oldPrice: 399900, rating: 4.9, discount: 30, images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80"] },
    { id: "f-5", name: "Philips Blender HR2291", category: "Électronique", price: 54900, oldPrice: 69900, rating: 4.5, discount: 21, images: ["https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&q=80"] },
    { id: "f-6", name: "MacBook Air M2", category: "Informatique", price: 1249900, oldPrice: 1529900, rating: 4.9, discount: 18, images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80"] },
  ];

  const categories = ["Tout", "Électronique", "Accessoires", "Audio", "Informatique"];
  const filteredProducts = activeTab === "Tout" ? displayProducts : displayProducts.filter(p => p.category === activeTab);

  // Bottom bar calc mockup
  const totalPriceRaw = displayProducts.reduce((sum, current) => sum + (current.oldPrice ?? current.price ?? 0), 0);
  const finalPrice = displayProducts.reduce((sum, current) => sum + (current.price ?? 0), 0);
  const discountRate = 0.3; 

  const features = config.features || [
    { icon: "Tag", title: "Prix exclusifs", desc: "Jusqu'à -30% sur vos produits préférés" },
    { icon: "Shield", title: "Garantie 1 an", desc: "Tous nos produits sont garantis" },
    { icon: "Truck", title: "Livraison rapide", desc: "Disponible partout au Maroc" },
  ];

  const renderIcon = (name: string) => {
    switch (name) {
      case "Tag": return <Tag className="w-5 h-5" />;
      case "Shield": return <Shield className="w-5 h-5" />;
      case "Truck": return <Truck className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  return (
    <section className="my-8 md:my-16 container-main max-w-[1400px]">
      
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-[320px] shrink-0 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5f48e6] bg-[#f2effd] px-3 py-1.5 rounded-full w-fit mb-6">
            <Clock className="w-3.5 h-3.5" />
            OFFRES LIMITÉES
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">
            Les meilleures <br/>
            Offres, rien que <br/>
            <span className="text-[#5f48e6]">pour vous</span>
          </h2>
          <p className="text-sm text-slate-500 mb-8">
            Des prix incroyables sur une sélection de produits incontournables.
          </p>

          <div className="mb-8">
            <p className="text-xs font-bold text-slate-700 mb-3">Se termine dans</p>
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center">
                <div className="bg-[#f2effd] text-[#5f48e6] w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold">
                  {formatTime(timeLeft.hours + (timeLeft.days * 24))}
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1">HRS</span>
              </div>
              <span className="text-slate-300 text-xl font-bold mt-2">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-[#f2effd] text-[#5f48e6] w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold">
                  {formatTime(timeLeft.minutes)}
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1">MIN</span>
              </div>
              <span className="text-slate-300 text-xl font-bold mt-2">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-[#f2effd] text-[#5f48e6] w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold">
                  {formatTime(timeLeft.seconds)}
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1">SEC</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {features.map((feat: any, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f8f9fa] border border-slate-100 flex items-center justify-center text-[#2cb174] shrink-0">
                  {renderIcon(feat.icon)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{feat.title}</h4>
                  <p className="text-xs text-slate-500 leading-tight mt-0.5">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8 relative h-40 overflow-hidden rounded-2xl bg-gradient-to-tr from-[#5f48e6]/10 to-transparent">
             <div className="absolute -bottom-8 -right-8 w-40 h-40 opacity-80 mix-blend-multiply">
               <Image src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=300&q=80" alt="Shopping Bag" fill className="object-cover rounded-full" />
             </div>
             <div className="absolute bottom-4 left-4 text-[#5f48e6] font-black text-2xl">%</div>
             <div className="absolute top-4 right-8 text-[#5f48e6]/50">✨</div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${
                  activeTab === cat 
                    ? "bg-[#5f48e6] text-white border-[#5f48e6]" 
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6 mb-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow">
                {product.discount && (
                  <div className="absolute top-4 left-4 z-10 bg-[#ff4d4f] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    -{product.discount}%
                  </div>
                )}
                <button className="absolute top-4 right-4 z-10 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-[#ff4d4f] hover:border-[#ff4d4f] transition-colors shadow-sm">
                  <Heart className="w-4 h-4" />
                </button>
                
                <div className="relative w-full aspect-square mb-4 bg-slate-50 rounded-2xl overflow-hidden">
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                <h3 className="font-bold text-slate-900 text-[15px] mb-1 line-clamp-1">{product.name}</h3>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-black text-slate-900 text-lg">{(product.price / 100).toLocaleString("fr-MA")} DH</span>
                  {product.oldPrice && (
                    <span className="text-xs text-slate-400 line-through">{(product.oldPrice / 100).toLocaleString("fr-MA")} DH</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-semibold text-yellow-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{product.rating}</span>
                    <span className="text-slate-400 font-normal">(18k)</span>
                  </div>
                  
                  <button onClick={() => addItem({ ...product, quantity: 1 } as any)} className="w-8 h-8 rounded-full border border-[#2cb174] flex items-center justify-center text-[#2cb174] hover:bg-[#2cb174] hover:text-white transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Sticky Bar */}
          <div className="mt-auto bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-lg flex flex-col xl:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-6 border-b xl:border-b-0 xl:border-r border-slate-200 pb-6 xl:pb-0 xl:pr-6 w-full xl:w-auto">
              <div className="w-16 h-16 rounded-full bg-[#eefaf3] flex flex-col items-center justify-center text-[#1f8755]">
                <span className="text-[9px] font-bold uppercase tracking-wider">ÉCONOMIE</span>
                <span className="text-xl font-black">-{discountRate * 100}%</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-0.5">Total estimé</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-slate-900 text-2xl">{(finalPrice / 100).toLocaleString("fr-MA")} DH</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  au lieu de <span className="line-through">{(totalPriceRaw / 100).toLocaleString("fr-MA")} DH</span>
                </p>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 w-full">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center relative shrink-0">
                <Gift className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-[#1f8755] text-sm">Cadeau offert</h4>
                  <span>🎁</span>
                </div>
                <p className="font-bold text-slate-900 text-xs">{config.giftTitle || "Kit de nettoyage 7-en-1"}</p>
                <p className="text-[10px] text-slate-500 max-w-[200px] leading-tight mt-0.5">
                  {config.giftDescription || "Pour garder tous vos appareils propres et comme neufs au quotidien."}
                </p>
              </div>
              <div className="ml-auto w-12 h-12 relative rounded-lg border border-slate-200 overflow-hidden shrink-0 hidden sm:block">
                <Image src={config.giftImage || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=100"} alt="Gift" fill className="object-cover" />
              </div>
            </div>

            <div className="w-full xl:w-auto flex flex-col items-center gap-2">
              <button className="w-full xl:w-[220px] bg-[#5f48e6] hover:bg-[#4a35c2] text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#5f48e6]/20">
                <ShoppingCart className="w-4 h-4" />
                Voir mon panier
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <Lock className="w-3 h-3" />
                Paiement 100% sécurisé
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
