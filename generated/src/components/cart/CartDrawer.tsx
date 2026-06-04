"use client";
// src/components/cart/CartDrawer.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Plus, Minus, Trash2, Tag, ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/utils/format";

export function CartDrawer() {
  const {
    items, isOpen, closeCart, removeItem, updateQuantity,
    coupon, removeCoupon, getSubtotal, getDiscount, getTotal,
  } = useCartStore();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();
  const shipping = total >= 50 ? 0 : 9.99;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h2 className="font-bold text-lg">Your Cart</h2>
                {items.length > 0 && (
                  <span className="badge badge-brand">{items.reduce((s, i) => s + i.quantity, 0)}</span>
                )}
              </div>
              <button onClick={closeCart} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Your cart is empty</h3>
                  <p className="text-muted-foreground text-sm">Add some products to get started</p>
                </div>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="btn-primary mt-2"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const price = item.variant?.price ?? item.product.price;
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex gap-4 p-3 rounded-xl bg-muted/40 border border-border/50"
                        >
                          {/* Image */}
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            <Image
                              src={item.product.images[0] || "/placeholder.jpg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.product.slug}`}
                              onClick={closeCart}
                              className="font-medium text-sm line-clamp-2 hover:text-brand-500 transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            {item.variant && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.variant.name}: {item.variant.label}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-bold text-sm">{formatPrice(price * item.quantity)}</span>

                              {/* Quantity controls */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                  aria-label="Decrease"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-7 text-center text-sm font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                  disabled={item.quantity >= (item.variant?.stock ?? item.product.stock)}
                                  aria-label="Increase"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="self-start p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-border px-6 py-5 space-y-4">
                  {/* Coupon */}
                  {coupon ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          {coupon.code} applied
                        </span>
                      </div>
                      <button onClick={removeCoupon} className="text-xs text-green-600 hover:text-green-800 font-medium">
                        Remove
                      </button>
                    </div>
                  ) : null}

                  {/* Shipping notice */}
                  {shipping > 0 && (
                    <div className="text-xs text-muted-foreground text-center">
                      Add {formatPrice(50 - subtotal)} more for free shipping
                      <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (subtotal / 50) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                      <span>Total</span>
                      <span>{formatPrice(total + shipping)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Link
                      href="/checkout"
                      onClick={closeCart}
                      className="btn-primary w-full justify-center text-base py-3.5"
                    >
                      Checkout
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/cart"
                      onClick={closeCart}
                      className="btn-outline w-full justify-center text-sm py-2.5"
                    >
                      View Full Cart
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
