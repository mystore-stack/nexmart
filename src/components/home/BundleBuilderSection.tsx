"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { 
  Check, 
  Trash2, 
  Plus, 
  ArrowRight, 
  Tag, 
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
  Star,
  Sparkles
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { deduplicateProducts } from "@/lib/product-deduplication";
import toast from "react-hot-toast";

// Reference exact products matching the reference photo
const DEFAULT_BUNDLE_ITEMS = [
  {
    id: "bundle-iphone15",
    name: "iPhone 15 Pro",
    price: 8999,
    oldPrice: 10199,
    discount: "-12%",
    rating: 4.8,
    reviews: "1.2k",
    image: "/images/bundle_iphone15.jpg",
    slug: "iphone-15-pro",
  },
  {
    id: "bundle-bose",
    name: "Casque Bose QuietComfort",
    price: 2990,
    oldPrice: 3499,
    discount: "-15%",
    rating: 4.7,
    reviews: "856",
    image: "/images/bundle_bose.jpg",
    slug: "casque-bose-quietcomfort",
  },
  {
    id: "bundle-watch",
    name: "Apple Watch Series 9",
    price: 4499,
    oldPrice: 4999,
    discount: "-10%",
    rating: 4.6,
    reviews: "642",
    image: "/images/bundle_watch.jpg",
    slug: "apple-watch-series-9",
  },
  {
    id: "bundle-airpods",
    name: "AirPods Pro (2ᵉ génération)",
    price: 2599,
    oldPrice: 2999,
    discount: "-13%",
    rating: 4.8,
    reviews: "1.1k",
    image: "/images/bundle_airpods.jpg",
    slug: "airpods-pro-2",
  },
  {
    id: "bundle-jbl",
    name: "JBL Flip 6",
    price: 1299,
    oldPrice: 1599,
    discount: "-18%",
    rating: 4.7,
    reviews: "934",
    image: "/images/bundle_jbl.jpg",
    slug: "jbl-flip-6",
  }
];

interface BundleBuilderSectionProps {
  products?: any[];
  config?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    maxDiscountPercent?: number;
  };
}

export function BundleBuilderSection({ products = [], config = {} }: BundleBuilderSectionProps) {
  const addItem = useCartStore((state) => state.addItem);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Normalize incoming products or use exact reference products
  const dedupedProducts = useMemo(() => {
    const list = deduplicateProducts(products);
    if (list.length > 0) {
      return list.map((p: any, idx: number) => {
        const fallback = DEFAULT_BUNDLE_ITEMS[idx % DEFAULT_BUNDLE_ITEMS.length];
        const price = typeof p.price === "number" ? p.price : parseFloat(p.price) || fallback.price;
        const oldPrice = p.oldPrice || p.comparePrice ? (typeof (p.oldPrice || p.comparePrice) === "number" ? (p.oldPrice || p.comparePrice) : parseFloat(p.oldPrice || p.comparePrice)) : Math.round(price * 1.2);
        const discountVal = Math.round(((oldPrice - price) / oldPrice) * 100);
        return {
          id: p.id || `bundle-item-${idx}`,
          name: p.name || fallback.name,
          price: price,
          oldPrice: oldPrice,
          discount: discountVal > 0 ? `-${discountVal}%` : fallback.discount,
          rating: p.rating || fallback.rating,
          reviews: p.reviewsCount || fallback.reviews,
          image: p.images?.[0] || p.image || fallback.image,
          slug: p.slug || fallback.slug,
        };
      });
    }
    return DEFAULT_BUNDLE_ITEMS;
  }, [products]);

  // Selected products state (initially items 0, 1, and 3 selected to match photo layout)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => [
    DEFAULT_BUNDLE_ITEMS[0].id,
    DEFAULT_BUNDLE_ITEMS[1].id,
    DEFAULT_BUNDLE_ITEMS[3].id,
  ]);

  // Wishlist favorite state toggle
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedProducts = useMemo(() => {
    return dedupedProducts.filter(p => selectedIds.includes(p.id));
  }, [dedupedProducts, selectedIds]);

  const toggleSelectProduct = (product: any) => {
    if (selectedIds.includes(product.id)) {
      setSelectedIds(prev => prev.filter(id => id !== product.id));
      toast.success(`${product.name} retiré de votre sélection`, { icon: "🗑️" });
    } else {
      if (selectedIds.length >= 4) {
        toast.error("Maximum 4 produits par sélection !");
        return;
      }
      setSelectedIds(prev => [...prev, product.id]);
      toast.success(`${product.name} ajouté à votre sélection !`, { icon: "✨" });
    }
  };

  const handleRemoveItem = (id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id));
    toast.success("Produit retiré", { icon: "🗑️" });
  };

  // Dynamic discount calculation based on selected items count:
  // 1 item -> 5%, 2 items -> 10%, 3 items -> 15%, 4+ items -> 20%
  const discountPercent = useMemo(() => {
    const count = selectedProducts.length;
    if (count === 0) return 0;
    if (count === 1) return 5;
    if (count === 2) return 10;
    if (count === 3) return 15;
    return 20;
  }, [selectedProducts.length]);

  const rawTotal = useMemo(() => {
    return selectedProducts.reduce((sum, item) => sum + item.price, 0);
  }, [selectedProducts]);

  const finalTotal = useMemo(() => {
    return Math.round(rawTotal * (1 - discountPercent / 100));
  }, [rawTotal, discountPercent]);

  // Format price helper e.g. "8 999 DH"
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " DH";
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleAddBundleToCart = () => {
    if (selectedProducts.length === 0) {
      toast.error("Veuillez choisir au moins 1 produit pour votre sélection.");
      return;
    }

    selectedProducts.forEach((product) => {
      addItem({
        id: product.id,
        name: product.name,
        price: Math.round(product.price * (1 - discountPercent / 100)),
        comparePrice: product.oldPrice,
        images: [product.image],
        slug: product.slug,
        stock: 10,
        published: true,
      } as any, 1);
    });

    toast.success(`Pack de ${selectedProducts.length} produits ajouté au panier (-${discountPercent}% de réduction) ! 🎉`, {
      duration: 4000,
    });
  };

  return (
    <div className="my-8 md:my-14 font-sans select-none">
      {/* Canvas Wrapper */}
      <div className="mx-auto max-w-7xl px-2 sm:px-4">
        {/* Main Card Container */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#f2f7f4] border border-slate-200/80 p-4 sm:p-7 md:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          
          {/* Decorative Corner Foliage Background Accents */}
          <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

          {/* Tropical Leaf Accent Graphic (Top Right) */}
          <div className="pointer-events-none absolute top-0 right-0 z-0 opacity-20 md:opacity-30">
            <svg width="220" height="220" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M180 10C120 20 60 70 40 140C20 210 100 180 130 150C160 120 190 60 180 10Z" fill="#00875a"/>
              <path d="M200 60C140 70 90 110 70 180C140 170 180 120 200 60Z" fill="#00704c"/>
            </svg>
          </div>

          {/* Inner Content Box */}
          <div className="relative z-10 space-y-6 sm:space-y-8">

            {/* HERO TOP BANNER SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Column Text & Floating Badge */}
              <div className="lg:col-span-7 space-y-4">
                {/* Brand Badge */}
                <div className="inline-flex items-center gap-2 bg-[#e6f4ea] px-3 py-1 rounded-full border border-[#00875a]/20">
                  <div className="w-5 h-5 rounded-md bg-[#00875a] flex items-center justify-center text-white font-black text-[10px]">
                    N
                  </div>
                  <span className="text-xs font-bold text-[#00875a] uppercase tracking-wider">
                    NexMart
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00875a]" />
                  <span className="text-xs font-semibold text-[#00875a]">
                    OFFRE SPÉCIALE
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Composez votre{" "}
                  <span className="text-[#00875a] relative inline-block">
                    sélection
                    <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#00875a]/30" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path d="M0 15 Q 50 0 100 15" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                    </svg>
                  </span>
                </h1>

                {/* Description */}
                <p className="text-slate-600 text-sm sm:text-base max-w-lg leading-relaxed font-normal">
                  {config.subtitle || "Choisissez 2 à 4 produits et profitez automatiquement d'une remise exclusive sur votre panier."}
                </p>

                {/* Rotated Discount Stamp & Arrow */}
                <div className="pt-2 flex items-center gap-4">
                  <div className="relative inline-block rotate-[-4deg] hover:rotate-0 transition-transform duration-300">
                    <div className="bg-[#00704c] text-white px-5 py-2.5 rounded-2xl shadow-lg border border-emerald-400/30 flex flex-col items-center">
                      <span className="text-[11px] font-medium opacity-90 uppercase tracking-wide">Jusqu'à</span>
                      <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-emerald-30">
                        -20%
                      </span>
                      <span className="text-[10px] font-semibold opacity-90 mt-0.5">sur votre sélection</span>
                    </div>
                    {/* Green Accent Line Ticks */}
                    <div className="absolute -top-3 -right-2 text-[#00875a] font-bold text-xs">✨</div>
                    <div className="absolute -bottom-2 -left-2 text-[#00875a] font-bold text-xs">⚡</div>
                  </div>

                  {/* Curved Arrow SVG */}
                  <div className="hidden sm:block text-slate-700 pt-3">
                    <svg width="48" height="32" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 10 C 25 5, 45 15, 50 30" stroke="#00704c" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3"/>
                      <path d="M42 26 L 50 30 L 48 20" stroke="#00704c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right Column Graphic / Product Composition Hero */}
              <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
                
                {/* Handwritten Tag Top Right */}
                <div className="self-end mb-1 text-right">
                  <span className="inline-block text-xs sm:text-sm font-bold text-emerald-800 tracking-wide font-mono rotate-[-2deg] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200/60">
                    Plus vous choisissez, plus vous économisez ! ⤵
                  </span>
                </div>

                {/* Hero Showcase Image Box */}
                <div className="relative w-full h-52 sm:h-64 md:h-72 rounded-3xl overflow-hidden bg-gradient-to-b from-[#d5ede1] to-[#e4f4ec] border border-emerald-200/60 shadow-md group">
                  <Image
                    src="/images/bundle_hero_products.jpg"
                    alt="Sélection de produits high-tech NexMart"
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  {/* Glassmorphism Overlay Ribbon */}
                  <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur-md rounded-2xl p-2.5 px-4 flex items-center justify-between border border-white/60 shadow-xs">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#00875a]" /> Bundle High-Tech Luxe
                    </span>
                    <span className="text-[11px] font-bold text-[#00875a] bg-[#e6f4ea] px-2.5 py-0.5 rounded-full">
                      Remise immédiate
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE SECTION: PRODUCTS CAROUSEL + SELECTION PANEL */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-xs">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Left Side: Product Cards Carousel (8 Cols) */}
                <div className="lg:col-span-8 relative">
                  
                  {/* Carousel Header & Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Produits éligibles au pack
                      </h3>
                      <span className="text-xs text-slate-400 font-normal">
                        ({dedupedProducts.length} articles)
                      </span>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleScroll("left")}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-[#00875a] text-slate-600 flex items-center justify-center transition-colors border-0 cursor-pointer"
                        aria-label="Produits précédents"
                        type="button"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleScroll("right")}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-[#00875a] text-slate-600 flex items-center justify-center transition-colors border-0 cursor-pointer"
                        aria-label="Produits suivants"
                        type="button"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Scroll Track */}
                  <div
                    ref={scrollRef}
                    className="flex items-stretch gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {dedupedProducts.map((product) => {
                      const isSelected = selectedIds.includes(product.id);
                      const isFav = !!favorites[product.id];

                      return (
                        <div
                          key={product.id}
                          className={`w-[170px] sm:w-[195px] shrink-0 bg-white rounded-2xl p-3 border transition-all duration-200 flex flex-col justify-between group relative ${
                            isSelected
                              ? "border-[#00875a] ring-2 ring-[#00875a]/20 shadow-md"
                              : "border-slate-100 hover:border-slate-300 hover:shadow-sm"
                          }`}
                        >
                          {/* Discount Tag Top Left */}
                          <div className="absolute top-2.5 left-2.5 z-10 bg-[#00704c] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                            {product.discount}
                          </div>

                          {/* Heart Wishlist Icon Top Right */}
                          <button
                            onClick={(e) => toggleFavorite(product.id, e)}
                            className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shadow-xs border-0 cursor-pointer"
                            type="button"
                            title="Ajouter aux favoris"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                          </button>

                          {/* Image Box */}
                          <div className="relative w-full h-32 sm:h-36 bg-[#f7faf8] rounded-xl overflow-hidden p-2 flex items-center justify-center mb-2.5 border border-slate-50">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="200px"
                              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Content */}
                          <div className="space-y-1 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 leading-snug">
                                {product.name}
                              </h4>

                              {/* Rating */}
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="font-semibold text-slate-700">{product.rating}</span>
                                <span>({product.reviews})</span>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="pt-2">
                              <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="text-xs sm:text-sm font-extrabold text-[#00875a]">
                                  {formatPrice(product.price)}
                                </span>
                                {product.oldPrice && (
                                  <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                                    {formatPrice(product.oldPrice)}
                                  </span>
                                )}
                              </div>

                              {/* Action Add/Remove Button */}
                              <button
                                onClick={() => toggleSelectProduct(product)}
                                className={`w-full mt-2.5 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                                  isSelected
                                    ? "bg-[#e6f4ea] text-[#00875a] border border-[#00875a]/30 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                    : "bg-[#00875a] hover:bg-[#00704c] text-white shadow-xs"
                                }`}
                                type="button"
                              >
                                {isSelected ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>Ajouté</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>+ Ajouter</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Selection Drawer ("Votre sélection") (4 Cols) */}
                <div className="lg:col-span-4 bg-[#f0f9f4] border border-[#00875a]/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full min-h-[340px] shadow-xs">
                  
                  <div>
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#00875a]/15">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#00875a] text-white flex items-center justify-center shadow-xs">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          Votre sélection
                        </h3>
                      </div>

                      <span className="text-xs font-bold text-[#00704c] bg-[#d1f2e2] px-2.5 py-1 rounded-full">
                        {selectedProducts.length} {selectedProducts.length > 1 ? "produits" : "produit"}
                      </span>
                    </div>

                    {/* Selected List */}
                    <div className="py-3 space-y-2.5 max-h-52 overflow-y-auto">
                      {selectedProducts.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                          <p className="text-xs font-semibold">Aucun produit sélectionné</p>
                          <p className="text-[11px] mt-1">Cliquez sur "+ Ajouter" pour composer votre pack.</p>
                        </div>
                      ) : (
                        selectedProducts.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white rounded-xl p-2.5 border border-slate-100 flex items-center justify-between gap-2 shadow-xs group"
                          >
                            <div className="relative w-10 h-10 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="40px"
                                className="object-contain p-1"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate">
                                {item.name}
                              </h4>
                              <p className="text-xs font-extrabold text-[#00875a]">
                                {formatPrice(item.price)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="w-6 h-6 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors border-0 bg-transparent cursor-pointer"
                              title="Retirer de la sélection"
                              type="button"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Summary Footer & CTA */}
                  <div className="pt-3 border-t border-[#00875a]/15 space-y-3">
                    
                    {/* Discount Box Callout */}
                    <div className="bg-white rounded-xl p-3 border border-[#00875a]/20 flex items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#e6f4ea] text-[#00875a] flex items-center justify-center">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-500 font-medium">Économisez jusqu'à</p>
                          <p className="text-xs font-bold text-[#00875a]">Pack personnalisé</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-[#00875a] tracking-tight">
                          -{discountPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    {selectedProducts.length > 0 && (
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-slate-500">Sous-total après remise:</span>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 text-sm">{formatPrice(finalTotal)}</span>
                          {rawTotal > finalTotal && (
                            <span className="text-[11px] text-slate-400 line-through block">{formatPrice(rawTotal)}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={handleAddBundleToCart}
                      className="w-full bg-[#00875a] hover:bg-[#00704c] active:scale-[0.98] text-white text-xs sm:text-sm font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                      type="button"
                    >
                      <span>{config.ctaText || "Créer ma sélection"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                  </div>

                </div>

              </div>

            </div>

            {/* PROGRESS TIER BAR */}
            <div className="bg-[#e6f4ea]/60 border border-[#00875a]/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Left Label */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-[#00875a] flex items-center justify-center shadow-xs shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                    Plus vous ajoutez de produits, plus vous économisez !
                  </p>
                </div>
              </div>

              {/* Tiers Steps */}
              <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto justify-between md:justify-end">
                
                {/* Tier 1: 2 products */}
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                    selectedProducts.length >= 2 ? "bg-[#00875a] text-white" : "bg-white text-slate-400 border border-slate-200"
                  }`}>
                    {selectedProducts.length >= 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "2"}
                  </div>
                  <span className={`text-xs font-bold ${selectedProducts.length >= 2 ? "text-[#00875a]" : "text-slate-400"}`}>
                    2 produits <span className="text-xs font-black">-10%</span>
                  </span>
                </div>

                <div className="w-8 sm:w-12 h-0.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full bg-[#00875a] transition-all duration-300 ${selectedProducts.length >= 3 ? "w-full" : "w-0"}`} />
                </div>

                {/* Tier 2: 3 products */}
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                    selectedProducts.length >= 3 ? "bg-[#00875a] text-white" : "bg-white text-slate-400 border border-slate-200"
                  }`}>
                    {selectedProducts.length >= 3 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "3"}
                  </div>
                  <span className={`text-xs font-bold ${selectedProducts.length >= 3 ? "text-[#00875a]" : "text-slate-400"}`}>
                    3 produits <span className="text-xs font-black">-15%</span>
                  </span>
                </div>

                <div className="w-8 sm:w-12 h-0.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full bg-[#00875a] transition-all duration-300 ${selectedProducts.length >= 4 ? "w-full" : "w-0"}`} />
                </div>

                {/* Tier 3: 4 products */}
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                    selectedProducts.length >= 4 ? "bg-[#00875a] text-white" : "bg-white text-slate-400 border border-slate-200"
                  }`}>
                    {selectedProducts.length >= 4 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "4"}
                  </div>
                  <span className={`text-xs font-bold ${selectedProducts.length >= 4 ? "text-[#00875a]" : "text-slate-400"}`}>
                    4 produits <span className="text-xs font-black">-20%</span>
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
