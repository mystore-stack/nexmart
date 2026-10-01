"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Zap, 
  Heart, 
  ShoppingCart, 
  Star, 
  ChevronRight,
  ChevronLeft,
  Tag, 
  Shield, 
  Truck, 
  Package, 
  Flame, 
  Hourglass,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { deduplicateProducts } from "@/lib/product-deduplication";
import toast from "react-hot-toast";

// 100% Exact reference data matching the user's uploaded image
const DEFAULT_FLASH_PRODUCTS = [
  {
    id: "flash-1",
    name: "Xiaomi Redmi Note 13 8GB + 256GB",
    discount: 23,
    stockLeft: 12,
    rating: 4.6,
    reviewsCount: 128,
    price: 2199,
    oldPrice: 2899,
    percentSold: 82,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
    slug: "xiaomi-redmi-note-13",
  },
  {
    id: "flash-2",
    name: "JBL Tune 510BT Casque Sans Fil",
    discount: 18,
    stockLeft: 7,
    rating: 4.5,
    reviewsCount: 96,
    price: 399,
    oldPrice: 490,
    percentSold: 67,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    slug: "jbl-tune-510bt-casque",
  },
  {
    id: "flash-3",
    name: "Casio G-Shock GA-2100-1A1ER",
    discount: 31,
    stockLeft: 5,
    rating: 4.7,
    reviewsCount: 72,
    price: 1299,
    oldPrice: 1899,
    percentSold: 54,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    slug: "casio-gshock-ga2100",
  },
];

interface FlashSaleSectionProps {
  products?: any[];
  config?: any;
}

export function FlashSaleSection({ products = [], config = {} }: FlashSaleSectionProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 59, seconds: 41 });
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const addItem = useCartStore((state) => state.addItem);

  const scrollProducts = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const screenWidth = window.innerWidth;
    const amount = direction === "left" ? -(screenWidth < 640 ? screenWidth * 0.5 : 320) : (screenWidth < 640 ? screenWidth * 0.5 : 320);
    container.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 41 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTwoDigits = (v: number) => String(v).padStart(2, "0");

  const toggleWishlist = (id: string, name: string) => {
    setWishlist((prev) => {
      const nextState = !prev[id];
      if (nextState) {
        toast.success(`Ajouté aux favoris: ${name}`);
      } else {
        toast.error(`Retiré des favoris`);
      }
      return { ...prev, [id]: nextState };
    });
  };

  const handleAddToCart = (item: any) => {
    const fullProduct: any = {
      id: item.id || `product-${Math.random()}`,
      name: item.name,
      slug: item.slug || "flash-sale-product",
      price: item.price * 100, // standard price handling if needed
      comparePrice: item.oldPrice ? item.oldPrice * 100 : undefined,
      images: [item.image || item.images?.[0] || "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600"],
      stock: item.stockLeft || 10,
      rating: item.rating || 4.5,
    };
    addItem(fullProduct, 1);
    toast.success(`${item.name} ajouté au panier!`);
  };

  // Prepare products to render (merge dynamic DB products or fallback to exact reference 3 products)
  const dynamicProducts = deduplicateProducts(products);
  const maxProducts = config.maxProducts || 8;
  const displayProducts = dynamicProducts.length > 0 
    ? dynamicProducts.slice(0, maxProducts).map((p: any, idx: number) => ({
        id: p.id || `p-${idx}`,
        name: p.name,
        discount: p.discount || Math.round((((p.oldPrice || p.comparePrice || p.price * 1.3) - p.price) / (p.oldPrice || p.comparePrice || p.price * 1.3)) * 100) || 20,
        stockLeft: p.stock || Math.floor(Math.random() * 10) + 3,
        rating: p.rating || 4.6,
        reviewsCount: p.reviewCount || p.reviewsCount || 85,
        price: p.price > 10000 ? Math.round(p.price / 100) : p.price,
        oldPrice: (p.oldPrice || p.comparePrice) ? ((p.oldPrice || p.comparePrice) > 10000 ? Math.round((p.oldPrice || p.comparePrice) / 100) : (p.oldPrice || p.comparePrice)) : Math.round(p.price * 1.3),
        percentSold: Math.min(88, Math.max(45, Math.round(((p.soldCount || 15) / ((p.soldCount || 15) + (p.stock || 5))) * 100))),
        image: (p.images && p.images[0]) || DEFAULT_FLASH_PRODUCTS[idx % 3].image,
        slug: p.slug || DEFAULT_FLASH_PRODUCTS[idx % 3].slug,
      }))
    : DEFAULT_FLASH_PRODUCTS;

  return (
    <section className="w-full bg-[#0B0E14] text-white py-6 px-3 sm:px-6 md:py-10 rounded-3xl border border-[#1E293B] shadow-2xl my-6 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. Header: FLASH SALE & Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-5">
          {/* Left Title */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse">
                <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                FLASH SALE
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              Offres limitées, ne les manquez pas !
            </p>
          </div>

          {/* Right Timer */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-medium">Se termine dans</span>
            <div className="flex items-center gap-1.5">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="bg-[#E53E3E] text-white font-bold text-base sm:text-lg w-9 sm:w-10 h-9 sm:h-10 rounded-xl flex items-center justify-center shadow-md">
                  {formatTwoDigits(timeLeft.hours)}
                </div>
                <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">H</span>
              </div>
              <span className="text-[#E53E3E] font-bold text-lg mb-4">:</span>
              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="bg-[#E53E3E] text-white font-bold text-base sm:text-lg w-9 sm:w-10 h-9 sm:h-10 rounded-xl flex items-center justify-center shadow-md">
                  {formatTwoDigits(timeLeft.minutes)}
                </div>
                <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">MIN</span>
              </div>
              <span className="text-[#E53E3E] font-bold text-lg mb-4">:</span>
              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="bg-[#E53E3E] text-white font-bold text-base sm:text-lg w-9 sm:w-10 h-9 sm:h-10 rounded-xl flex items-center justify-center shadow-md">
                  {formatTwoDigits(timeLeft.seconds)}
                </div>
                <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">SEC</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Sub-header Filter Pills & "Voir tout >" */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <button className="bg-[#182232] border border-[#273549] text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 hover:border-amber-500/50 transition-colors whitespace-nowrap">
              <Package className="w-4 h-4 text-amber-400" />
              Stock limité
            </button>
            <button className="bg-[#182232] border border-[#273549] text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 hover:border-amber-500/50 transition-colors whitespace-nowrap">
              <Flame className="w-4 h-4 text-red-500" />
              Meilleures offres
            </button>
          </div>

          <Link 
            href="/deals" 
            className="text-[#10B981] hover:text-[#059669] font-bold text-xs sm:text-sm flex items-center gap-1 shrink-0 transition-colors"
          >
            Voir tout
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3. Product Cards — horizontal scroll */}
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollProducts("left")}
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 -translate-x-1 rounded-full border border-[#334461] bg-[#151D2A]/95 p-2 text-white shadow-lg transition-colors hover:border-amber-500/50 md:flex"
            aria-label="Produits précédents"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollProducts("right")}
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1 rounded-full border border-[#334461] bg-[#151D2A]/95 p-2 text-white shadow-lg transition-colors hover:border-amber-500/50 md:flex"
            aria-label="Produits suivants"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory -mx-1 px-1"
          >
          {displayProducts.map((item) => (
            <div
              key={item.id}
              className="w-[48vw] sm:w-[260px] shrink-0 snap-start bg-[#151D2A] border border-[#222E42] rounded-3xl p-3 sm:p-5 flex flex-col justify-between relative shadow-xl hover:border-[#334461] transition-all group sm:w-[280px]"
            >
              {/* Top Row: Discount & Heart Icon */}
              <div className="flex items-center justify-between z-10">
                <span className="bg-[#FF4D4D] text-white text-xs font-black px-2.5 py-1 rounded-lg tracking-wide shadow-md">
                  -{item.discount}%
                </span>
                <button 
                  onClick={() => toggleWishlist(item.id, item.name)}
                  className="w-8 h-8 rounded-full bg-[#1C2638] border border-[#2A3952] flex items-center justify-center text-slate-300 hover:text-[#FF4D4D] hover:border-[#FF4D4D] transition-colors"
                  aria-label="Ajouter aux favoris"
                >
                  <Heart className={`w-4 h-4 ${wishlist[item.id] ? "fill-[#FF4D4D] text-[#FF4D4D]" : ""}`} />
                </button>
              </div>

              {/* Product Image Area */}
              <div className="relative w-full h-36 sm:h-44 bg-[#0F1622] rounded-2xl flex items-center justify-center p-3 my-3 overflow-hidden group-hover:bg-[#111A29] transition-colors">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 48vw, 280px"
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              </div>

              {/* Stock Remaining Pill */}
              <div className="bg-[#1D293D] border border-[#2C3E5A] text-slate-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center justify-center gap-1.5 w-fit mx-auto my-2">
                <Hourglass className="w-3.5 h-3.5 text-amber-400" />
                <span>Plus que {item.stockLeft}</span>
              </div>

              {/* Product Title */}
              <h3 className="font-bold text-white text-xs sm:text-sm leading-snug line-clamp-2 text-center my-1 min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">
                {item.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center justify-center gap-1 text-xs my-1">
                <Star className="w-4 h-4 text-[#FFB800] fill-[#FFB800]" />
                <span className="font-bold text-white">{item.rating}</span>
                <span className="text-slate-400">({item.reviewsCount})</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline justify-center gap-2 my-2">
                <span className="text-[#FF4D4D] font-black text-xl sm:text-2xl">
                  {item.price.toLocaleString("fr-MA")} DH
                </span>
                <span className="text-slate-500 line-through text-xs sm:text-sm font-normal">
                  {item.oldPrice.toLocaleString("fr-MA")} DH
                </span>
              </div>

              {/* CTA Button: "Ajouter 🛒" */}
              <button
                onClick={() => handleAddToCart(item)}
                className="w-full bg-gradient-to-r from-[#FF4D4D] to-[#E03838] hover:from-[#E03838] hover:to-[#C82323] text-white font-extrabold text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all cursor-pointer my-2"
              >
                <span className="text-xs sm:text-sm">Ajouter</span>
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white" />
              </button>

              {/* Progress Bar & Sold percentage */}
              <div className="mt-2 space-y-1.5">
                <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#FF4D4D] to-[#FF7878] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${item.percentSold}%` }}
                  />
                </div>
                <p className="text-[#FF4D4D] font-bold text-xs text-center">
                  {item.percentSold}% déjà pris
                </p>
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* 4. Bottom Feature Badges (3 items) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#1E293B]">
          {/* Badge 1: Prix imbattables */}
          <div className="bg-[#131A26] border border-[#222E42] p-3.5 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#FF4D4D] shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Prix imbattables</h4>
              <p className="text-xs text-slate-400 font-medium">Jusqu'à -70%</p>
            </div>
          </div>

          {/* Badge 2: Produits officiels */}
          <div className="bg-[#131A26] border border-[#222E42] p-3.5 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#10B981] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Produits officiels</h4>
              <p className="text-xs text-slate-400 font-medium">Garantie 100%</p>
            </div>
          </div>

          {/* Badge 3: Livraison rapide */}
          <div className="bg-[#131A26] border border-[#222E42] p-3.5 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Livraison rapide</h4>
              <p className="text-xs text-slate-400 font-medium">Partout au Maroc</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
