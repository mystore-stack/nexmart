"use client";
// src/components/home/FlashSaleSection.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, discountPercentage } from "@/utils/format";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";

// Flash sale ends in 8 hours from page load
const SALE_DURATION = 8 * 60 * 60;

function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return { h, m, s, done: remaining === 0 };
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg md:text-xl countdown-digit tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[9px] uppercase tracking-wider text-white/60 mt-1">{label}</span>
    </div>
  );
}

interface Props { products: Product[] }

export function FlashSaleSection({ products }: Props) {
  const { h, m, s } = useCountdown(SALE_DURATION);
  const { addItem } = useCartStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Flash Sale</h2>
            <p className="text-white/60 text-sm">Limited time — incredible prices</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-white/60 text-sm hidden sm:block">Ends in:</span>
          <div className="flex items-center gap-2">
            <CountdownBlock value={h} label="HRS" />
            <span className="text-white/60 font-bold text-lg mb-3">:</span>
            <CountdownBlock value={m} label="MIN" />
            <span className="text-white/60 font-bold text-lg mb-3">:</span>
            <CountdownBlock value={s} label="SEC" />
          </div>
        </div>
      </div>

      {/* Products horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {products.map((product, i) => {
          const disc = product.comparePrice
            ? discountPercentage(product.price, product.comparePrice)
            : 0;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex-shrink-0 w-40 md:w-48 bg-white/10 border border-white/10 rounded-2xl overflow-hidden group hover:bg-white/15 transition-all cursor-pointer"
            >
              <Link href={`/products/${product.slug}`}>
                <div className="relative aspect-square overflow-hidden bg-white/5">
                  <Image
                    src={product.images[0] || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="192px"
                  />
                  {disc > 0 && (
                    <span className="absolute top-2 left-2 badge bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5">
                      -{disc}%
                    </span>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <Link href={`/products/${product.slug}`}>
                  <p className="text-white text-xs font-medium line-clamp-2 mb-2 leading-snug hover:text-brand-300 transition-colors">
                    {product.name}
                  </p>
                </Link>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-white font-bold">{formatPrice(product.price)}</span>
                  {product.comparePrice && (
                    <span className="text-white/40 text-xs line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => addItem(product)}
                  disabled={product.stock === 0}
                  className="w-full text-xs font-semibold py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {product.stock === 0 ? "Sold Out" : "Add to Cart"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center">
        <Link
          href="/deals"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
        >
          View all deals <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
