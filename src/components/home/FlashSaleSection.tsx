"use client";
// src/components/home/FlashSaleSection.tsx - Moroccan Luxury Flash Sale
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Clock } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductCard";
import type { Product } from "@/types";

function useCountdown(endMs: number) {
  const [t, setT] = useState<number | null>(null);
  useEffect(() => {
    // Initialize on client only to avoid hydration mismatch
    setT(Math.max(0, endMs - Date.now()));
    const id = setInterval(() => setT(Math.max(0, endMs - Date.now())), 1000);
    return () => clearInterval(id);
  }, [endMs]);
  const h = t !== null ? String(Math.floor(t / 3600000)).padStart(2, "0") : "00";
  const m = t !== null ? String(Math.floor((t % 3600000) / 60000)).padStart(2, "0") : "00";
  const s = t !== null ? String(Math.floor((t % 60000) / 1000)).padStart(2, "0") : "00";
  return { h, m, s };
}

interface Props { products: Product[] }

export function FlashSaleSection({ products }: Props) {
  // Calculate end time once using ref to avoid infinite re-renders
  const endTimeRef = useRef(Date.now() + 6 * 3600000);
  const { h, m, s } = useCountdown(endTimeRef.current);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-orange-500/20 bg-slate-950 p-5 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(15,23,42,0.9),_rgba(15,23,42,0.78))]" />

      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 shadow-lg">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="section-label mb-1 block text-orange-300">Offres limitées</span>
              <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                Vente Flash
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
            <Clock className="h-4 w-4 text-orange-300" />
            <span className="text-[11px] uppercase tracking-[0.24em] text-white/70">Se termine dans</span>
            <div className="flex items-center gap-1.5">
              {[h, m, s].map((unit, i) => (
                <React.Fragment key={i}>
                  <motion.div
                    key={`${unit}-${i}`}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-white"
                  >
                    {unit}
                  </motion.div>
                  {i < 2 && <span className="text-orange-300">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <ProductGrid products={products.slice(0, 4)} columns={4} />

        <div className="text-center">
          <Link href="/deals" className="btn btn-gold btn-lg group font-display tracking-wide">
            Voir toutes les offres flash
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
