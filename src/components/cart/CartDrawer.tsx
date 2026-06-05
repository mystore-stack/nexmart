"use client";
// src/components/cart/CartDrawer.tsx — Moroccan Luxury Cart
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, Tag, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/utils/format";

export function CartDrawer() {
  const {
    items, isOpen, closeCart, removeItem, updateQuantity,
    coupon, removeCoupon, getSubtotal, getDiscount, getTotal,
  } = useCartStore();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();
  const freeShippingThreshold = 500;
  const shipping = total >= freeShippingThreshold ? 0 : 35;
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-moroccan-navy/55 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[420px] flex flex-col bg-moroccan-sand dark:bg-moroccan-navy border-l border-gold-200/40 dark:border-gold-800/20 shadow-[0_0_80px_rgba(15,23,42,0.3)]"
          >
            {/* Moroccan pattern overlay */}
            <div className="absolute inset-0 moroccan-pattern-bg opacity-8 pointer-events-none" />

            {/* Gold top line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 py-5 border-b border-gold-200/30 dark:border-gold-800/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 shadow-brand">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">Mon Panier</h2>
                  <p className="text-xs text-muted-foreground">
                    {items.reduce((s, i) => s + i.quantity, 0)} article{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Fermer le panier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free shipping bar */}
            {shipping > 0 && (
              <div className="relative px-6 py-3.5 border-b border-gold-200/20 dark:border-gold-800/15 bg-brand-50/50 dark:bg-brand-900/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-brand-700 dark:text-brand-400">
                    <Truck className="h-3.5 w-3.5" />
                    Plus que {formatPrice(Math.max(0, freeShippingThreshold - subtotal))} pour la livraison gratuite
                  </div>
                  <span className="text-[10px] font-bold text-brand-600 dark:text-brand-500">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-brand-100 dark:bg-brand-900/40 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500"
                  />
                </div>
              </div>
            )}
            {shipping === 0 && (
              <div className="px-6 py-2.5 bg-brand-50 dark:bg-brand-900/20 border-b border-brand-100 dark:border-brand-800/30">
                <p className="flex items-center gap-2 text-xs font-bold text-brand-700 dark:text-brand-400">
                  <Truck className="h-3.5 w-3.5" />
                  Livraison gratuite appliquée !
                </p>
              </div>
            )}

            {/* Items */}
            <div className="relative flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center py-12">
                  <div className="mb-5">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto opacity-20">
                      <path d="M40 8 L72 40 L40 72 L8 40 Z" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
                      <path d="M40 20 L60 40 L40 60 L20 40 Z" stroke="#D4AF37" strokeWidth="1" fill="none" />
                      <circle cx="40" cy="40" r="8" stroke="#D4AF37" strokeWidth="1" fill="none" />
                    </svg>
                  </div>
                  <p className="font-display text-xl font-semibold text-foreground mb-2">Panier vide</p>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
                    Commencez à explorer notre collection premium pour ajouter des produits.
                  </p>
                  <Link href="/products" onClick={closeCart} className="btn btn-primary h-11 px-6 text-sm">
                    Découvrir les produits
                  </Link>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const img = item.product.images?.[0] || "/placeholder.jpg";
                    const price = item.variant?.price ?? item.product.price;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-4 py-4 border-b border-gold-200/30 dark:border-gold-800/15 last:border-0"
                      >
                        <Link href={`/products/${item.product.slug}`} onClick={closeCart} className="flex-shrink-0">
                          <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-gold-200/30 dark:border-gold-800/20 bg-muted img-zoom">
                            <Image src={img} alt={item.product.name} fill className="object-cover" />
                          </div>
                        </Link>
                        <div className="flex flex-1 min-w-0 flex-col gap-1.5">
                          <Link href={`/products/${item.product.slug}`} onClick={closeCart}
                            className="text-sm font-semibold line-clamp-2 hover:text-brand-700 dark:hover:text-brand-400 transition-colors leading-snug">
                            {item.product.name}
                          </Link>
                          {item.variant && (
                            <p className="text-xs text-muted-foreground">{item.variant.name}: {item.variant.label}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="price-main text-base">{formatPrice(price * item.quantity)}</span>
                            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white dark:bg-card px-1.5 py-1">
                              <button
                                onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                                className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                                disabled={item.quantity >= (item.variant?.stock ?? item.product.stock)}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer — only when items exist */}
            {items.length > 0 && (
              <div className="relative border-t border-gold-200/30 dark:border-gold-800/20 bg-white/60 dark:bg-card/60 backdrop-blur px-6 py-5 space-y-4">
                {/* Gold accent line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />

                {/* Trust indicators */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5">
                    <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-foreground/70">Paiement sécurisé</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5">
                    <Truck className="h-4 w-4 text-gold-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-foreground/70">Livraison rapide</span>
                  </div>
                </div>

                {/* Coupon */}
                {coupon && (
                  <div className="flex items-center justify-between rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 p-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-brand-600" />
                      <span className="text-sm font-semibold text-brand-700 dark:text-brand-400">{coupon.code} appliqué</span>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-brand-600 hover:text-brand-800 font-bold">
                      Retirer
                    </button>
                  </div>
                )}

                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-brand-600">
                      <span>Réduction</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span className={shipping === 0 ? "text-brand-600 font-bold" : ""}>{shipping === 0 ? "GRATUITE" : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2.5 border-t border-gold-200/40 dark:border-gold-800/20">
                    <span className="font-display text-lg">Total</span>
                    <span className="price-main text-lg">{formatPrice(total + shipping)}</span>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="space-y-2.5">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="btn btn-primary btn-lg w-full font-display text-[0.95rem] tracking-wide group"
                  >
                    Passer à la caisse
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="btn-outline w-full justify-center text-sm h-11 flex items-center"
                  >
                    Voir le panier complet
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
