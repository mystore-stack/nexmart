"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import { ProductGrid } from "@/components/product/ProductCard";
import type { Product } from "@/types";
import {
  EDITORS_CHOICE_COLLECTION_URL,
  EDITORS_CHOICE_DEFAULTS,
  EDITORS_CHOICE_SECTION_KEY,
  EditorsChoiceProduct,
  EditorsChoiceSectionData,
  getEditorsChoiceSectionCopy,
  getEditorsChoiceImage
} from "@/lib/editors-choice";

type EditorsChoiceResponse = {
  success?: boolean;
  data?: EditorsChoiceProduct[];
  section?: EditorsChoiceSectionData | null;
};

const CATEGORIES = ["Tous", "Beauté", "Tech", "Maison", "Mode", "Lifestyle"];
const EDITORIAL_LABELS = ["Notre favori", "Le choix de l'équipe", "À découvrir"];

function mapToFullProduct(product: EditorsChoiceProduct): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || product.name,
    price: product.price,
    comparePrice: product.comparePrice || undefined,
    images: product.images,
    categoryId: product.category?.id || "editors-choice",
    category: product.category || { id: "editors-choice", name: "Editor's Choice", slug: "editors-choice", organizationId: "" },
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
    organizationId: "",
    isVisible: true,
    displayOrder: 0
  };
}

export default function EditorsChoiceCollectionPage() {
  const [products, setProducts] = useState<EditorsChoiceProduct[]>([]);
  const [section, setSection] = useState<EditorsChoiceSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tous");
  
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

  const featuredProducts = products.slice(0, 3);
  const gridProducts = products.slice(3); // The rest of the products

  const fullGridProducts = gridProducts.map(mapToFullProduct);
  
  // Category filtering
  const filteredProducts = useMemo(() => {
    if (activeCategory === "Tous") return fullGridProducts;
    return fullGridProducts.filter(p => {
      const catName = p.category?.name?.toLowerCase() || "";
      const searchCat = activeCategory.toLowerCase();
      // Simple matching for our demo purposes
      if (searchCat === "tech" && (catName.includes("tech") || catName.includes("électronique") || catName.includes("electronics"))) return true;
      if (searchCat === "beauté" && (catName.includes("beauté") || catName.includes("beauty") || catName.includes("parfum"))) return true;
      if (searchCat === "maison" && (catName.includes("maison") || catName.includes("home"))) return true;
      if (searchCat === "mode" && (catName.includes("mode") || catName.includes("fashion") || catName.includes("vêtement"))) return true;
      if (searchCat === "lifestyle" && (catName.includes("lifestyle") || catName.includes("accessoire"))) return true;
      // Exact match fallback
      return catName.includes(searchCat);
    });
  }, [fullGridProducts, activeCategory]);

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
                  Editor's Choice
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                  Nos meilleures découvertes, sélectionnées avec soin.
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

      <section className="container-main py-12">
        {featuredProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-8 font-display text-2xl font-bold tracking-tight text-foreground">
              Nos coups de cœur
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {featuredProducts.map((product, index) => (
                <div key={product.id} className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
                    <Image
                      src={getEditorsChoiceImage(product, index)}
                      alt={product.name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-700 shadow-sm backdrop-blur">
                      {EDITORIAL_LABELS[index] || EDITORIAL_LABELS[0]}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold text-foreground transition-colors group-hover:text-brand-700">{product.name}</h3>
                    </Link>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {product.description || "Un produit d'exception sélectionné pour sa qualité et son design unique."}
                    </p>
                    <div className="mt-4 flex items-end justify-between gap-4 mt-auto">
                      <div>
                        <span className="text-lg font-bold text-foreground">{product.price.toLocaleString("fr-MA")} DH</span>
                        {product.comparePrice && (
                          <span className="ml-2 text-xs text-muted-foreground line-through">{product.comparePrice.toLocaleString("fr-MA")} DH</span>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          addItem(mapToFullProduct(product), 1);
                          toast.success(`${product.name} added to cart`);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-white transition-colors hover:bg-brand-700"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Nos sélections
          </h2>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeCategory === cat 
                  ? "bg-foreground text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <ProductGrid products={filteredProducts} loading={loading} columns={4} />
      </section>
    </div>
  );
}
