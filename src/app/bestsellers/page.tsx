"use client";
// src/app/bestsellers/page.tsx — Best Sellers Standalone Page
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  TrendingUp, Star, Heart, ShoppingBag, ChevronRight, Award, Flame, Check, Search, RefreshCw
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import toast from "react-hot-toast";

interface BestsellerProduct {
  id: string;
  name: string;
  price: number;
  rank: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  image: string;
  active: boolean;
}

export default function BestSellersPage() {
  const [bestsellers, setBestsellers] = useState<BestsellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly" | "favorites">("weekly");
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const res = await fetch("/api/admin/cms/bestsellers");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setBestsellers(data.data.filter((d: BestsellerProduct) => d.active));
        }
      } catch (error) {
        console.error("Error fetching bestsellers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestsellers();
  }, []);

  const toggleWishlist = (id: string, name: string) => {
    setWishlist((prev) => {
      const next = !prev[id];
      if (next) toast.success(`Ajouté aux favoris: ${name}`);
      else toast.error("Retiré des favoris");
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = (product: BestsellerProduct) => {
    const fullProduct: Product = {
      id: product.id,
      name: product.name,
      slug: product.id,
      description: product.name,
      price: product.price,
      images: [product.image],
      categoryId: "cat-1",
      category: { id: "cat-1", name: "Best Sellers", slug: "bestsellers" },
      tags: ["bestseller"],
      sku: product.id,
      stock: 20,
      lowStockAt: 2,
      published: true,
      featured: true,
      rating: product.rating,
      reviewCount: product.reviewCount,
      soldCount: product.soldCount,
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addItem(fullProduct, 1);
  };

  return (
    <div className="min-h-screen bg-background pb-16 space-y-8">
      {/* Breadcrumb */}
      <div className="container-main pt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-bold">Meilleures Ventes</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="container-main">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white p-8 md:p-12 shadow-luxury border border-gold-500/20">
          <div className="absolute inset-0 moroccan-pattern-bg opacity-15 pointer-events-none" />

          <div className="relative z-10 space-y-4 text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/20 border border-gold-400/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-300">
              <Flame className="h-4 w-4 text-amber-400" /> Les Incontournables NexMart
            </span>

            <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Meilleures Ventes du Maroc
            </h1>
            <p className="text-sm text-white/80 max-w-xl">
              Découvrez les produits les plus vendus et les mieux notés par plus de 50.000 clients satisfaits partout au Maroc.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="container-main">
        <div className="flex items-center justify-center gap-3 bg-card p-2 rounded-2xl border border-border max-w-md mx-auto shadow-sm">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "weekly" ? "bg-brand-700 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cette Semaine
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "monthly" ? "bg-brand-700 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ce Mois
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "favorites" ? "bg-brand-700 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Favoris Clients
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container-main">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input text-sm h-10 pl-10 pr-4 bg-surface border-border rounded-xl w-full"
          />
        </div>
      </div>

      {/* Bestsellers Grid */}
      <div className="container-main">
        {loading ? (
          <div className="bg-card p-12 rounded-3xl border border-border text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-muted-foreground mx-auto animate-spin" />
            <p className="font-bold text-foreground">Chargement des meilleures ventes...</p>
          </div>
        ) : bestsellers.length === 0 ? (
          <div className="bg-card p-12 rounded-3xl border border-border text-center space-y-3">
            <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="font-bold text-foreground">Aucune meilleure vente disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {bestsellers
              .filter((product: BestsellerProduct) => 
                searchQuery === "" || product.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((product: BestsellerProduct, i: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="group relative rounded-3xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-luxury transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display font-black text-2xl text-gold-500">
                      #{product.rank}
                    </span>
                    <button
                      onClick={() => toggleWishlist(product.id, product.name)}
                      className="grid h-8 w-8 place-items-center rounded-full bg-surface text-muted-foreground hover:bg-white hover:text-destructive shadow-sm"
                    >
                      <Heart className={`h-4 w-4 ${wishlist[product.id] ? "fill-destructive text-destructive" : ""}`} />
                    </button>
                  </div>

                  <div className="relative h-52 w-full mb-4 rounded-2xl bg-surface/50 p-2 overflow-hidden flex items-center justify-center">
                    <Image src={product.image} alt={product.name} fill className="object-contain transition-transform duration-500 group-hover:scale-105" />
                  </div>

                  <h3 className="text-sm font-bold text-foreground mb-1 leading-snug group-hover:text-brand-700 transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3 text-xs text-amber-500 font-bold">
                    <div className="flex text-amber-400">
                      {"★".repeat(5)}
                    </div>
                    <span>{product.rating}</span>
                    <span className="text-muted-foreground font-normal">({product.reviewCount} avis)</span>
                  </div>

                  <p className="text-xs text-emerald-700 font-bold mb-3 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Plus de {product.soldCount.toLocaleString("fr-MA")} commandés
                  </p>
                </div>

                <div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-display text-2xl font-black text-foreground">
                      {product.price.toLocaleString("fr-MA")} DH
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs py-3 shadow-md transition-all active:scale-95"
                  >
                    <ShoppingBag className="h-4 w-4" /> Commander maintenant
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
