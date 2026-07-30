"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag, Sparkles, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import {
  EDITORS_CHOICE_COLLECTION_URL,
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

export default function EditorsChoiceCollectionPage() {
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
        console.error("Error fetching Editor's Choice collection:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const copy = useMemo(() => getEditorsChoiceSectionCopy(section), [section]);

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

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.98),_rgba(250,245,235,0.96)_42%,_rgba(244,238,228,0.94)_100%)]">
        <div className="container-main py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                {EDITORS_CHOICE_DEFAULTS.bannerBadge}
              </span>
              <div>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground">
                  {copy.title}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                  {copy.subtitle}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {section?.description ||
                    "Discover premium marketplace products curated for a more refined shopping experience, from iconic electronics to elevated lifestyle essentials."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm"
                >
                  Back Home
                </Link>
                <Link
                  href={copy.destinationUrl || EDITORS_CHOICE_COLLECTION_URL}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-brand-700"
                >
                  Browse Selection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
              <Image
                src={copy.bannerImage || EDITORS_CHOICE_DEFAULTS.bannerImage}
                alt="Editor's Choice collection banner"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-main py-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[340px] animate-pulse rounded-[1.75rem] border border-border bg-card" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[2rem] border border-border bg-card px-6 py-20 text-center shadow-sm">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60" />
            <h2 className="text-2xl font-semibold text-foreground">Editor&apos;s Choice is being curated</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The NexMart team has not published products for this collection yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product, index) => {
              const discount = calculateDiscount(product);
              const brand = deriveBrandLabel(product);

              return (
                <article
                  key={product.id}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/80 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]"
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
                    <div className="relative h-44 w-full overflow-hidden rounded-[1.15rem]">
                      <Image
                        src={getEditorsChoiceImage(product, index)}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
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
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
