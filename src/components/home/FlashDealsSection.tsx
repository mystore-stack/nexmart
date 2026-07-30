"use client";
// src/components/home/FlashDealsSection.tsx — Section 7: Flash Deals
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, Heart, ShoppingBag, Star, ChevronRight, Check } from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import toast from "react-hot-toast";

interface FlashProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  stock: number;
  soldCount: number;
  customBadge?: string;
}

export function FlashDealsSection() {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 58, seconds: 32 });
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<FlashProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<any>(null);
  const addItem = useCartStore((state) => state.addItem);

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

  useEffect(() => {
    fetch("/api/homepage/sections/flashDeals/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(Array.isArray(data.data) ? data.data : []);
          setSection(data.section || null);
        } else {
          setProducts([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching flash deals:", error);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

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

  const handleAddToCart = (product: FlashProduct) => {
    const fullProduct: Product = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.name,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images,
      categoryId: "cat-1",
      category: { id: "cat-1", name: "High-Tech", slug: "high-tech" },
      tags: ["flash-sale"],
      sku: product.slug,
      stock: product.stock,
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

  const calculateDiscount = (product: FlashProduct) => {
    if (product.comparePrice && product.comparePrice > product.price) {
      return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    }
    return 0;
  };

  const formatTwoDigits = (num: number) => String(num).padStart(2, "0");

  // Hide section if configured to hide when empty and no products
  if (!loading && section?.hideIfEmpty && products.length === 0) {
    return null;
  }

  // Hide section if not active
  if (!loading && section && !section.active) {
    return null;
  }

  const sectionTitle = section?.title || "VENTE FLASH";
  const sectionSubtitle = section?.subtitle || "Offres exceptionnelles à durée limitée";
  const viewAllText = section?.viewAllButton || "Voir tout";
  const destinationUrl = section?.destinationUrl || "/collections/flash-deals";

  return (
    <section className="my-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
            <Zap className="h-5 w-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                {sectionTitle}
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-surface px-3 py-1 rounded-full border border-border">
                <span>Se termine dans</span>
                <span className="bg-destructive text-white font-mono font-bold px-1.5 py-0.5 rounded">
                  {formatTwoDigits(timeLeft.hours)}
                </span>
                <span>:</span>
                <span className="bg-destructive text-white font-mono font-bold px-1.5 py-0.5 rounded">
                  {formatTwoDigits(timeLeft.minutes)}
                </span>
                <span>:</span>
                <span className="bg-destructive text-white font-mono font-bold px-1.5 py-0.5 rounded">
                  {formatTwoDigits(timeLeft.seconds)}
                </span>
              </div>
            </div>
            {sectionSubtitle && (
              <p className="text-xs text-muted-foreground mt-1">{sectionSubtitle}</p>
            )}
          </div>
        </div>

        <Link
          href={destinationUrl}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 dark:text-brand-400 hover:text-brand-600 transition-colors group"
        >
          {viewAllText}
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-80 rounded-3xl border border-border bg-surface animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucune vente flash disponible pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product, i) => {
            const discount = calculateDiscount(product);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-4 shadow-sm hover:shadow-luxury transition-all duration-300 hover:-translate-y-1"
              >
                {/* Top Badges & Wishlist */}
                <div className="relative mb-3 flex items-center justify-between">
                  {discount > 0 && (
                    <span className="rounded-xl bg-destructive px-2.5 py-1 text-xs font-black text-white shadow-sm">
                      -{discount}%
                    </span>
                  )}
                  {product.customBadge && (
                    <span className="rounded-xl bg-brand-100 px-2.5 py-1 text-xs font-black text-brand-700 shadow-sm">
                      {product.customBadge}
                    </span>
                  )}

                  <button
                    onClick={() => toggleWishlist(product.id, product.name)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-surface/80 text-muted-foreground transition-all hover:bg-white hover:text-destructive shadow-sm"
                    aria-label="Favoris"
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        wishlist[product.id] ? "fill-destructive text-destructive" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Product Image */}
                <div className="relative h-44 w-full mb-3 flex items-center justify-center overflow-hidden rounded-2xl bg-surface/40 p-2">
                  <Image
                    src={product.images[0] || "/images/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Stock Tag */}
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Check className="h-3 w-3" /> En stock
                  </span>
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="line-clamp-2 text-xs font-bold text-foreground mb-1.5 leading-snug group-hover:text-brand-700 transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center text-amber-400">
                      <Star className="h-3 w-3 fill-amber-400" />
                    </div>
                    <span className="text-xs font-bold text-foreground">{product.rating}</span>
                    <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-display text-lg font-black text-foreground">
                      {product.price.toLocaleString("fr-MA")} DH
                    </span>
                    {product.comparePrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {product.comparePrice.toLocaleString("fr-MA")} DH
                      </span>
                    )}
                  </div>

                  {/* Stock Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                      <span>Vendus: {product.soldCount}</span>
                      <span className="text-amber-600">Stock: {product.stock}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-destructive transition-all duration-500"
                        style={{ width: `${Math.min((product.soldCount / (product.soldCount + product.stock)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Add Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs py-2.5 shadow-md transition-all active:scale-95"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Ajouter au panier
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
