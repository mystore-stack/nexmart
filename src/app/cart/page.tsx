"use client";
// src/app/cart/page.tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Plus, Minus, Trash2, Tag, ArrowRight,
  Shield, Truck, RefreshCw, ChevronRight
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/utils/format";
import toast from "react-hot-toast";

export default function CartPage() {
  const {
    items, removeItem, updateQuantity, clearCart,
    coupon, applyCoupon, removeCoupon,
    getSubtotal, getDiscount, getTotal,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();
  const shipping = total >= 50 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;
  const freeLivraisonProgress = Math.min(100, (total / 50) * 100);

  // Automatic cart cleanup on page load
  useEffect(() => {
    const cleanupCart = async () => {
      if (isCleaningUp) return;
      setIsCleaningUp(true);

      try {
        const cleanupRes = await fetch("/api/cart", {
          method: "DELETE",
        });
        const cleanupData = await cleanupRes.json();
        console.log("Cart cleanup response:", cleanupData);

        if (cleanupData.success && cleanupData.removedCount > 0) {
          // Refresh cart from database
          const cartRes = await fetch("/api/cart");
          const cartData = await cartRes.json();

          if (cartData.success && cartData.items) {
            // Clear local cart and sync with database
            clearCart();

            // Rebuild cart from database items
            cartData.items.forEach((dbItem: any) => {
              const cartStore = useCartStore.getState();
              cartStore.addItem(
                dbItem.product,
                dbItem.quantity,
                dbItem.variant || undefined
              );
            });

            toast.success(`Removed ${cleanupData.removedCount} unavailable item(s) from your cart.`);
          }
        }
      } catch (error) {
        console.error("Cart cleanup error:", error);
        // Silently fail - don't show error to user on page load
      } finally {
        setIsCleaningUp(false);
      }
    };

    cleanupCart();
  }, []); // Run once on mount

  const handleCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        applyCoupon(data.data);
        setCouponInput("");
      } else {
        toast.error(data.error || "Invalid coupon code");
      }
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="border-b border-border bg-surface">
        <div className="container-main py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Mon Panier
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {items.reduce((s, i) => s + i.quantity, 0)} items in your cart
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={() => { clearCart(); toast("Cart cleared"); }}
                className="btn-ghost text-sm text-muted-foreground"
              >
                Clear cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/40" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
            <p className="text-muted-foreground mb-8">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link href="/products" className="btn-primary px-8 py-3.5">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Gratuite shipping progress */}
              {shipping > 0 && (
                <div className="rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Truck className="w-4 h-4 text-brand-500" />
                      {freeLivraisonProgress < 100
                        ? (
                            <span>
                              Add <strong>{formatPrice(50 - total)}</strong> more for free shipping
                            </span>
                          )
                        : (
                            <span className="text-green-600">You&apos;ve unlocked free shipping! 🎉</span>
                          )
                      }
                    </div>
                    <span className="text-xs text-muted-foreground">{Math.round(freeLivraisonProgress)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${freeLivraisonProgress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}

              {/* Items list */}
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const price = item.variant?.price ?? item.product.price;
                  const maxStock = item.variant?.stock ?? item.product.stock;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 80, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card p-4 md:p-5 flex gap-4"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                        <Image
                          src={item.product.images[0] || "/placeholder.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="font-medium text-sm md:text-base line-clamp-2 hover:text-brand-500 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {item.variant && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.variant.name}: <span className="font-medium">{item.variant.label}</span>
                          </p>
                        )}

                        {item.product.stock <= item.product.lowStockAt && item.product.stock > 0 && (
                          <p className="text-xs text-orange-500 font-medium mt-1">
                            Only {maxStock} left!
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity */}
                          <div className="flex items-center gap-0 border border-border rounded-xl overflow-hidden h-8">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= maxStock}
                              className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="font-bold">{formatPrice(price * item.quantity)}</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">{formatPrice(price)} each</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Continue shopping */}
              <Link
                href="/products"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
              >
                ← Continuer les achats
              </Link>
            </div>

            {/* Récapitulatif */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card p-6 sticky top-24 space-y-5">
                <h2 className="font-bold text-lg">Récapitulatif</h2>

                {/* Coupon */}
                <div>
                  {coupon ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-semibold text-green-700 dark:text-green-400">{coupon.code}</p>
                          <p className="text-xs text-green-600 dark:text-green-500">{coupon.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Promo Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="input py-2.5 text-sm flex-1"
                          onKeyDown={(e) => e.key === "Enter" && handleCoupon()}
                        />
                        <button
                          onClick={handleCoupon}
                          disabled={couponLoading || !couponInput.trim()}
                          className="btn-outline py-2.5 px-4 text-sm font-semibold"
                        >
                          {couponLoading ? (
                            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          ) : "Apply"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sous-total ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount</span>
                      <span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                      {shipping === 0 ? "FREE" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/checkout"
                  className="w-full rounded-xl bg-green-600 text-white shadow-sm hover:bg-green-500 transition-all duration-200 py-3.5 text-base font-semibold flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                  prefetch={true}
                >
                  <span className="inline-flex items-center gap-2">
                    Passer à la caisse
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>

                {/* Trust */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { icon: Shield, label: "Secure" },
                    { icon: Truck, label: "Fast Ship" },
                    { icon: RefreshCw, label: "Returns" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
