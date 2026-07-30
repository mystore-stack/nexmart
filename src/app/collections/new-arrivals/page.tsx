"use client";
// src/app/collections/new-arrivals/page.tsx
import React, { useState, useEffect } from "react";
import { PackagePlus, ShoppingBag, Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import toast from "react-hot-toast";

interface CollectionProduct {
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

export default function NewArrivalsCollectionPage() {
  const [products, setProducts] = useState<CollectionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetch("/api/homepage/sections/showcaseGrid/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(Array.isArray(data.data) ? data.data : []);
        }
      })
      .catch((error) => {
        console.error("Error fetching new arrivals:", error);
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

  const handleAddToCart = (product: CollectionProduct) => {
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
      tags: ["new-arrival"],
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

  const calculateDiscount = (product: CollectionProduct) => {
    if (product.comparePrice && product.comparePrice > product.price) {
      return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-surface/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <PackagePlus className="h-6 w-6 fill-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Nouveautés</h1>
          </div>
          <p className="text-white/90 text-lg">Découvrez nos derniers produits</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <PackagePlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-bold text-foreground mb-2">Aucune nouveauté disponible</h2>
            <p className="text-muted-foreground">Revenez plus tard pour découvrir nos nouveaux produits</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const discount = calculateDiscount(product);
              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col rounded-3xl border border-border/70 bg-card p-4 shadow-sm hover:shadow-luxury transition-all duration-300 hover:-translate-y-1"
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
                  <div className="relative h-48 w-full mb-3 flex items-center justify-center overflow-hidden rounded-2xl bg-surface/40 p-2">
                    <Image
                      src={product.images[0] || "/images/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="line-clamp-2 text-sm font-bold text-foreground mb-1.5 leading-snug group-hover:text-brand-700 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

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
                  </div>

                  {/* Quick Add Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs py-2.5 shadow-md transition-all active:scale-95"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Ajouter au panier
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
