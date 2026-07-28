"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Filter } from "lucide-react";

interface DealsHeaderProps {
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  onFilterToggle?: () => void;
}

export function DealsHeader({
  sortBy = "popular",
  onSortChange,
  onFilterToggle,
}: DealsHeaderProps) {
  const sortOptions = [
    { value: "popular", label: "Populaire" },
    { value: "discount", label: "Plus grosse remise" },
    { value: "price_asc", label: "Prix croissant" },
    { value: "price_desc", label: "Prix décroissant" },
    { value: "newest", label: "Nouveautés" },
    { value: "rating", label: "Mieux noté" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-900"
    >
      {/* Animated background */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgb(217, 119, 6) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgb(217, 119, 6) 0%, transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-6 flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl"
          >
            ⚡
          </motion.div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">
              Super Deals
            </h1>
            <p className="text-sm text-white/70">
              Économisez jusqu'à 70% sur une sélection de produits premium
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: "10k+", label: "Produits en solde" },
            { value: "Jusqu'à 70%", label: "Remise maximale" },
            { value: "24h", label: "Dispatch Casablanca" },
            { value: "100%", label: "Authentique garanti" },
          ].map(({ value, label }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg border border-white/10 bg-white/5 backdrop-blur px-3 py-2"
            >
              <p className="text-sm font-bold text-white">{value}</p>
              <p className="text-xs text-white/60">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Sort dropdown */}
          <div className="flex-1 sm:flex-none">
            <select
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 backdrop-blur transition-all hover:border-white/40 focus:border-orange-500 focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter button */}
          <motion.button
            onClick={onFilterToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white backdrop-blur transition-all hover:border-white/40 hover:bg-white/15"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline text-sm font-semibold">Filtres</span>
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}
