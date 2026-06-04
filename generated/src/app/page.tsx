// src/app/page.tsx — NexMart Homepage
import { Suspense } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrendingSection } from "@/components/home/TrendingSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { RecentlyViewedSection } from "@/components/home/RecentlyViewedSection";
import { WhyNexMart } from "@/components/home/WhyNexMart";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const revalidate = 300; // ISR every 5 min

export const metadata: Metadata = {
  title: "NexMart — Marketplace Premium du Maroc 🇲🇦",
  description:
    "Découvrez des millions de produits : mode, électronique, artisanat marocain et plus. Livraison rapide partout au Maroc avec paiement sécurisé.",
};

async function getHomeData() {
  const [featured, trending, categories, flashSale] = await Promise.all([
    prisma.product.findMany({
      where: { published: true, featured: true },
      include: { category: true, variants: true },
      orderBy: { soldCount: "desc" },
      take: 12,
    }),
    prisma.product.findMany({
      where: { published: true, stock: { gt: 0 } },
      include: { category: true, variants: true },
      orderBy: [{ soldCount: "desc" }, { rating: "desc" }],
      take: 8,
    }),
    prisma.category.findMany({
      where: { parentId: null },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { published: true, comparePrice: { not: null }, stock: { gt: 0 } },
      include: { category: true, variants: true },
      orderBy: { soldCount: "desc" },
      take: 6,
    }),
  ]);

  return { featured, trending, categories, flashSale };
}

export default async function HomePage() {
  const { featured, trending, categories, flashSale } = await getHomeData();

  return (
    <div className="page-enter">
      {/* Hero Carousel */}
      <section className="container-main py-6 md:py-8">
        <HeroSection />
      </section>

      {/* Flash Sale */}
      {flashSale.length > 0 && (
        <section className="section bg-foreground text-background moroccan-pattern">
          <div className="container-main">
            <FlashSaleSection products={flashSale as any} />
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="section">
        <div className="container-main">
          <CategoriesSection categories={categories as any} />
        </div>
      </section>

      {/* Featured Products */}
      <section className="section bg-surface">
        <div className="container-main">
          <Suspense fallback={<SkeletonGrid count={12} />}>
            <FeaturedProducts products={featured as any} />
          </Suspense>
        </div>
      </section>

      {/* Promo Banners */}
      <section className="section">
        <div className="container-main">
          <PromoBanner />
        </div>
      </section>

      {/* Trending */}
      <section className="section bg-surface">
        <div className="container-main">
          <Suspense fallback={<SkeletonGrid count={8} />}>
            <TrendingSection products={trending as any} />
          </Suspense>
        </div>
      </section>

      {/* Recently Viewed */}
      <section className="section">
        <div className="container-main">
          <RecentlyViewedSection />
        </div>
      </section>

      {/* Why NexMart */}
      <section className="section bg-surface moroccan-pattern">
        <div className="container-main">
          <WhyNexMart />
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}
