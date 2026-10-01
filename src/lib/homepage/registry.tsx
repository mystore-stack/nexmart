import { Fragment, Suspense } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { HeroRendererV2 } from "@/components/hero/HeroRendererV2";
import { TabletHero } from "@/components/home/TabletHero";
import { InteractiveHeroHub } from "@/components/home/InteractiveHeroHub";
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
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { SeasonalCollectionSection } from "@/components/home/SeasonalCollectionSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { LastChanceSection } from "@/components/home/LastChanceSection";
import { SponsoredProductsSection } from "@/components/home/SponsoredProductsSection";
import { PromotionSection } from "@/components/home/PromotionSection";
import {
  FeaturedBrands,
  OffersGrid,
  PromoCarousel,
} from "@/components/home/CampaignSections";
import { CanvaSectionRenderer } from "@/components/home/CanvaSectionRenderer";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { getCanonicalSectionKeys, getCanonicalSections, normalizeToCanonicalKey } from "./canonical-contract";

// Use canonical contract as the single source of truth for backward compatibility
export const HOMEPAGE_SECTION_REGISTRY = getCanonicalSectionKeys() as readonly string[];

// Use canonical contract's normalization function
export const normalizeHomepageSectionKey = normalizeToCanonicalKey;

function getDefaultHomepageSections(): HomepageSectionDefinition[] {
  return getCanonicalSections()
    .filter((section) => section.active !== false)
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      id: `default-${section.key}`,
      sectionKey: section.key,
      title: section.title,
      subtitle: section.subtitle,
      description: section.description,
      displayOrder: section.order,
      active: section.active,
      enabled: section.active,
      hideIfEmpty: section.hideIfEmpty,
      maxProducts: section.maxProducts,
    }));
}

export type HomepageSectionDefinition = {
  id?: string;
  sectionKey?: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  bannerImage?: string | null;
  viewAllButton?: string | null;
  destinationUrl?: string | null;
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

  // If no sections provided, return empty array - CMS is the only source of truth
  if (!sections || sections.length === 0) {
    return [];
  }

  const deduped = new Map<string, HomepageSectionDefinition>();
  const now = new Date();

  for (const section of sections) {
    const normalizedKey = normalizeHomepageSectionKey(section.sectionKey ?? undefined);
    if (!normalizedKey) continue;

    // Normalize enabled to boolean
    const isEnabled = section.enabled === true ||
      (typeof section.enabled === "string" && section.enabled === "true") ||
      (typeof section.enabled === "number" && section.enabled === 1);
    
    // Filter out disabled sections unless includeInactive is true
    // enabled is the primary control for section visibility
    if (!includeInactive && !isEnabled) continue;

    // Filter out draft and archived sections unless includeInactive is true
    if (!includeInactive && (section.status === "DRAFT" || section.status === "ARCHIVED")) continue;

    // Filter out sections with expired dates
    if (!includeInactive && section.endDate) {
      const endDate = new Date(section.endDate);
      if (endDate < now) continue;
    }

    // Filter out sections with future start dates
    if (!includeInactive && section.startDate) {
      const startDate = new Date(section.startDate);
      if (startDate > now) continue;
    }

    // Only keep the first occurrence of each section key
    if (!deduped.has(normalizedKey)) {
      deduped.set(normalizedKey, section);
    }
  }

  // Sort strictly by CMS displayOrder - this preserves the exact CMS order
  const orderedSections = Array.from(deduped.values()).sort((a, b) => {
    const aOrder = a.displayOrder ?? a.order ?? 0;
    const bOrder = b.displayOrder ?? b.order ?? 0;
    return aOrder - bOrder;
  });

  return orderedSections;
}

type HomePageContext = {
  categories: any[];
  cms: {
    homeSections: any[];
    brandPartners: any[];
    heroContent: any;
    heroCards: any[];
    categoryBubbles: any[];
    showcaseCards: any[];
    newsletterPerks: any[];
    momentOffers: any[];
  };
};

export type HomePageSectionRenderInput = HomepageSectionDefinition;

export function renderHomepageSection(section: HomePageSectionRenderInput, context: HomePageContext) {
  const normalizedKey = normalizeHomepageSectionKey(section.sectionKey ?? undefined) ?? section.sectionKey;

  // Normalize enabled to boolean
  const isEnabled = section.enabled === true ||
    (typeof section.enabled === "string" && section.enabled === "true") ||
    (typeof section.enabled === "number" && section.enabled === 1);

  // Safety check: if section is explicitly disabled, return null
  // enabled is the primary control for section visibility
  if (!isEnabled) {
    return null;
  }

  // Extract CMS-assigned products from section - this is the SINGLE SOURCE OF TRUTH
  // Handle both formats: products with nested product objects or direct product objects
  let sectionProducts: any[] = [];
  if (section.products && Array.isArray(section.products)) {
    if (section.products.length > 0 && typeof section.products[0] === 'object' && section.products[0].product) {
      // Format: [{ product: {...}, order: 1, ... }]
      sectionProducts = section.products.map((p: any) => p.product).filter(Boolean);
    } else if (section.products.length > 0 && typeof section.products[0] === 'object') {
      // Format: [{ id, name, ... }] (direct product objects)
      sectionProducts = section.products;
    }
  }

  switch (normalizedKey) {
    case "promoCarousel":
      const shouldHidePromoCarousel = section.hideIfEmpty === true && sectionProducts.length === 0;
      if (shouldHidePromoCarousel) return null;
      return (
        <div key={section.id ?? `promoCarousel`} className="container-main">
          <PromoCarousel config={section.config ?? {}} products={sectionProducts} />
        </div>
      );
    case "offersGrid": {
      const sectionCfg = (section.config as Record<string, any>) || {};
      const composition = sectionCfg.canvaComposition || null;

      return (
        <div key={section.id ?? `offersGrid`} className="w-full">
          <CanvaSectionRenderer composition={composition} />
        </div>
      );
    }
    case "featuredBrands":
      return (
        <div key={section.id ?? `featuredBrands`} className="container-main">
          <FeaturedBrands config={section.config ?? {}} brands={(context.cms?.brandPartners as any[]) ?? []} />
        </div>
      );
    case "hero":
      // Check if section is enabled
      if (!isEnabled) {
        return null;
      }

      const heroConfig = section.config?.heroV2 || section.config;
      if (!heroConfig) {
        return null;
      }

      // Check if Hero is explicitly unpublished
      if ((heroConfig as any)?.publishing?.status === "unpublished") {
        return null;
      }

      // Render a SINGLE Hero instance - HeroRendererV2 handles responsive logic internally
      return (
        <section key={section.id ?? `hero`} className="!py-0 !my-0 !pt-0 !mt-0 relative">
          <HeroRendererV2 config={heroConfig} />
        </section>
      );
    case "categories":
      console.log('[REGISTRY] Passing categories to CategoriesSection:', {
        count: context.categories?.length,
        firstCat: context.categories?.[0],
      });
      return (
        <div key={section.id ?? `categories`} className="container-main">
          <CategoriesSection
            categories={context.categories as any}
            categoryBubbles={context.cms?.categoryBubbles || []}
            config={section.config ?? {}}
          />
        </div>
      );
    case "flashSale":
      const shouldHideFlashSale = section.hideIfEmpty === true && sectionProducts.length === 0;
      if (shouldHideFlashSale) return null;

      return (
        <div key={section.id ?? `flashSale`} className="container-main">
          <FlashSaleSection products={sectionProducts} config={section.config} />
        </div>
      );
    case "megaPromo":
      return <MegaPromoBannerSection key={section.id ?? `megaPromo`} {...section.config} />;
    case "serviceBanners":
      return (
        <div key={section.id ?? `serviceBanners`} className="container-main">
          <ServiceBannersSection banners={(section.config?.banners as any[]) ?? []} />
        </div>
      );
    case "showcaseGrid":
      // Dynamically extract bestSellers and newArrivals from context.cms.homeSections if available
      const bestSellersSection = context.cms?.homeSections?.find((s: any) => normalizeHomepageSectionKey(s.sectionKey) === 'bestSellers');
      const newArrivalsSection = context.cms?.homeSections?.find((s: any) => normalizeHomepageSectionKey(s.sectionKey) === 'newArrivals');

      const bestSellersProducts = bestSellersSection?.products
        ? (bestSellersSection.products.length > 0 && typeof bestSellersSection.products[0] === 'object' && bestSellersSection.products[0].product
            ? bestSellersSection.products.map((p: any) => p.product).filter(Boolean)
            : bestSellersSection.products)
        : [];

      const newArrivalsProducts = newArrivalsSection?.products
        ? (newArrivalsSection.products.length > 0 && typeof newArrivalsSection.products[0] === 'object' && newArrivalsSection.products[0].product
            ? newArrivalsSection.products.map((p: any) => p.product).filter(Boolean)
            : newArrivalsSection.products)
        : [];

      // If deprecated sections are empty, use auto-populated products from main section
      const finalBestsellers = bestSellersProducts.length > 0 ? bestSellersProducts :
        sectionProducts.length > 0 ? sectionProducts.slice(0, 4) : [];
      const finalNewArrivals = newArrivalsProducts.length > 0 ? newArrivalsProducts :
        sectionProducts.length > 4 ? sectionProducts.slice(4, 8) : [];

      console.log("[REGISTRY SHOWCASE DEBUG]", {
        sectionKey: normalizedKey,
        sectionProducts: sectionProducts.length,
        bestSellersProducts: bestSellersProducts.length,
        newArrivalsProducts: newArrivalsProducts.length,
        finalBestsellers: finalBestsellers.length,
        finalNewArrivals: finalNewArrivals.length,
        hideIfEmpty: section.hideIfEmpty
      });

      const shouldHideShowcase = section.hideIfEmpty === true && sectionProducts.length === 0 && finalBestsellers.length === 0 && finalNewArrivals.length === 0;
      if (shouldHideShowcase) {
        console.log("[REGISTRY SHOWCASE] Hiding section due to empty data");
        return null;
      }

      return (
        <div key={section.id ?? `showcaseGrid`} className="container-main">
          <ShowcaseGridSection
            sponsored={sectionProducts}
            bestsellers={finalBestsellers}
            newArrivals={finalNewArrivals}
            mysteryBoxes={(section.config?.mysteryBoxes as any[]) ?? []}
            showcaseCards={context.cms?.showcaseCards || []}
            config={section.config ?? {}}
          />
        </div>
      );
    case "bestSellers":
    case "newArrivals":
      // These are data-only sections consumed by showcaseGrid
      return null;
    case "seasonalCollection":
      const shouldHideSeasonal = section.hideIfEmpty === true && sectionProducts.length === 0;
      if (shouldHideSeasonal) return null;

      return (
        <div key={section.id ?? `seasonalCollection`} className="container-main">
          <SeasonalCollectionSection products={sectionProducts} />
        </div>
      );
    case "bundleBuilder":
      const shouldHideBundle = section.hideIfEmpty === true && sectionProducts.length === 0;
      if (shouldHideBundle) return null;

      return (
        <div key={section.id ?? `bundleBuilder`} className="container-main">
          <BundleBuilderSection products={sectionProducts} config={section.config ?? {}} />
        </div>
      );
    case "recommended":
      const shouldHideRecommended = section.hideIfEmpty === true && sectionProducts.length === 0;
      if (shouldHideRecommended) return null;
      return (
        <div key={section.id ?? `recommended`} className="container-main my-8">
          <RecommendedForYouSection products={sectionProducts} config={section.config ?? {}} />
        </div>
      );
    case "brandCarousel":
      return (
        <div key={section.id ?? `brandCarousel`} className="container-main">
          <BrandCarouselSection
            brands={(section.config?.brands as any[]) ?? []}
            title={(section.title || section.config?.title) as string | undefined}
            subtitle={(section.subtitle || section.config?.subtitle) as string | undefined}
            badge={(section.config?.badge || (section as any).badge) as string | undefined}
            config={section.config}
          />
        </div>
      );
    case "featuredProducts":
      const shouldHideFeatured = section.hideIfEmpty === true && sectionProducts.length === 0;
      if (shouldHideFeatured) return null;

      return (
        <div key={section.id ?? `featuredProducts`} className="container-main my-8">
          <Suspense fallback={<SkeletonGrid count={8} />}>
            <FeaturedProducts products={sectionProducts} config={section.config as any} />
          </Suspense>
        </div>
      );
    case "newsletter":
      return (
        <NewsletterSection 
          key={section.id ?? `newsletter`} 
          {...section.config}
          perks={context.cms?.newsletterPerks || []}
        />
      );
    case "lastChance":
      const shouldHideLastChance = section.hideIfEmpty === true && sectionProducts.length === 0;
      if (shouldHideLastChance) return null;
      return (
        <div key={section.id ?? `lastChance`} className="container-main my-8">
          <LastChanceSection products={sectionProducts} title={section.title || "Dernière Chance"} subtitle={section.subtitle || "Rupture imminente - Stock très limité"} />
        </div>
      );
    case "promotion":
      const hasCmsCards = Array.isArray(section.config?.cards) && section.config.cards.length > 0;
      const shouldHidePromotion = section.hideIfEmpty === true && sectionProducts.length === 0 && !hasCmsCards;
      if (shouldHidePromotion) return null;
      
      // Transform sectionProducts to include customPrice in the product data
      const promotionProducts = sectionProducts.map((sp: any) => ({
        id: sp.product?.id || sp.id,
        name: sp.product?.name || sp.name,
        price: sp.product?.price || sp.price,
        customPrice: sp.customPrice, // Include custom price from the relation
        oldPrice: sp.product?.comparePrice || sp.oldPrice,
        discountPercentage: sp.discountPercentage,
        image: sp.product?.images?.[0] || sp.image,
        description: sp.product?.description || sp.description,
        slug: sp.product?.slug || sp.slug,
      }));
      
      return (
        <div key={section.id ?? `promotion`} className="container-main my-8">
          <PromotionSection products={promotionProducts} config={section.config ?? {}} />
        </div>
      );
    case "sponsoredProducts":
      return (
        <div key={section.id ?? `sponsoredProducts`} className="container-main my-8">
          <SponsoredProductsSection
            products={sectionProducts}
            config={section.config ?? {}}
            title={section.title}
            subtitle={section.subtitle}
          />
        </div>
      );
    default:
      return null;
  }
}
