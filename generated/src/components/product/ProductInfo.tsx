"use client";
// src/components/product/ProductInfo.tsx
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Heart, Share2, Star, Truck, Shield, RefreshCw,
  Minus, Plus, Check, AlertTriangle, Package
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/index";
import { formatPrice, discountPercentage } from "@/utils/format";
import type { Product, ProductVariant } from "@/types";

interface Props { product: Product }

export function ProductInfo({ product }: Props) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<"description" | "specs" | "shipping">("description");

  const { addItem } = useCartStore();
  const { addItem: addWishlist, hasItem } = useWishlistStore();

  const inWishlist = hasItem(product.id);
  const discount = product.comparePrice ? discountPercentage(product.price, product.comparePrice) : 0;

  // Group variants by name
  const variantGroups = product.variants.reduce((acc, variant) => {
    if (!acc[variant.name]) acc[variant.name] = [];
    acc[variant.name].push(variant);
    return acc;
  }, {} as Record<string, ProductVariant[]>);

  const selectedVariant = Object.values(selectedVariants)[0];
  const currentPrice = selectedVariant?.price ?? product.price;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= product.lowStockAt;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category */}
      <Link
        href={`/products?category=${product.category.slug}`}
        className="text-xs font-semibold text-brand-500 uppercase tracking-wider hover:text-brand-600"
      >
        {product.category.name}
      </Link>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>

      {/* Rating */}
      {product.reviewCount > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= Math.round(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30 fill-muted-foreground/10"}`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
          <a href="#reviews" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {product.reviewCount.toLocaleString()} reviews
          </a>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-sm text-muted-foreground">{product.soldCount.toLocaleString()} sold</span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{formatPrice(currentPrice)}</span>
        {product.comparePrice && product.comparePrice > currentPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
            <span className="badge badge-error text-sm font-bold">-{discount}% OFF</span>
          </>
        )}
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2 text-sm">
        {isOutOfStock ? (
          <>
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-red-500 font-medium">Out of Stock</span>
          </>
        ) : isLowStock ? (
          <>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-orange-500 font-medium">Only {currentStock} left in stock!</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">In Stock</span>
            <span className="text-muted-foreground">({currentStock} available)</span>
          </>
        )}
      </div>

      {/* Variants */}
      {Object.entries(variantGroups).map(([groupName, variants]) => (
        <div key={groupName} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              {groupName}:
              {selectedVariants[groupName] && (
                <span className="font-normal text-muted-foreground ml-2">
                  {selectedVariants[groupName].label}
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {groupName === "Color" ? (
              variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariants((prev) => ({ ...prev, [groupName]: variant }))}
                  disabled={variant.stock === 0}
                  className={`relative w-9 h-9 rounded-full transition-all ${
                    selectedVariants[groupName]?.id === variant.id
                      ? "ring-2 ring-offset-2 ring-foreground"
                      : "ring-1 ring-border hover:ring-foreground/50"
                  } ${variant.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                  style={{ backgroundColor: variant.value }}
                  title={variant.label}
                  aria-label={`${variant.name}: ${variant.label}`}
                >
                  {selectedVariants[groupName]?.id === variant.id && (
                    <Check className="w-4 h-4 absolute inset-0 m-auto text-white drop-shadow" />
                  )}
                </button>
              ))
            ) : (
              variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariants((prev) => ({ ...prev, [groupName]: variant }))}
                  disabled={variant.stock === 0}
                  className={`px-4 py-2 text-sm rounded-xl border-2 font-medium transition-all ${
                    selectedVariants[groupName]?.id === variant.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/50"
                  } ${variant.stock === 0 ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                >
                  {variant.label}
                </button>
              ))
            )}
          </div>
        </div>
      ))}

      {/* Quantity */}
      <div className="space-y-2">
        <span className="text-sm font-semibold">Quantity:</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0 border-2 border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-11 h-11 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
              disabled={quantity >= currentStock}
              className="w-11 h-11 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-muted-foreground">
            Total: <strong>{formatPrice(currentPrice * quantity)}</strong>
          </span>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3">
        <motion.button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          whileTap={{ scale: 0.97 }}
          className={`flex-1 btn-primary py-3.5 text-base justify-center relative overflow-hidden ${
            isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                <Check className="w-5 h-5" /> Added to Cart!
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <button
          onClick={() => addWishlist(product)}
          className={`w-13 h-13 flex items-center justify-center rounded-xl border-2 transition-all ${
            inWishlist
              ? "border-red-500 bg-red-50 text-red-500 dark:bg-red-900/20"
              : "border-border hover:border-red-400 hover:text-red-500"
          }`}
          style={{ width: "52px", height: "52px" }}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`} />
        </button>

        <button
          onClick={handleShare}
          className="w-13 h-13 flex items-center justify-center rounded-xl border-2 border-border hover:bg-muted transition-all"
          style={{ width: "52px", height: "52px" }}
          aria-label="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Buy now */}
      {!isOutOfStock && (
        <Link
          href="/checkout"
          onClick={() => addItem(product, quantity, selectedVariant)}
          className="btn-brand w-full py-3.5 text-base justify-center"
        >
          Buy Now
        </Link>
      )}

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { icon: Truck, title: "Free Shipping", sub: "Orders over $50" },
          { icon: Shield, title: "Secure Payment", sub: "100% protected" },
          { icon: RefreshCw, title: "Easy Returns", sub: "30 day window" },
        ].map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 text-center">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-semibold leading-tight">{title}</span>
            <span className="text-[10px] text-muted-foreground">{sub}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-t border-border pt-6">
        <div className="flex gap-0 border-b border-border mb-6">
          {(["description", "specs", "shipping"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-all -mb-px ${
                tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "description" && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 not-prose">
                    {product.tags.map((tag) => (
                      <Link key={tag} href={`/search?q=${tag}`} className="badge badge-brand text-xs">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            {tab === "specs" && (
              <div className="space-y-3">
                {[
                  { label: "SKU", value: product.sku },
                  { label: "Category", value: product.category.name },
                  { label: "Weight", value: product.weight ? `${product.weight} kg` : "—" },
                  ...(product.variants.length > 0
                    ? [{ label: "Available Variants", value: product.variants.map((v) => v.label).join(", ") }]
                    : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-border/50 text-sm">
                    <span className="text-muted-foreground font-medium">{label}</span>
                    <span className="font-medium text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "shipping" && (
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                  <Package className="w-5 h-5 mt-0.5 text-foreground flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">Standard Shipping</p>
                    <p>5-7 business days · Free on orders over $50 · Otherwise $9.99</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                  <Truck className="w-5 h-5 mt-0.5 text-foreground flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">Express Shipping</p>
                    <p>2-3 business days · Starting from $14.99</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                  <RefreshCw className="w-5 h-5 mt-0.5 text-foreground flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">Returns</p>
                    <p>30-day return window. Items must be unused and in original packaging.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
