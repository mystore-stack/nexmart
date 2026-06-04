"use client";
// src/components/product/ProductInfo.tsx — Moroccan Luxury Product Info
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Heart, Share2, Star, Truck, Shield, RefreshCw,
  Minus, Plus, Check, AlertTriangle, Package, Crown
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/index";
import { formatPrice, discountPercentage } from "@/utils/format";
import type { Product, ProductVariant } from "@/types";

interface Props { product: Product }

const TAB_LABELS = { description: "Description", specs: "Spécifications", shipping: "Livraison" };

export function ProductInfo({ product }: Props) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [tab, setTab] = useState<"description" | "specs" | "shipping">("description");

  const { addItem } = useCartStore();
  const { addItem: addWishlist, hasItem } = useWishlistStore();

  const inWishlist = hasItem(product.id);
  const discount = product.comparePrice ? discountPercentage(product.price, product.comparePrice) : 0;
  const variantGroups = product.variants.reduce((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {} as Record<string, ProductVariant[]>);
  const selectedVariant = Object.values(selectedVariants)[0];
  const currentPrice = selectedVariant?.price ?? product.price;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= product.lowStockAt;

  const handleAddToCart = () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    try {
      addItem(product, quantity, selectedVariant);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } finally {
      setTimeout(() => setIsAdding(false), 380);
    }
  };

  const handleShare = async () => {
    if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
    else navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="space-y-6">
      {/* Category breadcrumb */}
      <Link href={`/products?category=${product.category.slug}`}
        className="section-label text-[10px] hover:text-gold-600 transition-colors">
        <span className="inline-block w-6 h-px bg-gold-500 mr-2 align-middle" />
        {product.category.name}
      </Link>

      {/* Title */}
      <h1 className="font-display text-3xl font-semibold leading-tight text-foreground md:text-4xl">
        {product.name}
      </h1>

      {/* Rating */}
      {product.reviewCount > 0 && (
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating) ? "text-gold-500 fill-gold-500" : "text-muted-foreground/25 fill-muted-foreground/10"}`} />
            ))}
          </div>
          <span className="text-sm font-bold text-foreground">{product.rating.toFixed(1)}</span>
          <a href="#reviews" className="text-sm text-muted-foreground hover:text-brand-700 transition-colors">
            {new Intl.NumberFormat("fr-MA").format(product.reviewCount)} avis
          </a>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-sm text-muted-foreground">{new Intl.NumberFormat("fr-MA").format(product.soldCount)} vendus</span>
          {product.featured && (
            <span className="badge badge-gold flex items-center gap-1">
              <Crown className="h-2.5 w-2.5" /> Premium
            </span>
          )}
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3 py-1">
        <span className="font-display text-4xl font-bold text-brand-700 dark:text-brand-400">{formatPrice(currentPrice)}</span>
        {product.comparePrice && product.comparePrice > currentPrice && (
          <>
            <span className="text-xl text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
            <span className="badge badge-sale">-{discount}%</span>
          </>
        )}
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2 text-sm">
        {isOutOfStock ? (
          <span className="flex items-center gap-1.5 font-semibold text-red-500"><AlertTriangle className="h-4 w-4" /> Rupture de stock</span>
        ) : isLowStock ? (
          <span className="flex items-center gap-1.5 font-semibold text-amber-600"><AlertTriangle className="h-4 w-4" /> Seulement {currentStock} restants !</span>
        ) : (
          <span className="flex items-center gap-1.5 font-semibold text-brand-700 dark:text-brand-400"><Check className="h-4 w-4" /> En stock ({currentStock} disponibles)</span>
        )}
      </div>

      {/* Variants */}
      {Object.entries(variantGroups).map(([groupName, variants]) => (
        <div key={groupName} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{groupName} :</span>
            {selectedVariants[groupName] && (
              <span className="text-sm text-muted-foreground">{selectedVariants[groupName].label}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {groupName === "Color" ? (
              variants.map((v) => (
                <button key={v.id}
                  onClick={() => setSelectedVariants((p) => ({ ...p, [groupName]: v }))}
                  disabled={v.stock === 0}
                  title={v.label}
                  className={`relative h-9 w-9 rounded-full transition-all ${
                    selectedVariants[groupName]?.id === v.id
                      ? "ring-2 ring-offset-2 ring-brand-700 scale-110"
                      : "ring-1 ring-border hover:ring-brand-400"
                  } ${v.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                  style={{ backgroundColor: v.value }}
                >
                  {selectedVariants[groupName]?.id === v.id && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                  )}
                </button>
              ))
            ) : (
              variants.map((v) => (
                <button key={v.id}
                  onClick={() => setSelectedVariants((p) => ({ ...p, [groupName]: v }))}
                  disabled={v.stock === 0}
                  className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all ${
                    selectedVariants[groupName]?.id === v.id
                      ? "border-brand-700 bg-brand-700 text-white shadow-brand"
                      : "border-border hover:border-brand-500 hover:text-brand-700"
                  } ${v.stock === 0 ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                >
                  {v.label}
                </button>
              ))
            )}
          </div>
        </div>
      ))}

      {/* Quantity */}
      <div className="space-y-2.5">
        <span className="text-sm font-bold text-foreground">Quantité :</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center overflow-hidden rounded-xl border-2 border-border bg-white dark:bg-card">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-11 w-11 items-center justify-center hover:bg-muted transition-colors">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-base font-bold">{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
              disabled={quantity >= currentStock}
              className="flex h-11 w-11 items-center justify-center hover:bg-muted transition-colors disabled:opacity-40">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-muted-foreground">
            Total : <strong className="text-brand-700 dark:text-brand-400">{formatPrice(currentPrice * quantity)}</strong>
          </span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-3">
        <motion.button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          whileTap={{ scale: 0.99 }}
          className={`btn btn-primary btn-lg flex-1 justify-center font-display text-[0.95rem] tracking-wide ${isAdding ? "loading" : ""} ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span key="added" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2">
                <Check className="h-5 w-5" /> Ajouté !
              </motion.span>
            ) : (
              <motion.span key="add" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Ajouter au panier
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <button onClick={() => addWishlist(product)}
          style={{ width: "52px", height: "52px" }}
          className={`flex flex-shrink-0 items-center justify-center rounded-xl border-2 transition-all ${
            inWishlist ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500" : "border-border hover:border-red-400 hover:text-red-500"
          }`}>
          <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
        </button>

        <button onClick={handleShare}
          style={{ width: "52px", height: "52px" }}
          className="flex flex-shrink-0 items-center justify-center rounded-xl border-2 border-border hover:bg-muted transition-all">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Buy now */}
      {!isOutOfStock && (
        <Link href="/checkout" onClick={() => addItem(product, quantity, selectedVariant)}
          className="btn btn-gold btn-lg w-full justify-center font-display text-[0.95rem] tracking-wide">
          Acheter maintenant
        </Link>
      )}

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        {[
          { icon: Truck, title: "Livraison rapide", sub: "Partout au Maroc" },
          { icon: Shield, title: "Paiement sécurisé", sub: "CMI · Stripe SSL" },
          { icon: RefreshCw, title: "Retours faciles", sub: "30 jours" },
        ].map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex flex-col items-center gap-1.5 rounded-xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card p-3 text-center"
            style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
            <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold leading-tight text-foreground">{title}</span>
            <span className="text-[10px] text-muted-foreground">{sub}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-t border-gold-200/40 dark:border-gold-800/20 pt-6">
        <div className="flex gap-0 border-b border-border mb-5">
          {(["description", "specs", "shipping"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                tab === t ? "border-brand-700 text-brand-700 dark:border-brand-400 dark:text-brand-400" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {tab === "description" && (
              <div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                {product.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Link key={tag} href={`/search?q=${tag}`} className="badge badge-emerald text-[10px]">#{tag}</Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            {tab === "specs" && (
              <div className="space-y-0 divide-y divide-border/50">
                {[
                  { label: "SKU", value: product.sku },
                  { label: "Catégorie", value: product.category.name },
                  { label: "Poids", value: product.weight ? `${product.weight} kg` : "—" },
                  ...(product.variants.length > 0 ? [{ label: "Variantes", value: product.variants.map((v) => v.label).join(", ") }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-3 text-sm">
                    <span className="text-muted-foreground font-medium">{label}</span>
                    <span className="font-semibold text-foreground text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "shipping" && (
              <div className="space-y-3 text-sm">
                {[
                  { icon: Truck, title: "Livraison standard", desc: "3-5 jours ouvrés · Gratuite dès 500 MAD · Sinon 35 MAD" },
                  { icon: Package, title: "Livraison express", desc: "24-48h · À partir de 60 MAD · Disponible dans les grandes villes" },
                  { icon: RefreshCw, title: "Retours & échanges", desc: "30 jours pour retourner tout article inutilisé dans son emballage d'origine." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 rounded-xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card p-4">
                    <Icon className="h-5 w-5 mt-0.5 text-brand-700 dark:text-brand-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground mb-1">{title}</p>
                      <p className="text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
