"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Gift, Zap, Users } from "lucide-react";

interface MysteryBox {
  id: string;
  name: string;
  description: string;
  valueLabel: string;
  price: number;
  originalValue: number;
  stock: number;
  images: string[];
  slug?: string;
}

interface MysteryBoxShowcaseProps {
  box: MysteryBox;
  variant?: "featured" | "compact";
}

export function MysteryBoxShowcase({ box, variant = "featured" }: MysteryBoxShowcaseProps) {
  const [timeLeft, setTimeLeft] = useState<string>("Loading...");

  useEffect(() => {
    const updateTimer = () => {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - new Date().getTime();

      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${hours}h ${minutes}m left`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const discountPercent = Math.round(((box.originalValue - box.price) / box.originalValue) * 100);

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
            {box.images[0] && (
              <Image
                src={box.images[0]}
                alt={box.name}
                fill
                className="object-cover"
                sizes="100px"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1">{box.name}</h3>
            <p className="text-sm text-white/70 line-clamp-1 mb-3">{box.description}</p>
            <div className="flex items-center gap-3">
              <Link
                href={`/mystery-box/${box.slug || box.id}`}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#d6b25e] to-[#c29c4a] text-slate-900 font-bold text-sm hover:shadow-lg transition-all"
              >
                <Gift className="w-4 h-4" />
                Discover
              </Link>
              <span className="text-xs text-white/50">{box.stock} available</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Featured variant
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-950 border border-slate-800 p-6 sm:p-8 lg:p-12"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full border border-[#d6b25e]/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full border border-[#d6b25e]/5"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#d6b25e]/5 via-transparent to-[#0f5d43]/5 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d6b25e]/15 border border-[#d6b25e]/30 backdrop-blur">
            <Gift className="w-4 h-4 text-[#d6b25e]" />
            <span className="text-sm font-bold text-[#d6b25e]">Mystery Treasure</span>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-2">
              {box.name}
            </h2>
            <p className="text-lg text-white/70">{box.description}</p>
          </div>

          {/* Value Proposition */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
              <p className="text-sm text-white/60 mb-1">Box Value</p>
              <p className="text-2xl font-black text-[#d6b25e]">{box.valueLabel || "Premium"}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
              <p className="text-sm text-white/60 mb-1">Your Price</p>
              <p className="text-2xl font-black text-white">{(box.price || 0) || 0} MAD</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/30 backdrop-blur">
              <p className="text-sm text-red-300/80 mb-1">Save</p>
              <p className="text-2xl font-black text-red-400">{Math.max(0, discountPercent) || 0}%</p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <Zap className="w-5 h-5 text-[#d6b25e] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Limited Time Offer</p>
                <p className="text-xs text-white/60">{timeLeft}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <Users className="w-5 h-5 text-[#0f5d43] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">In Stock</p>
                <p className="text-xs text-white/60">{box.stock} boxes remaining</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/mystery-box/${box.slug || box.id}`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-[#d6b25e] to-[#c29c4a] text-slate-900 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all"
          >
            <Gift className="w-5 h-5" />
            Open Your Mystery Box
          </Link>
        </motion.div>

        {/* Right: Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative hidden lg:block"
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full"
            >
              {box.images[0] && (
                <Image
                  src={box.images[0]}
                  alt={box.name}
                  fill
                  className="object-cover"
                  sizes="400px"
                  priority
                />
              )}
            </motion.div>

            {/* Floating badges */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-[#d6b25e] to-[#c29c4a] flex items-center justify-center shadow-lg"
            >
              <span className="text-3xl">🎁</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
