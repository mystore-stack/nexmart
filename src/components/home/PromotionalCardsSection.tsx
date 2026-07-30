"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart, ShoppingBag, Sparkles, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import {
  EDITORS_CHOICE_DEFAULTS,
  EDITORS_CHOICE_SECTION_KEY,
  EditorsChoiceProduct,
  EditorsChoiceSectionData,
  calculateDiscount,
  deriveBrandLabel,
  getEditorsChoiceImage,
  getEditorsChoiceSectionCopy,
} from "@/lib/editors-choice";

type EditorsChoiceResponse = {
  success?: boolean;
  data?: EditorsChoiceProduct[];
  section?: EditorsChoiceSectionData | null;
};

export function PromotionalCardsSection() {
  const [products, setProducts] = useState<EditorsChoiceProduct[]>([]);
  const [section, setSection] = useState<EditorsChoiceSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetch(`/api/homepage/sections/${EDITORS_CHOICE_SECTION_KEY}/products`)
      .then((res) => res.json())
      .then((payload: EditorsChoiceResponse) => {
        if (payload.success) {
          setProducts(Array.isArray(payload.data) ? payload.data : []);
          setSection(payload.section || null);
        }
      })
      .catch((error) => {
        console.error("Error fetching editor's choice products:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const copy = useMemo(() => getEditorsChoiceSectionCopy(section), [section]);
  const visibleProducts = useMemo(() => {
    const limit = section?.maxProducts || EDITORS_CHOICE_DEFAULTS.maxProducts;
    return products.slice(0, limit);
  }, [products, section?.maxProducts]);

  const toggleWishlist = (id: string, name: string) => {
    setWishlist((prev) => {
      const nextState = !prev[id];
      toast.success(nextState ? `Saved to wishlist: ${name}` : "Removed from wishlist");
      return { ...prev, [id]: nextState };
    });
  };

  const handleAddToCart = (product: EditorsChoiceProduct) => {
    const fullProduct: Product = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || product.name,
      price: product.price,
      comparePrice: product.comparePrice || undefined,
      images: product.images,
      categoryId: product.category?.id || "editors-choice",
      category: product.category || { id: "editors-choice", name: "Editor's Choice", slug: "editors-choice" },
      tags: product.tags || ["editors-choice"],
      sku: product.slug,
      stock: product.stock,
      lowStockAt: 2,
      published: true,
      featured: true,
      rating: product.rating,
      reviewCount: product.reviewCount,
      soldCount: product.soldCount,
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(fullProduct, 1);
    toast.success(`${product.name} added to cart`);
  };

  if (!loading && section?.active === false) {
    return null;
  }

  if (!loading && section?.hideIfEmpty && visibleProducts.length === 0) {
    return null;
  }

  return (
    <section className="my-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Curated Luxury Picks
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {copy.subtitle}
          </p>
        </div>

        <Link
          href={copy.destinationUrl}
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-brand-700"
        >
          {copy.viewAllButton}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.4fr)]">
          <div className="min-h-[520px] animate-pulse rounded-[2rem] border border-border bg-card" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[252px] animate-pulse rounded-[1.75rem] border border-border bg-card" />
            ))}
          </div>
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="rounded-[2rem] border border-border bg-card px-6 py-16 text-center shadow-sm">
          <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60" />
          <h3 className="text-xl font-semibold text-foreground">No products selected yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add products from the Editor&apos;s Choice admin page to publish this section.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.4fr)]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="group relative overflow-hidden rounded-[2rem] border border-amber-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(250,245,235,0.95)_42%,_rgba(242,232,215,0.95)_100%)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(255,255,255,0.25),rgba(245,158,11,0.08))]" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-white/80 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700 shadow-sm backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  {EDITORS_CHOICE_DEFAULTS.bannerBadge}
                </span>

                <div className="space-y-3">
                  <h3 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
                    A premium edit for elevated everyday shopping.
                  </h3>
                  <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                    {section?.description ||
                      "Luxury lifestyle finds, standout electronics, and refined essentials selected to bring a high-end marketplace feel to every visit."}
                  </p>
                </div>

                <Link
                  href={copy.destinationUrl}
                  className="btn-outline inline-flex h-12 items-center gap-2 px-5 text-sm font-semibold"
                >
                  {EDITORS_CHOICE_DEFAULTS.ctaText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="relative min-h-[280px] overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/60 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <Image
                  src={copy.bannerImage}
                  alt="Editor's Choice luxury promotional banner"
                  fill
                  sizes="(max-width: 1280px) 100vw, 38vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent p-5">
                  <div className="rounded-[1.25rem] border border-white/20 bg-black/20 px-4 py-3 text-white backdrop-blur-md">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/75">Luxury Marketplace</p>
                    <p className="mt-1 text-lg font-semibold">White and gold editorial styling with studio-quality product focus.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product, index) => {
              const discount = calculateDiscount(product);
              const brand = deriveBrandLabel(product);

              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.28, delay: index * 0.04 }}
                  whileHover={{ y: -6 }}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/80 bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {discount > 0 && (
                        <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                          -{discount}%
                        </span>
                      )}
                      {product.customBadge && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                          {product.customBadge}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id, product.name)}
                      className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white/90 text-muted-foreground shadow-sm transition-all hover:border-rose-200 hover:text-rose-500"
                      aria-label={`Add ${product.name} to wishlist`}
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          wishlist[product.id] ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <Link
                    href={`/products/${product.slug}`}
                    className="relative mb-4 block overflow-hidden rounded-[1.35rem] bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.7))] p-4"
                  >
                    <div className="relative h-40 w-full overflow-hidden rounded-[1.15rem]">
                      <Image
                        src={getEditorsChoiceImage(product, index)}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 20vw"
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {brand}
                    </p>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-foreground transition-colors group-hover:text-brand-700">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-3 flex items-center gap-1.5 text-xs">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({product.reviewCount})</span>
                    </div>

                    <div className="mt-3 flex items-end gap-2">
                      <span className="text-lg font-semibold tracking-tight text-foreground">
                        {product.price.toLocaleString("fr-MA")} DH
                      </span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {product.comparePrice.toLocaleString("fr-MA")} DH
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-foreground text-sm font-semibold text-white transition-all hover:translate-y-[-1px] hover:bg-brand-700"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Quick Add to Cart
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
