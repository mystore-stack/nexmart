"use client";

import { useState } from "react";
import { Bell, Scale, Share2, Heart, Check } from "lucide-react";
import { shareProduct } from "@/lib/nexshare";
import { useCompareStore } from "@/store/compare";
import toast from "react-hot-toast";

interface MobileProductActionSheetProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
    stock?: number;
  };
}

export function MobileProductActionSheet({ product }: MobileProductActionSheetProps) {
  const { addItem, hasItem } = useCompareStore();
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  const isCompared = hasItem(product.id);
  const isOutOfStock = (product.stock ?? 1) <= 0;

  const handleShare = async () => {
    await shareProduct(product);
  };

  const handleToggleCompare = () => {
    addItem(product as any);
  };

  const handleSetAlert = async (type: "PRICE_DROP" | "BACK_IN_STOCK") => {
    setAlertLoading(true);
    try {
      const res = await fetch("/api/mobile/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id, type }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertSuccess(true);
        toast.success(data.message || "Alerte activée !");
      } else {
        toast.error(data.message || "Connexion requise pour activer l'alerte");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setAlertLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 py-3 border-y border-slate-100 my-4 text-xs font-medium">
      {/* Share */}
      <button
        onClick={handleShare}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
      >
        <Share2 size={15} />
        <span>Partager</span>
      </button>

      {/* Compare */}
      <button
        onClick={handleToggleCompare}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition active:scale-95 ${
          isCompared
            ? "bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold"
            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
        }`}
      >
        <Scale size={15} />
        <span>{isCompared ? "Comparé" : "Comparer"}</span>
      </button>

      {/* Alert */}
      <button
        onClick={() => handleSetAlert(isOutOfStock ? "BACK_IN_STOCK" : "PRICE_DROP")}
        disabled={alertLoading || alertSuccess}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition active:scale-95 ${
          alertSuccess
            ? "bg-amber-50 text-amber-800 border border-amber-300 font-bold"
            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
        }`}
      >
        {alertSuccess ? <Check size={15} /> : <Bell size={15} />}
        <span>{alertSuccess ? "Alerte active" : isOutOfStock ? "Stock" : "Baisse prix"}</span>
      </button>
    </div>
  );
}
