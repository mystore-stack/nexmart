// src/app/page.tsx — NexMart Moroccan Luxury Homepage
import { Suspense } from "react";
import { PremiumElectronicsHero } from "@/components/home/PremiumElectronicsHero";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrendingSection } from "@/components/home/TrendingSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { RecentlyViewedSection } from "@/components/home/RecentlyViewedSection";
import { WhyNexMart } from "@/components/home/WhyNexMart";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { MarketingHomeIntegration, MarketingHeroAd } from "@/components/marketing/MarketingHomeIntegration";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { getHomePageData } from "@/lib/home-data";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ShopByCategoryServer } from "@/components/home/ShopByCategoryServer";
import { SuperDealsServer } from "@/components/home/SuperDealsServer";
import { BundleDealsServer } from "@/components/home/BundleDealsServer";
import { PageRenderer } from "@/components/page-builder/PageSectionRenderer";

export const revalidate = 300;

const PUBLIC_METADATA_LOOKUP_TIMEOUT_MS = Number(
  process.env.PUBLIC_METADATA_LOOKUP_TIMEOUT_MS || 1500
);

function withMetadataTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T | null> {
  let timeout: NodeJS.Timeout;

  return new Promise((resolve, reject) => {
    timeout = setTimeout(() => resolve(null), timeoutMs);
    operation.then(resolve, reject).finally(() => clearTimeout(timeout));
  });
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const now = new Date();
    const homePage = await withMetadataTimeout(
      prisma.pageBuilderPage.findFirst({
        where: {
          pageType: "HOME",
          enabled: true,
          status: "PUBLISHED",
          publishDate: { lte: now },
          // Handle null unpublishDate - if null, page should always be valid
          OR: [
            { unpublishDate: null },
            { unpublishDate: { gte: now } },
          ],
        },
      }),
      PUBLIC_METADATA_LOOKUP_TIMEOUT_MS
    );

    if (homePage?.seoTitle && homePage.seoDescription) {
      return { title: homePage.seoTitle, description: homePage.seoDescription };
    }
  } catch (error) {
    console.warn(
      "Failed to fetch home page for metadata; using fallback metadata.",
      error instanceof Error ? error.message : error
    );
  }

  return {
    title: "NexMart Maroc — Marketplace Premium",
    description:
      "Découvrez la marketplace premium du Maroc — artisanat authentique, produits sélectionnés par IA, paiement sécurisé et livraison express.",
  };
}

function LegacyHomePage({ data }: { data: Awaited<ReturnType<typeof getHomePageData>> }) {
  const { featured, trending, categories, flashSale, marketing } = data;
  const heroAd = marketing?.heroAds?.[0];
  const useMarketingFlash = (marketing?.flashDeals?.length ?? 0) > 0;
  const sponsoredIds = new Set(marketing?.sponsoredProducts?.map((s) => s.productId) ?? []);
  const mergedFeatured = [...featured].sort((a, b) => {
    const aSp = sponsoredIds.has(a.id) ? 1 : 0;
    const bSp = sponsoredIds.has(b.id) ? 1 : 0;
    return bSp - aSp;
  });

  return (
    <>
      {heroAd ? (
        <MarketingHeroAd ad={heroAd} />
      ) : (
        <section className="container-main py-4 md:py-6">
          <PremiumElectronicsHero />
        </section>
      )}

      {marketing && <MarketingHomeIntegration marketing={marketing} />}

      <Suspense fallback={<div className="h-96 animate-pulse bg-muted" />}>
        <ShopByCategoryServer />
      </Suspense>

      {!useMarketingFlash && flashSale.length > 0 && (
        <section className="relative overflow-hidden bg-moroccan-navy py-14 md:py-20">
          <div className="container-main">
            <FlashSaleSection products={flashSale as never} />
          </div>
        </section>
      )}

      <Suspense fallback={<div className="h-96 animate-pulse bg-muted" />}>
        <SuperDealsServer />
      </Suspense>

      <section className="section">
        <div className="container-main">
          <CategoriesSection categories={categories as never} />
        </div>
      </section>

      {!marketing?.betweenSectionAds?.length && (
        <section className="section bg-surface/60">
          <div className="container-main">
            <PromoBanner />
          </div>
        </section>
      )}

      <section className="section">
        <div className="container-main">
          <Suspense fallback={<SkeletonGrid count={8} />}>
            <FeaturedProducts products={mergedFeatured as never} />
          </Suspense>
        </div>
      </section>

      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-surface/50" />
        <div className="absolute inset-0 moroccan-zellige-bg opacity-20" />
        <div className="relative container-main">
          <Suspense fallback={<SkeletonGrid count={8} />}>
            <TrendingSection products={trending as never} />
          </Suspense>
        </div>
      </section>

      <Suspense fallback={<div className="h-96 animate-pulse bg-muted" />}>
        <BundleDealsServer />
      </Suspense>

      <section className="section">
        <div className="container-main">
          <RecentlyViewedSection />
        </div>
      </section>

      <section className="section relative overflow-hidden bg-surface/60">
        <div className="absolute inset-0 moroccan-pattern-bg opacity-15" />
        <div className="relative container-main">
          <WhyNexMart />
        </div>
      </section>

      <NewsletterSection enabled={true} />
    </>
  );
}

export default async function HomePage() {
  const data = await getHomePageData();

  // Use page builder if HOME page exists with published sections
  const usePageBuilder = data.page && data.page.sections.length > 0;

  return (
    <div className="page-enter">
      {usePageBuilder && data.page ? (
        <>
          <PageRenderer page={data.page} data={data} />
          <section className="section">
            <div className="container-main">
              <RecentlyViewedSection />
            </div>
          </section>
        </>
      ) : (
        <LegacyHomePage data={data} />
      )}
    </div>
  );
}
