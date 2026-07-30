"use client";
// src/app/deals/page.tsx — Flash Deals Standalone Page
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Zap, Star, Heart, ShoppingBag, Filter, ArrowUpDown, ChevronRight, Check, RefreshCw, Search
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { RecentlyViewedSection } from "@/components/home/RecentlyViewedSection";
import type { Product } from "@/types";
import toast from "react-hot-toast";

interface FlashDealItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  image: string;
  stock: number;
  maxStock: number;
  countdownEndTime?: string | null;
  active: boolean;
}

export default function FlashDealsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deals, setDeals] = useState<FlashDealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedDiscount, setSelectedDiscount] = useState<number>(0);
  const [sortOption, setSortOption] = useState("discount");
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 58, seconds: 32 });
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    // Redirect volume-discount type to buy-more-save-more page
    const type = searchParams.get("type");
    if (type === "volume-discount") {
      router.replace("/deals/buy-more-save-more");
    }
  }, [searchParams, router]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch("/api/admin/cms/flash-deals");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setDeals(data.data.filter((d: FlashDealItem) => d.active));
        }
      } catch (error) {
        console.error("Error fetching flash deals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 58, seconds: 32 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleWishlist = (id: string, name: string) => {
    setWishlist((prev) => {
      const next = !prev[id];
      if (next) toast.success(`Ajouté aux favoris: ${name}`);
      else toast.error("Retiré des favoris");
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = (item: FlashDealItem) => {
    const fullProduct: Product = {
      id: item.id,
      name: item.name,
      slug: item.id,
      description: item.name,
      price: item.price,
      images: [item.image],
      categoryId: "cat-1",
      category: { id: "cat-1", name: "Flash Deals", slug: "flash-deals" },
      tags: ["flash-sale"],
      sku: item.id,
      stock: item.stock,
      lowStockAt: 2,
      published: true,
      featured: true,
      rating: item.rating,
      reviewCount: item.reviewCount,
      soldCount: item.maxStock - item.stock,
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addItem(fullProduct, 1);
  };

  const formatTwoDigits = (num: number) => String(num).padStart(2, "0");

  let filteredDeals = deals.filter((d) => {
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedDiscount > 0 && d.discountPercent < selectedDiscount) return false;
    return true;
  });

  if (sortOption === "price-asc") filteredDeals.sort((a, b) => a.price - b.price);
  else if (sortOption === "price-desc") filteredDeals.sort((a, b) => b.price - a.price);
  else if (sortOption === "discount") filteredDeals.sort((a, b) => b.discountPercent - a.discountPercent);

  return (
    <div className="min-h-screen bg-background pb-16 space-y-8">
      {/* Breadcrumb */}
      <div className="container-main pt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-bold">Ventes Flash</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="container-main">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-8 md:p-12 shadow-luxury">
          <div className="absolute inset-0 moroccan-pattern-bg opacity-15 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">
                <Zap className="h-4 w-4 fill-white" /> Offres Limitées Ventes Flash
              </span>

              <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-tight">
                Ventes Flash Exclusives
              </h1>
              <p className="text-sm text-white/80 max-w-lg">
                Jusqu&apos;à <span className="font-black text-gold-300">-50% sur le High-Tech, la Mode et le Luxe.</span> Stocks très limités !
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center space-y-2">
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest block">Fin de l&apos;offre dans</span>
              <div className="flex items-center justify-center gap-2">
                <div className="bg-white text-slate-900 font-mono font-black text-xl px-3 py-1.5 rounded-xl shadow-md">
                  {formatTwoDigits(timeLeft.hours)}
                  <span className="block text-[9px] font-sans font-bold text-muted-foreground uppercase">Heures</span>
                </div>
                <span className="text-xl font-bold text-white">:</span>
                <div className="bg-white text-slate-900 font-mono font-black text-xl px-3 py-1.5 rounded-xl shadow-md">
                  {formatTwoDigits(timeLeft.minutes)}
                  <span className="block text-[9px] font-sans font-bold text-muted-foreground uppercase">Minutes</span>
                </div>
                <span className="text-xl font-bold text-white">:</span>
                <div className="bg-white text-slate-900 font-mono font-black text-xl px-3 py-1.5 rounded-xl shadow-md">
                  {formatTwoDigits(timeLeft.seconds)}
                  <span className="block text-[9px] font-sans font-bold text-muted-foreground uppercase">Secondes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="container-main">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input text-xs h-9 pl-10 pr-4 bg-surface border-border rounded-xl w-full sm:w-64"
            />
          </div>

          {/* Discount & Sorting */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={selectedDiscount}
              onChange={(e) => setSelectedDiscount(Number(e.target.value))}
              className="input text-xs h-9 px-3 py-1 bg-surface border-border rounded-xl"
            >
              <option value={0}>Toutes les remises</option>
              <option value={20}>-20% et plus</option>
              <option value={30}>-30% et plus</option>
              <option value={40}>-40% et plus</option>
            </select>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="input text-xs h-9 px-3 py-1 bg-surface border-border rounded-xl"
            >
              <option value="discount">Trier par Réduction</option>
              <option value="price-asc">Prix: Croissant</option>
              <option value="price-desc">Prix: Décroissant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-main">
        {loading ? (
          <div className="bg-card p-12 rounded-3xl border border-border text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-muted-foreground mx-auto animate-spin" />
            <p className="font-bold text-foreground">Chargement des ventes flash...</p>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="bg-card p-12 rounded-3xl border border-border text-center space-y-3">
            <Zap className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="font-bold text-foreground">Aucune vente flash disponible pour le moment.</p>
            <button onClick={() => { setSearchQuery(""); setSelectedDiscount(0); }} className="btn-primary text-xs px-4 py-2">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredDeals.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-4 shadow-sm hover:shadow-luxury transition-all duration-300 hover:-translate-y-1"
              >
                {/* Top Badges */}
                <div className="relative mb-3 flex items-center justify-between">
                  <span className="rounded-xl bg-destructive px-2.5 py-1 text-xs font-black text-white shadow-sm">
                    -{product.discountPercent}%
                  </span>
                  <button
                    onClick={() => toggleWishlist(product.id, product.name)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-surface/80 text-muted-foreground transition-all hover:bg-white hover:text-destructive shadow-sm"
                  >
                    <Heart className={`h-4 w-4 ${wishlist[product.id] ? "fill-destructive text-destructive" : ""}`} />
                  </button>
                </div>

                {/* Image */}
                <div className="relative h-48 w-full mb-3 flex items-center justify-center overflow-hidden rounded-2xl bg-surface/40 p-2">
                  <Image src={product.image} alt={product.name} fill className="object-contain transition-transform duration-500 group-hover:scale-105" />
                </div>

                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Check className="h-3 w-3" /> En stock
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="line-clamp-2 text-xs font-bold text-foreground mb-1.5 leading-snug group-hover:text-brand-700 transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1 mb-2 text-xs text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-muted-foreground font-normal">({product.reviewCount})</span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-display text-xl font-black text-foreground">
                      {product.price.toLocaleString("fr-MA")} DH
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      {product.originalPrice.toLocaleString("fr-MA")} DH
                    </span>
                  </div>

                  {/* Stock Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                      <span>Vendus: {product.maxStock - product.stock}</span>
                      <span className="text-amber-600 font-bold">Plus que {product.stock} restants</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-destructive transition-all duration-500"
                        style={{ width: `${((product.maxStock - product.stock) / product.maxStock) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs py-3 shadow-md transition-all active:scale-95"
                >
                  <ShoppingBag className="h-4 w-4" /> Ajouter au panier
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Viewed */}
      <section className="container-main pt-8">
        <RecentlyViewedSection />
      </section>
    </div>
  );
}
