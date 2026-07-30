// src/app/page.tsx — NexMart Moroccan Luxury Homepage
import { Fragment, Suspense, type ReactNode } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { PromotionalCardsSection } from "@/components/home/PromotionalCardsSection";
import { FlashDealsSection } from "@/components/home/FlashDealsSection";
import { ServiceBannersSection } from "@/components/home/ServiceBannersSection";
import { ShowcaseGridSection } from "@/components/home/ShowcaseGridSection";
import { BundleBuilderSection } from "@/components/home/BundleBuilderSection";
import { RecommendedForYouSection } from "@/components/home/RecommendedForYouSection";
import { BrandCarouselSection } from "@/components/home/BrandCarouselSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { MobileAppBannerSection } from "@/components/home/MobileAppBannerSection";
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
    "Découvrez la marketplace premium du Maroc — artisanat authentique, produits sélectionnés par IA, paiement à la livraison et livraison express partout au Maroc.",
};

export default async function HomePage() {
  const { featured, trending, categories, flashSale, cms } = await getHomePageData();

  const sectionMap: Record<string, React.ReactNode> = {
    hero: (
      <section className="container-main py-4 md:py-6">
        <HeroSection slides={cms.heroSlides} />
      </section>
    ),
    categories: (
      <section className="container-main">
        <CategoriesSection categories={categories as any} />
      </section>
    ),
    promotionalCards: (
      <section className="container-main">
        <PromotionalCardsSection />
      </section>
    ),
    flashDeals: (
      <section className="container-main">
        <FlashDealsSection />
      </section>
    ),
    flashSale: flashSale.length > 0 ? (
      <section className="relative overflow-hidden bg-moroccan-navy py-12">
        <div className="container-main">
          <FlashSaleSection products={flashSale as any} />
        </div>
      </section>
    ) : null,
    serviceBanners: (
      <section className="container-main">
        <ServiceBannersSection />
      </section>
    ),
    showcaseGrid: (
      <section className="container-main">
        <ShowcaseGridSection 
          sponsored={cms.sponsored}
          bestsellers={cms.bestsellers}
          newArrivals={cms.newArrivals}
          mysteryBoxes={cms.mysteryBoxes}
        />
      </section>
    ),
    bundleBuilder: (
      <section className="container-main">
        <BundleBuilderSection />
      </section>
    ),
    recommended: (
      <section className="container-main">
        <RecommendedForYouSection />
      </section>
    ),
    brandCarousel: (
      <section className="container-main">
        <BrandCarouselSection />
      </section>
    ),
    featuredProducts: (
      <section className="container-main my-8">
        <Suspense fallback={<SkeletonGrid count={8} />}>
          <FeaturedProducts products={featured as any} />
        </Suspense>
      </section>
    ),
    promoBanner: (
      <section className="bg-surface/60 py-6">
        <div className="container-main">
          <PromoBanner banners={cms.promoBanners} />
        </div>
      </section>
    ),
    trendingProducts: (
      <section className="relative overflow-hidden py-8">
        <div className="absolute inset-0 bg-surface/50" />
        <div className="absolute inset-0 moroccan-zellige-bg opacity-20" />
        <div className="relative container-main">
          <Suspense fallback={<SkeletonGrid count={8} />}>
            <TrendingSection products={trending as any} />
          </Suspense>
        </div>
      </section>
    ),
    recentlyViewed: (
      <section className="container-main my-8">
        <RecentlyViewedSection />
      </section>
    ),
    whyNexMart: (
      <section className="relative overflow-hidden bg-surface/60 py-8">
        <div className="absolute inset-0 moroccan-pattern-bg opacity-15" />
        <div className="relative container-main">
          <WhyNexMart values={cms.whyNexMartValues} />
        </div>
      </section>
    ),
    featuresBar: (
      <section className="container-main">
        <FeaturesSection features={cms.features} />
      </section>
    ),
    mobileAppBanner: (
      <section className="container-main">
        <MobileAppBannerSection banner={cms.mobileAppBanner} />
      </section>
    ),
    newsletter: <NewsletterSection />,    
  };

  const defaultOrder = [
    "hero",
    "categories",
    "promotionalCards",
    "flashDeals",
    "flashSale",
    "serviceBanners",
    "showcaseGrid",
    "bundleBuilder",
    "recommended",
    "brandCarousel",
    "featuredProducts",
    "promoBanner",
    "trendingProducts",
    "recentlyViewed",
    "whyNexMart",
    "featuresBar",
    "mobileAppBanner",
    "newsletter",
  ];

  // Use default order only - disable dynamic sections for now
  const sectionsToRender = defaultOrder;

  return (
    <div className="page-enter space-y-4">
      {sectionsToRender.map((key) => {
        const section = sectionMap[key];
        return section ? <Fragment key={key}>{section}</Fragment> : null;
      })}
    </div>
  );
}
