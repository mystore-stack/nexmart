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
import { HomepageSections } from "@/components/home/HomepageSections";
import { MarketingHomeIntegration, MarketingHeroAd } from "@/components/marketing/MarketingHomeIntegration";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { getHomePageData } from "@/lib/home-data";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

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
    const activeBanner = await withMetadataTimeout(
      prisma.heroBanner.findFirst({
        where: {
          isActive: true,
          AND: [
            { OR: [{ publishDate: null }, { publishDate: { lte: now } }] },
            { OR: [{ expireDate: null }, { expireDate: { gte: now } }] },
          ],
        },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      }),
      PUBLIC_METADATA_LOOKUP_TIMEOUT_MS
    );

    if (activeBanner?.seoTitle && activeBanner.seoDescription) {
      return { title: activeBanner.seoTitle, description: activeBanner.seoDescription };
    }
  } catch (error) {
    console.warn(
      "Failed to fetch hero banner for metadata; using fallback metadata.",
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
  const { featured, trending, categories, flashSale, homepageConfig, marketing } = data;
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

      {!useMarketingFlash && flashSale.length > 0 && (
        <section className="relative overflow-hidden bg-moroccan-navy py-14 md:py-20">
          <div className="container-main">
            <FlashSaleSection products={flashSale as never} />
          </div>
        </section>
      )}

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

      <NewsletterSection
        enabled={homepageConfig?.newsletterEnabled ?? true}
        title={homepageConfig?.newsletterTitle ?? undefined}
        subtitle={homepageConfig?.newsletterSubtitle ?? undefined}
      />
    </>
  );
}

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <div className="page-enter">
      {data.useCmsLayout && data.homepageSections.length > 0 ? (
        <>
          <HomepageSections sections={data.homepageSections} data={data} />
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
