import { Fragment, Suspense } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { PromotionalCardsSection } from "@/components/home/PromotionalCardsSection";
import { FlashDealsSection } from "@/components/home/FlashDealsSection";
import { ServiceBannersSection } from "@/components/home/ServiceBannersSection";
import { MegaPromoBannerSection } from "@/components/home/MegaPromoBannerSection";
import { ShowcaseGridSection } from "@/components/home/ShowcaseGridSection";
import { SingleFlashOffer } from "@/components/home/SingleFlashOffer";
import { BundleBuilderSection } from "@/components/home/BundleBuilderSection";
import { RecommendedForYouSection } from "@/components/home/RecommendedForYouSection";
import { PromoBannersGrid } from "@/components/home/PromoBannersGrid";
import { BrandCarouselSection } from "@/components/home/BrandCarouselSection";
import { MobileAppBannerSection } from "@/components/home/MobileAppBannerSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrendingSection } from "@/components/home/TrendingSection";
import { BestMatchBanner } from "@/components/home/BestMatchBanner";
import { SeasonalCollectionSection } from "@/components/home/SeasonalCollectionSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { RecentlyViewedSection } from "@/components/home/RecentlyViewedSection";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { getCanonicalSectionKeys, normalizeToCanonicalKey } from "./canonical-contract";

// Use canonical contract as the single source of truth for backward compatibility
export const HOMEPAGE_SECTION_REGISTRY = getCanonicalSectionKeys() as readonly string[];

// Use canonical contract's normalization function
export const normalizeHomepageSectionKey = normalizeToCanonicalKey;

export type HomepageSectionDefinition = {
  id?: string;
  sectionKey?: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  bannerImage?: string | null;
  viewAllButton?: string | null;
  destinationUrl?: string | null;
  active?: boolean;
  enabled?: boolean;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  displayOrder?: number;
  order?: number;
  config?: Record<string, unknown>;
  themeSettings?: Record<string, unknown> | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  products?: any[];
  hideIfEmpty?: boolean;
  maxProducts?: number;
};

export function getOrderedHomepageSections(sections: HomepageSectionDefinition[] = [], options?: { includeInactive?: boolean }): HomepageSectionDefinition[] {
  const { includeInactive = false } = options || {};
  
  // If no sections provided, create default sections to ensure homepage renders
  if (!sections || sections.length === 0) {
    return HOMEPAGE_SECTION_REGISTRY.map((key, index) => ({
      id: `default-${key}`,
      sectionKey: key,
      displayOrder: index,
      active: true,
      enabled: true,
    }));
  }

  const deduped = new Map<string, HomepageSectionDefinition>();

  for (const section of sections) {
    const normalizedKey = normalizeHomepageSectionKey(section.sectionKey ?? undefined);
    if (!normalizedKey) continue;
    
    // Filter out inactive sections unless includeInactive is true
    if (!includeInactive && (section.active === false || section.enabled === false)) continue;
    
    // Filter out draft and archived sections unless includeInactive is true
    if (!includeInactive && (section.status === "DRAFT" || section.status === "ARCHIVED")) continue;
    
    // Filter out sections with expired dates
    if (!includeInactive && section.endDate) {
      const endDate = new Date(section.endDate);
      if (endDate < new Date()) continue;
    }
    
    // Filter out sections with future start dates
    if (!includeInactive && section.startDate) {
      const startDate = new Date(section.startDate);
      if (startDate > new Date()) continue;
    }
    
    // Only keep the first occurrence of each section key
    if (!deduped.has(normalizedKey)) {
      deduped.set(normalizedKey, section);
    }
  }

  // Sort strictly by database displayOrder - this is the CMS order
  const orderedByDb = Array.from(deduped.values()).sort((a, b) => {
    const aOrder = a.displayOrder ?? a.order ?? 0;
    const bOrder = b.displayOrder ?? b.order ?? 0;
    return aOrder - bOrder;
  });

  // If all sections were filtered out, return defaults
  if (orderedByDb.length === 0 && !includeInactive) {
    return HOMEPAGE_SECTION_REGISTRY.map((key, index) => ({
      id: `default-${key}`,
      sectionKey: key,
      displayOrder: index,
      active: true,
      enabled: true,
    }));
  }

  return orderedByDb;
}

type HomePageContext = {
  categories: any[];
  cms: any;
};

export type HomePageSectionRenderInput = HomepageSectionDefinition;

export function renderHomepageSection(section: HomePageSectionRenderInput, context: HomePageContext) {
  const normalizedKey = normalizeHomepageSectionKey(section.sectionKey ?? undefined) ?? section.sectionKey;

  // Extract CMS-assigned products from section - this is the SINGLE SOURCE OF TRUTH
  // Handle both formats: products with nested product objects or direct product objects
  let cmsProducts: any[] = [];
  if (section.products && Array.isArray(section.products)) {
    if (section.products.length > 0 && typeof section.products[0] === 'object' && section.products[0].product) {
      // Format: [{ product: {...}, order: 1, ... }]
      cmsProducts = section.products.map((p: any) => p.product).filter(Boolean);
    } else if (section.products.length > 0 && typeof section.products[0] === 'object') {
      // Format: [{ id, name, ... }] (direct product objects)
      cmsProducts = section.products;
    }
  }

  switch (normalizedKey) {
    case "hero":
      return (
        <section key={section.id ?? `hero`} className="container-main py-4 md:py-6">
          <HeroSection slides={(section.config?.slides as any[]) ?? []} />
        </section>
      );
    case "categories":
      return (
        <section key={section.id ?? `categories`} className="container-main">
          <CategoriesSection categories={context.categories as any} config={section.config ?? {}} />
        </section>
      );
    case "flashSale":
      const shouldHideFlashSale = section.hideIfEmpty === true && cmsProducts.length === 0;
      if (shouldHideFlashSale) return null;
      
      return (
        <section key={section.id ?? `flashSale`} className="relative overflow-hidden bg-moroccan-navy py-12">
          <div className="container-main">
            <FlashDealsSection />
          </div>
        </section>
      );
    case "megaPromo":
      return <MegaPromoBannerSection key={section.id ?? `megaPromo`} {...section.config} />;
    case "serviceBanners":
      return (
        <section key={section.id ?? `serviceBanners`} className="container-main">
          <ServiceBannersSection banners={(section.config?.banners as any[]) ?? []} />
        </section>
      );
    case "showcaseGrid":
      // Dynamically extract bestSellers and newArrivals from context.cms.homeSections if available
      const bestSellersSection = context.cms?.homeSections?.find((s: any) => normalizeHomepageSectionKey(s.sectionKey) === 'bestSellers');
      const newArrivalsSection = context.cms?.homeSections?.find((s: any) => normalizeHomepageSectionKey(s.sectionKey) === 'newArrivals');
      
      const bestSellersProducts = bestSellersSection?.products
        ? (bestSellersSection.products.length > 0 && typeof bestSellersSection.products[0] === 'object' && bestSellersSection.products[0].product 
            ? bestSellersSection.products.map((p: any) => p.product).filter(Boolean) 
            : bestSellersSection.products)
        : ((section.config?.bestsellers as any[]) ?? []);
        
      const newArrivalsProducts = newArrivalsSection?.products
        ? (newArrivalsSection.products.length > 0 && typeof newArrivalsSection.products[0] === 'object' && newArrivalsSection.products[0].product 
            ? newArrivalsSection.products.map((p: any) => p.product).filter(Boolean) 
            : newArrivalsSection.products)
        : ((section.config?.newArrivals as any[]) ?? []);

      return (
        <section key={section.id ?? `showcaseGrid`} className="container-main">
          <ShowcaseGridSection
            sponsored={cmsProducts}
            bestsellers={bestSellersProducts}
            newArrivals={newArrivalsProducts}
            mysteryBoxes={(section.config?.mysteryBoxes as any[]) ?? []}
            config={section.config ?? {}}
          />
        </section>
      );
    case "bestSellers":
    case "newArrivals":
      // These are data-only sections consumed by showcaseGrid
      return null;
    case "seasonalCollection":
      const shouldHideSeasonal = section.hideIfEmpty === true && cmsProducts.length === 0;
      if (shouldHideSeasonal) return null;
      
      return (
        <section key={section.id ?? `seasonalCollection`} className="container-main">
          <SeasonalCollectionSection products={cmsProducts} />
        </section>
      );
    case "bundleBuilder":
      const shouldHideBundle = section.hideIfEmpty === true && cmsProducts.length === 0;
      if (shouldHideBundle) return null;
      
      return (
        <section key={section.id ?? `bundleBuilder`} className="container-main">
          <BundleBuilderSection products={cmsProducts} config={section.config ?? {}} />
        </section>
      );
    case "recommended":
      return (
        <section key={section.id ?? `recommended`} className="container-main my-8">
          <PromoBannersGrid cards={(section.config?.cards as any[]) ?? []} />
        </section>
      );
    case "brandCarousel":
      return (
        <section key={section.id ?? `brandCarousel`} className="container-main">
          <BrandCarouselSection brands={(section.config?.brands as any[]) ?? []} />
        </section>
      );
    case "featuredProducts":
      const shouldHideFeatured = section.hideIfEmpty === true && cmsProducts.length === 0;
      if (shouldHideFeatured) return null;
      
      return (
        <section key={section.id ?? `featuredProducts`} className="container-main my-8">
          <Suspense fallback={<SkeletonGrid count={8} />}>
            <FeaturedProducts products={cmsProducts} config={section.config as any} />
          </Suspense>
        </section>
      );
    case "trendingProducts":      
      return (
        <section key={section.id ?? `trendingProducts`} className="container-main my-8">
          <BestMatchBanner config={section.config ?? {}} />
        </section>
      );
    case "mobileAppBanner":
      return (
        <section key={section.id ?? `mobileAppBanner`} className="container-main">
          <MobileAppBannerSection banner={(section.config?.mobileAppBanner as any) ?? {}} />
        </section>
      );
    case "newsletter":
      return <NewsletterSection key={section.id ?? `newsletter`} {...section.config} />;
    case "recentlyViewed":
      return (
        <section key={section.id ?? `recentlyViewed`} className="container-main py-6">
          <RecentlyViewedSection />
        </section>
      );
    case "promotionalCards":
      return <PromotionalCardsSection key={section.id ?? `promotionalCards`} cards={(section.config?.cards as any[]) ?? []} />;
    case "superDeals":
      const shouldHideSuperDeals = section.hideIfEmpty === true && cmsProducts.length === 0;
      if (shouldHideSuperDeals) return null;
      return (
        <section key={section.id ?? `superDeals`} className="relative overflow-hidden bg-moroccan-navy/5 py-12 my-8">
          <div className="container-main">
            <FlashSaleSection products={cmsProducts} config={section.config ?? {}} />
          </div>
        </section>
      );
    case "bundleProducts":
      const shouldHideBundleProducts = section.hideIfEmpty === true && cmsProducts.length === 0;
      if (shouldHideBundleProducts) return null;
      return (
        <section key={section.id ?? `bundleProducts`} className="container-main my-8">
          <SingleFlashOffer products={cmsProducts} config={section.config ?? {}} />
        </section>
      );
    case "relatedProducts":
      return (
        <section key={section.id ?? `relatedProducts`} className="container-main my-8">
          <RecommendedForYouSection products={cmsProducts} config={section.config ?? {}} />
        </section>
      );
    case "editorsChoice":
      const shouldHideEditorsChoice = section.hideIfEmpty === true && cmsProducts.length === 0;
      if (shouldHideEditorsChoice) return null;
      return (
        <section key={section.id ?? `editorsChoice`} className="container-main my-8">
          <TrendingSection products={cmsProducts} />
        </section>
      );
    default:
      return null;
  }
}
