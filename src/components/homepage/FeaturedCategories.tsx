"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import {
  luxuryCategories,
  LuxurySectionHeader,
  type CategoryHighlight,
} from "@/components/homepage/luxury-homepage-shared";
import type { CategoryCardData } from "@/lib/map-home-products";

type FeaturedCategoriesProps = {
  categories?: CategoryCardData[];
};

function mapCatalogToLuxury(categories: CategoryCardData[]): CategoryHighlight[] {
  return categories.slice(0, 4).map((cat, index) => ({
    id: cat.id,
    name: cat.name,
    href: cat.href,
    image: luxuryCategories[index % luxuryCategories.length].image,
    description: `${cat.count > 0 ? `${cat.count} pièces` : "Sélection curatoriale"} · ${cat.name}`,
    stats: cat.count > 0 ? `${cat.count} articles` : "Collection signature",
    accent: luxuryCategories[index % luxuryCategories.length].accent,
  }));
}

function CategoryTile({
  category,
  featured = false,
  index,
}: {
  category: CategoryHighlight;
  featured?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={featured ? "sm:col-span-2 sm:row-span-2" : ""}
    >
      <Link
        href={category.href}
        className={`group relative block overflow-hidden rounded-[34px] border border-stone-200 bg-stone-100 shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-luxury-lg ${
          featured ? "min-h-[420px] sm:min-h-full" : "min-h-[280px]"
        }`}
      >
        <div className="relative inset-0">
          <ImageWithFallback
          src={category.image}
          fallbackSrc="/assets/hero-fallback.svg"
          alt={category.name}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        </div>
        <div className={`absolute inset-0 bg-gradient-to-t ${category.accent} opacity-30 mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/82 via-stone-950/20 to-stone-950/10" />

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f0d69d]">
                {category.stats}
              </p>
              <h3
                className={`mt-3 font-display font-semibold tracking-[-0.03em] text-white ${
                  featured ? "text-4xl sm:text-5xl" : "text-3xl"
                }`}
              >
                {category.name}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/78">{category.description}</p>
            </div>
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white backdrop-blur transition group-hover:bg-white group-hover:text-stone-950">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ categories = [] }) => {
  const items =
    categories.length > 0 ? mapCatalogToLuxury(categories) : luxuryCategories;

  return (
    <section className="bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f2_100%)] py-20 lg:py-24">
      <div className="container-main">
        <LuxurySectionHeader
          eyebrow="Catégories"
          title="Quatre univers, une même exigence."
          description="Mode, maison, bijoux et bien-être — chaque catégorie ouvre un chapitre visuel distinct, pensé pour inspirer et guider sans surcharge."
          actionHref="/collections"
          actionLabel="Toutes les catégories"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {items.map((category, index) => (
            <CategoryTile
              key={category.id}
              category={category}
              featured={index === 0}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

FeaturedCategories.displayName = "FeaturedCategories";

export default React.memo(FeaturedCategories);
