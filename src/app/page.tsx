// src/app/page.tsx — NexMart Moroccan Luxury Homepage
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
import { getHomePageData } from "@/lib/home-data";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "NexMart Maroc — Marketplace Premium",
  description:
    "Découvrez la marketplace premium du Maroc — artisanat authentique, produits sélectionnés par IA, paiement sécurisé et livraison express.",
};

export default async function HomePage() {
  const { featured, trending, categories, flashSale } = await getHomePageData();

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="container-main py-5 md:py-8">
        <HeroSection />
      </section>

      {/* Flash Sale — dark moroccan bg */}
      {flashSale.length > 0 && (
        <section className="relative overflow-hidden bg-moroccan-navy py-14 md:py-20">
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

      {/* Promo Banners */}
      <section className="section bg-surface/60">
        <div className="container-main">
          <PromoBanner />
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container-main">
          <Suspense fallback={<SkeletonGrid count={8} />}>
            <FeaturedProducts products={featured as any} />
          </Suspense>
        </div>
      </section>

      {/* Trending — subtle sand bg with Moroccan pattern */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-surface/50" />
        <div className="absolute inset-0 moroccan-zellige-bg opacity-20" />
        <div className="relative container-main">
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
      <section className="section relative overflow-hidden bg-surface/60">
        <div className="absolute inset-0 moroccan-pattern-bg opacity-15" />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(15,118,110,0.06) 0%, transparent 70%)"
        }} />
        <div className="relative container-main">
          <WhyNexMart />
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}
