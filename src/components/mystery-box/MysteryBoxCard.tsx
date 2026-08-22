// src/components/mystery-box/MysteryBoxCard.tsx
"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, TrendingUp, Star, Lock, Unlock } from "lucide-react";
import toast from "react-hot-toast";

interface MysteryItem {
  id: string;
  name: string;
  image: string;
  value: number;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  weight: number;
}

interface MysteryBox {
  id: string;
  title: string;
  description: string | null;
  image: string;
  price: number;
  oldPrice: number | null;
  minGuaranteedValue: number | null;
  maxProfitPercent: number | null;
  itemCount: number;
  openCount: number;
  items: MysteryItem[];
  startDate: string | null;
  endDate: string | null;
}

interface MysteryBoxCardProps {
  box: MysteryBox;
  onOpen?: (boxId: string) => void;
}

const rarityColors = {
  COMMON: "from-gray-400 to-gray-500",
  RARE: "from-blue-400 to-blue-600",
  EPIC: "from-purple-400 to-purple-600",
  LEGENDARY: "from-amber-400 to-amber-600",
};

const rarityLabels = {
  COMMON: "Commun",
  RARE: "Rare",
  EPIC: "Épique",
  LEGENDARY: "Légendaire",
};

export function MysteryBoxCard({ box, onOpen }: MysteryBoxCardProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [revealedItem, setRevealedItem] = useState<MysteryItem | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  const handleOpen = async () => {
    setIsOpening(true);
    try {
      const res = await fetch("/api/mystery-boxes/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boxId: box.id }),
      });
      const data = await res.json();
      
      if (data.success) {
        setRevealedItem(data.result.item);
        setShowReveal(true);
        toast.success(`Vous avez gagné: ${data.result.item.name}!`);
        onOpen?.(box.id);
      } else {
        toast.error(data.error || "Erreur lors de l'ouverture");
      }
    } catch (error) {
      toast.error("Erreur lors de l'ouverture");
    } finally {
      setIsOpening(false);
    }
  };

  const discountPercent = box.oldPrice 
    ? Math.round(((box.oldPrice - box.price) / box.oldPrice) * 100)
    : 0;

  const totalValue = box.items.reduce((sum, item) => sum + item.value, 0);
  const avgValue = totalValue / box.items.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury"
    >
      {/* Reveal Overlay */}
      <AnimatePresence>
        {showReveal && revealedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="relative h-48 w-48 mb-6"
            >
              <Image
                src={revealedItem.image}
                alt={revealedItem.name}
                fill
                className="object-contain"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-2"
            >
              <div className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${rarityColors[revealedItem.rarity]} text-white shadow-lg`}>
                {rarityLabels[revealedItem.rarity]}
              </div>
              <h3 className="text-2xl font-bold">{revealedItem.name}</h3>
              <p className="text-gold-300 font-display text-3xl font-black">
                {revealedItem.value.toLocaleString("fr-MA")} DH
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => setShowReveal(false)}
              className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors"
            >
              Fermer
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Content */}
      <div className="relative h-64 w-full overflow-hidden">
        {box.oldPrice && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 text-white px-3 py-1.5 text-xs font-bold shadow-lg">
              -{discountPercent}%
            </span>
          </div>
        )}
        <Image src={box.image} alt={box.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="space-y-4 p-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">{box.title}</h3>
          {box.description && (
            <p className="text-sm text-muted-foreground mt-1">{box.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Gift className="h-4 w-4" />
            <span>{box.itemCount} articles</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>{box.openCount} ouvertures</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-2xl font-black text-foreground">
              {box.price.toLocaleString("fr-MA")} DH
            </p>
            {box.oldPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {box.oldPrice.toLocaleString("fr-MA")} DH
              </p>
            )}
          </div>
          {box.minGuaranteedValue && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Valeur min. garantie</p>
              <p className="text-sm font-semibold text-emerald-600">
                {box.minGuaranteedValue.toLocaleString("fr-MA")} DH
              </p>
            </div>
          )}
        </div>

        {box.maxProfitPercent && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
            <TrendingUp className="h-4 w-4" />
            <span>Jusqu'à +{box.maxProfitPercent}% de profit</span>
          </div>
        )}

        <button
          onClick={handleOpen}
          disabled={isOpening}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-800 hover:from-brand-800 hover:to-brand-900 text-white font-bold text-sm py-3 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOpening ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Ouverture...
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              Ouvrir la boîte
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
