"use client";

import { useOfflineCacheStore } from "@/store/offline-cache";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store";
import Image from "next/image";
import Link from "next/link";
import { WifiOff, ShoppingCart, Heart, Clock, RefreshCw, ShieldAlert } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function OfflineHubPage() {
  const { products: cachedProducts, isOnline } = useOfflineCacheStore();
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);
  const [checking, setChecking] = useState(false);

  const checkConnection = () => {
    setChecking(true);
    setTimeout(() => {
      if (navigator.onLine) {
        toast.success("Vous êtes en ligne !");
        window.location.href = "/";
      } else {
        toast.error("Toujours hors ligne. Vérifiez votre réseau Wi-Fi ou 4G/5G.");
      }
      setChecking(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F3F5F2] pb-24 pt-6 px-4 max-w-lg mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl mb-6 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
          <WifiOff size={32} />
        </div>
        <h1 className="text-xl font-bold mb-1">Espace Hors-ligne</h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
          Vous êtes actuellement déconnecté. Vos données enregistrées localement restent accessibles.
        </p>

        <button
          onClick={checkConnection}
          disabled={checking}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md"
        >
          <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
          <span>{checking ? "Vérification..." : "Tester la connexion"}</span>
        </button>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 justify-center">
          <ShieldAlert size={14} className="text-amber-400 flex-shrink-0" />
          <span>Les paiements et commandes seront finalisés en ligne.</span>
        </div>
      </div>

      {/* ── Saved Cart Summary ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <ShoppingCart size={18} className="text-[#0B6B57]" />
            <span>Mon Panier Enregistré</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">{cartItems.length} article(s)</span>
        </div>

        {cartItems.length > 0 ? (
          <div className="space-y-2.5">
            {cartItems.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                  <Image src={item.product?.images?.[0] || "/placeholder.jpg"} alt={item.product?.name || "Produit"} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{item.product?.name}</p>
                  <p className="text-[11px] text-slate-500">Qté: {item.quantity} · {item.price} MAD</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">Votre panier est vide</p>
        )}
      </div>

      {/* ── Saved Wishlist Summary ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Heart size={18} className="text-rose-500" />
            <span>Mes Favoris Enregistrés</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">{wishlistItems.length} article(s)</span>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {wishlistItems.slice(0, 4).map((item) => (
              <div key={item.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white mb-1.5">
                  <Image src={item.product?.images?.[0] || "/placeholder.jpg"} alt={item.product?.name || "Favori"} fill className="object-cover" />
                </div>
                <p className="text-[11px] font-semibold text-slate-800 truncate">{item.product?.name}</p>
                <p className="text-[10px] text-emerald-700 font-bold">{item.product?.price} MAD</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">Aucun favori enregistré</p>
        )}
      </div>

      {/* ── Recently Viewed Products (Cache) ──────────────────────────── */}
      {cachedProducts.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
            <Clock size={18} className="text-amber-500" />
            <span>Récemment Consultés (Cache)</span>
          </div>
          <div className="space-y-2">
            {cachedProducts.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-1.5">
                <div className="relative w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                  <Image src={p.images?.[0] || "/placeholder.jpg"} alt={p.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 truncate">{p.name}</p>
                  <p className="text-[11px] font-bold text-emerald-700">{p.price} MAD</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
