"use client";
// src/app/new-arrivals/page.tsx — New Arrivals Standalone Page
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  PackagePlus, Star, Heart, ShoppingBag, ChevronRight, Sparkles, Check, Search, RefreshCw
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import toast from "react-hot-toast";

interface NewItem {
  id: string;
  name: string;
  price: number;
  badgeText: string;
  image: string;
  rating: number;
  reviewCount: number;
  active: boolean;
}

export default function NewArrivalsPage() {
  const [newItems, setNewItems] = useState<NewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await fetch("/api/admin/cms/new-arrivals");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setNewItems(data.data.filter((d: NewItem) => d.active));
        }
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  const toggleWishlist = (id: string, name: string) => {
    setWishlist((prev) => {
      const next = !prev[id];
      if (next) toast.success(`Ajouté aux favoris: ${name}`);
      else toast.error("Retiré des favoris");
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = (item: NewItem) => {
    const fullProduct: Product = {
      id: item.id,
      name: item.name,
      slug: item.id,
      description: item.name,
      price: item.price,
      images: [item.image],
      categoryId: "cat-1",
      category: { id: "cat-1", name: "Nouveautés", slug: "new-arrivals" },
      tags: ["new-arrival"],
      sku: item.id,
      stock: 15,
      lowStockAt: 2,
      published: true,
      featured: true,
      rating: item.rating,
      reviewCount: item.reviewCount,
      soldCount: 10,
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addItem(fullProduct, 1);
  };

  return (
    <div className="min-h-screen bg-background pb-16 space-y-8">
      <div className="container-main pt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-bold">Nouveautés</span>
        </div>
      </div>

      <div className="container-main">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 text-white p-8 md:p-12 shadow-luxury border border-teal-500/20">
          <div className="absolute inset-0 moroccan-pattern-bg opacity-15 pointer-events-none" />

          <div className="relative z-10 space-y-4 text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">
              <PackagePlus className="h-4 w-4" /> Collections Fraîchement Arrivées
            </span>

            <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Nouveautés & Dernières Sorties
            </h1>
            <p className="text-sm text-white/80 max-w-xl">
              Soyez les premiers à découvrir les dernières innovations High-Tech et tendances de la saison sélectionnées par NexMart.
            </p>
          </div>
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

      <div className="container-main">
        {loading ? (
          <div className="bg-card p-12 rounded-3xl border border-border text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-muted-foreground mx-auto animate-spin" />
            <p className="font-bold text-foreground">Chargement des nouveautés...</p>
          </div>
        ) : newItems.length === 0 ? (
          <div className="bg-card p-12 rounded-3xl border border-border text-center space-y-3">
            <PackagePlus className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="font-bold text-foreground">Aucune nouveauté disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {newItems
              .filter((item: NewItem) => 
                searchQuery === "" || item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item: NewItem, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-4 shadow-sm hover:shadow-luxury transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-xl bg-brand-700 text-white px-2.5 py-1 text-xs font-bold shadow-sm">
                      {item.badgeText}
                    </span>
                    <button
                      onClick={() => toggleWishlist(item.id, item.name)}
                      className="grid h-8 w-8 place-items-center rounded-full bg-surface text-muted-foreground hover:bg-white hover:text-destructive shadow-sm"
                    >
                      <Heart className={`h-4 w-4 ${wishlist[item.id] ? "fill-destructive text-destructive" : ""}`} />
                    </button>
                  </div>

                  <div className="relative h-48 w-full mb-3 rounded-2xl bg-surface/50 p-2 overflow-hidden flex items-center justify-center">
                    <Image src={item.image} alt={item.name} fill className="object-contain transition-transform duration-500 group-hover:scale-105" />
                  </div>

                  <h3 className="text-xs font-bold text-foreground mb-1 leading-snug group-hover:text-brand-700 transition-colors">
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-1 mb-2 text-xs text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{item.rating}</span>
                    <span className="text-muted-foreground font-normal">({item.reviewCount})</span>
                  </div>
                </div>

                <div>
                  <p className="font-display text-xl font-black text-foreground mb-3">
                    {item.price.toLocaleString("fr-MA")} DH
                  </p>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs py-3 shadow-md transition-all active:scale-95"
                  >
                    <ShoppingBag className="h-4 w-4" /> Ajouter au panier
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
