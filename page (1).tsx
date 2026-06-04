/**
 * NexMart Homepage — Enterprise Edition
 * Server Component with:
 * - Parallel data fetching (Promise.all)
 * - Redis ISR caching layer
 * - Streaming Suspense boundaries
 * - Full JSON-LD structured data
 * - AI recommendations section
 */
import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { HeroSection } from "@/components/home/HeroSection";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrendingSection } from "@/components/home/TrendingSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { WhyNexMart } from "@/components/home/WhyNexMart";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { AIRecommendations } from "@/components/ai/AIRecommendations";
import { SkeletonGrid } from "@/components/ui/Skeleton";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "NexMart — Marketplace Premium du Maroc 🇲🇦",
  description:
    "Découvrez des millions de produits : mode, électronique, artisanat marocain et plus. Livraison rapide partout au Maroc avec paiement sécurisé CMI, carte bancaire et cash à la livraison.",
  alternates: { canonical: "/" },
};

async function getHomeData() {
  const cacheKey = "home:data:v3";
  const cached = await getCache<any>(cacheKey);
  if (cached) return cached;

  const organizationId = await getDefaultOrganizationId();
  const include = { category: true, variants: true };

  const [featured, trending, categories, flashSale] = await Promise.all([
    prisma.product.findMany({
      where: { organizationId, published: true, featured: true },
      include, orderBy: { soldCount: "desc" }, take: 12,
    }),
    prisma.product.findMany({
      where: { organizationId, published: true, stock: { gt: 0 } },
      include, orderBy: [{ soldCount: "desc" }, { rating: "desc" }], take: 8,
    }),
    prisma.category.findMany({
      where: { organizationId, parentId: null },
      include: { _count: { select: { products: { where: { organizationId } } } } },
      orderBy: { name: "asc" }, take: 8,
    }),
    prisma.product.findMany({
      where: { organizationId, published: true, comparePrice: { not: null }, stock: { gt: 0 } },
      include, orderBy: { soldCount: "desc" }, take: 6,
    }),
  ]);

  const data = { featured, trending, categories, flashSale };
  await setCache(cacheKey, data, CACHE_TTL.MEDIUM);
  return data;
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NexMart Maroc",
  url: "https://nexmart.ma",
  description: "La marketplace premium du Maroc",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://nexmart.ma/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "NexMart Maroc",
    logo: { "@type": "ImageObject", url: "https://nexmart.ma/logo.png" },
    contactPoint: { "@type": "ContactPoint", telephone: "+212-600-000000", contactType: "customer service", availableLanguage: ["French", "Arabic"] },
  },
};

export default async function HomePage() {
  const { featured, trending, categories, flashSale } = await getHomeData();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="page-enter">
        {/* Hero */}
        <section className="container-main py-4 md:py-6">
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

        {/* AI-Powered Recommendations */}
        <section className="section border-t border-border">
          <div className="container-main">
            <Suspense fallback={<SkeletonGrid count={6} />}>
              <AIRecommendations
                context="homepage"
                title="Recommandés pour vous"
                limit={6}
              />
            </Suspense>
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
    </>
  );
}
