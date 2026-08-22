"use client";
// src/components/home/FlashSaleSection.tsx - Moroccan Luxury Flash Sale
import React, { useEffect, useMemo, useState } from "react";
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
  const endTime = useMemo(() => Date.now() + 6 * 3600000, []);
  const { h, m, s } = useCountdown(endTime);

  return (
    <div className="relative overflow-hidden">
      {/* Moroccan pattern */}
      <div className="absolute inset-0 moroccan-pattern-bg opacity-20" />
      <div className="absolute top-0 left-0 w-80 h-80 opacity-20"
        style={{ background: "radial-gradient(circle, rgba(15,118,110,0.5) 0%, transparent 70%)", transform: "translate(-30%,-30%)" }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-15"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.5) 0%, transparent 70%)", transform: "translate(30%,30%)" }} />

      {/* Top gold line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

      <div className="relative space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="section-label text-gold-300 mb-1 block">Offres limitées</span>
              <h2 className="font-display text-3xl font-semibold text-white">
                Vente Flash
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Clock className="h-4 w-4 text-gold-400" />
              <span className="text-xs uppercase tracking-wide font-medium">Se termine dans</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[h, m, s].map((unit, i) => (
                <React.Fragment key={i}>
                  <motion.div
                    key={`${unit}-${i}`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-400/25 bg-white/10 backdrop-blur font-display text-lg font-bold text-white"
                    style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" }}
                  >
                    {unit}
                  </motion.div>
                  {i < 2 && <span className="text-gold-400 font-bold text-lg">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <ProductGrid products={products.slice(0, 4)} columns={4} />

        <div className="text-center">
          <Link
            href="/deals"
            className="btn btn-gold btn-lg group font-display tracking-wide"
          >
            Voir toutes les offres flash
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
    </div>
  );
}
