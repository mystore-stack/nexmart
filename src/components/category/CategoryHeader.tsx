"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronRight, Filter } from "lucide-react";

interface CategoryHeaderProps {
  name: string;
  description?: string;
  image?: string;
  productCount: number;
  onFilterToggle?: () => void;
}

export function CategoryHeader({
  name,
  description,
  image,
  productCount,
  onFilterToggle,
}: CategoryHeaderProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-900"
    >
      {/* Background image with overlay */}
      {image && (
        <>
          <Image
            src={image}
            alt={name}
            fill
            className="absolute inset-0 h-full w-full object-cover opacity-20"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/70 to-slate-950/60" />
        </>
      )}

      <div className="relative mx-auto max-w-[1480px] px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex items-center gap-2 text-sm text-white/70"
        >
          <a href="/" className="hover:text-white transition-colors">
            Accueil
          </a>
          <ChevronRight className="h-4 w-4" />
          <a href="/categories" className="hover:text-white transition-colors">
            Catégories
          </a>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">{name}</span>
        </motion.div>

        {/* Title and description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            {name}
          </h1>
          {description && (
            <p className="text-lg text-white/80 max-w-2xl">{description}</p>
          )}
        </motion.div>

        {/* Stats and filter button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-white/60">Total de produits</p>
              <p className="text-2xl font-bold text-white">
                {productCount.toLocaleString("fr-MA")}
              </p>
            </div>
          </div>

          <motion.button
            onClick={onFilterToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white backdrop-blur transition-all hover:border-white/40 hover:bg-white/15"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline text-sm font-semibold">Filtres</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
}
