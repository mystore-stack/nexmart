"use client";
// src/app/wishlist/page.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2, Share2 } from "lucide-react";
import { useWishlistStore } from "@/store/index";
import { useCartStore } from "@/store/cart";
import { formatPrice, discountPercentage } from "@/utils/format";
import type { WishlistItem } from "@/types";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "My NexMart Wishlist", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  if (!mounted) return null;

  return (
    <div className="page-enter">
      <div className="border-b border-border bg-surface">
        <div className="container-main py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                My Wishlist
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {items.length} {items.length === 1 ? "item" : "items"} saved
              </p>
            </div>
            {items.length > 0 && (
              <button onClick={handleShare} className="btn-ghost flex items-center gap-2 text-sm">
                <Share2 className="w-4 h-4" /> Share
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-muted-foreground/40" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8">
              Save items you love and come back to them anytime.
            </p>
            <Link href="/products" className="btn-primary px-8 py-3.5">
              Discover Products
            </Link>
          </div>
        ) : (
          <>
            {/* Bulk actions */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">{items.length} saved items</p>
              <button
                onClick={() => {
                  items.forEach((i) => addItem(i.product));
                  toast.success("All items added to cart!");
                }}
                className="btn-primary py-2 px-5 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Add All to Cart
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              <AnimatePresence>
                {items.map((item: WishlistItem, i: number) => {
                  const discount = item.product.comparePrice
                    ? discountPercentage(item.product.price, item.product.comparePrice)
                    : 0;
                  const inStock = item.product.stock > 0;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                      transition={{ delay: i * 0.04 }}
                      className="product-card group"
                    >
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <Link href={`/products/${item.product.slug}`}>
                          <Image
                            src={item.product.images[0] || "/placeholder.jpg"}
                            alt={item.product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, 25vw"
                          />
                        </Link>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {discount > 0 && (
                            <span className="badge bg-red-500 text-white text-[10px] font-bold px-2 py-0.5">
                              -{discount}%
                            </span>
                          )}
                          {!inStock && (
                            <span className="badge bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 dark:bg-card/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-sm font-medium line-clamp-2 hover:text-brand-500 transition-colors leading-snug"
                        >
                          {item.product.name}
                        </Link>

                        <div className="flex items-baseline gap-2 mt-2 mb-3">
                          <span className="font-bold">{formatPrice(item.product.price)}</span>
                          {item.product.comparePrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(item.product.comparePrice)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => addItem(item.product)}
                          disabled={!inStock}
                          className="w-full text-xs font-semibold py-2.5 rounded-xl border-2 border-foreground hover:bg-foreground hover:text-background transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {inStock ? "Add to Cart" : "Out of Stock"}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
