"use client";

import { useCompareStore } from "@/store/compare";
import { useCartStore } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trash2, ShoppingCart, Star, Check, X, Scale } from "lucide-react";
import toast from "react-hot-toast";

export default function ComparePage() {
  const { items, removeItem, clear } = useCompareStore();
  const addItemToCart = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
          <Scale size={36} strokeWidth={1.8} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Votre comparateur est vide</h1>
        <p className="text-slate-500 max-w-sm text-sm mb-6">
          Ajoutez des produits pour comparer leurs caractéristiques, prix et avis en un coup d'œil.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B6B57] text-white font-semibold text-sm shadow-md hover:bg-[#084C3E] transition"
        >
          Découvrir les produits
        </Link>
      </div>
    );
  }

  const handleAddToCart = (product: any) => {
    addItemToCart(product, 1);
    toast.success(`Ajouté au panier !`);
  };

  return (
    <div className="min-h-screen bg-[#F3F5F2] pb-24 pt-4 px-4 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Comparateur de Produits</h1>
            <p className="text-xs text-slate-500">{items.length} produit(s) sélectionné(s)</p>
          </div>
        </div>

        <button
          onClick={clear}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/50"
        >
          Tout effacer
        </button>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(260px, 1fr))` }}>
          {items.map((product) => {
            const categoryName = typeof product.category === "object" ? product.category?.name : product.category;
            const brandName = typeof product.brand === "object" ? product.brand?.name : product.brand;
            const discount = product.comparePrice && product.comparePrice > product.price
              ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
              : null;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between"
              >
                {/* Product Card Top */}
                <div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-3">
                    <Image
                      src={product.images?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeItem(product.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-sm hover:bg-white"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                    {discount && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                        -{discount}%
                      </span>
                    )}
                  </div>

                  <Link href={`/products/${product.slug}`} className="hover:underline">
                    <h2 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-2 leading-snug">
                      {product.name}
                    </h2>
                  </Link>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-lg font-black text-[#0B6B57]">
                      {product.price.toLocaleString("fr-MA")} MAD
                    </span>
                    {product.comparePrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {product.comparePrice.toLocaleString("fr-MA")}
                      </span>
                    )}
                  </div>

                  {/* Specs Table */}
                  <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Catégorie</span>
                      <span className="font-medium text-slate-800">{categoryName || "Général"}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Marque</span>
                      <span className="font-medium text-slate-800">{brandName || "NexMart"}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Avis clients</span>
                      <span className="font-medium text-slate-800 flex items-center gap-1">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        {product.rating ? product.rating.toFixed(1) : "Nouveau"}
                        {product.reviewCount ? ` (${product.reviewCount})` : ""}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-400">Disponibilité</span>
                      <span className="font-medium flex items-center gap-1">
                        {(product.stock ?? 1) > 0 ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Check size={13} strokeWidth={2.5} /> En stock
                          </span>
                        ) : (
                          <span className="text-rose-500 flex items-center gap-1">
                            <X size={13} strokeWidth={2.5} /> Épuisé
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-6 w-full py-2.5 rounded-xl bg-[#0B6B57] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#084C3E] active:scale-95 transition shadow-sm"
                >
                  <ShoppingCart size={14} />
                  Ajouter au panier
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
