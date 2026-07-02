/**
 * Dynamic Section Renderer for Storefront
 * 
 * This component dynamically renders sections based on their type
 * fetched from the database. It serves as the bridge between the
 * page builder configuration and the storefront display.
 */

"use client";

import React from "react";
import { PageSectionType } from "@prisma/client";
import { HeroSliderSection } from "@/components/page-builder/sections/HeroSliderSection";
import { CategoriesSection } from "@/components/page-builder/sections/CategoriesSection";
import { FlashDealsSection } from "@/components/page-builder/sections/FlashDealsSection";
import { CampaignBannerSection } from "@/components/page-builder/sections/CampaignBannerSection";
import { FeaturedProductsSection } from "@/components/page-builder/sections/FeaturedProductsSection";
import { SponsoredProductsSection } from "@/components/page-builder/sections/SponsoredProductsSection";
import { NewArrivalsSection } from "@/components/page-builder/sections/NewArrivalsSection";
import { BestSellersSection } from "@/components/page-builder/sections/BestSellersSection";
import { MysteryBoxesSection } from "@/components/page-builder/sections/MysteryBoxesSection";
import { BuyMoreSaveMoreSection } from "@/components/page-builder/sections/BuyMoreSaveMoreSection";
import { FrequentlyBoughtTogetherSection } from "@/components/page-builder/sections/FrequentlyBoughtTogetherSection";
import { BuildYourOwnBundleSection } from "@/components/page-builder/sections/BuildYourOwnBundleSection";
import { BrandShowcaseSection } from "@/components/page-builder/sections/BrandShowcaseSection";
import { TestimonialsSection } from "@/components/page-builder/sections/TestimonialsSection";
import { NewsletterSection } from "@/components/page-builder/sections/NewsletterSection";
import { PromotionalBannerSection } from "@/components/page-builder/sections/PromotionalBannerSection";
import { VideoBannerSection } from "@/components/page-builder/sections/VideoBannerSection";
import { CollectionGridSection } from "@/components/page-builder/sections/CollectionGridSection";
import { TrendingProductsSection } from "@/components/page-builder/sections/TrendingProductsSection";
import { RecommendedProductsSection } from "@/components/page-builder/sections/RecommendedProductsSection";
import { RecentlyViewedSection } from "@/components/page-builder/sections/RecentlyViewedSection";
import { RecentlyAddedSection } from "@/components/page-builder/sections/RecentlyAddedSection";
import { PopularSearchesSection } from "@/components/page-builder/sections/PopularSearchesSection";
import { InstagramFeedSection } from "@/components/page-builder/sections/InstagramFeedSection";
import { BlogPostsSection } from "@/components/page-builder/sections/BlogPostsSection";
import { FAQSection } from "@/components/page-builder/sections/FAQSection";
import { TrustBadgesSection } from "@/components/page-builder/sections/TrustBadgesSection";
import { ShippingBenefitsSection } from "@/components/page-builder/sections/ShippingBenefitsSection";
import { CountdownOfferSection } from "@/components/page-builder/sections/CountdownOfferSection";
import { FooterBannerSection } from "@/components/page-builder/sections/FooterBannerSection";

interface SectionRendererProps {
  sections: Array<{
    id: string;
    sectionType: PageSectionType;
    enabled: boolean;
    displayOrder: number;
    startDate: string | null;
    endDate: string | null;
    visibility: string;
    backgroundColor: string | null;
    backgroundImage: string | null;
    overlayColor: string | null;
    overlayOpacity: number | null;
    layoutStyle: string | null;
    themeVariant: string | null;
    spacing: string | null;
    config: any;
  }>;
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  const now = new Date();

  // Filter sections based on scheduling
  const activeSections = sections.filter((section) => {
    if (!section.enabled) return false;
    
    if (section.startDate && new Date(section.startDate) > now) return false;
    if (section.endDate && new Date(section.endDate) < now) return false;
    
    return true;
  });

  if (activeSections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-0">
      {activeSections.map((section) => (
        <SectionWrapper key={section.id} section={section} />
      ))}
    </div>
  );
}

interface SectionWrapperProps {
  section: {
    id: string;
    sectionType: PageSectionType;
    backgroundColor: string | null;
    backgroundImage: string | null;
    overlayColor: string | null;
    overlayOpacity: number | null;
    layoutStyle: string | null;
    themeVariant: string | null;
    spacing: string | null;
    config: any;
  };
}

function SectionWrapper({ section }: SectionWrapperProps) {
  const sectionStyle: React.CSSProperties = {
    backgroundColor: section.backgroundColor || undefined,
    backgroundImage: section.backgroundImage ? `url(${section.backgroundImage})` : undefined,
  };

  const overlayStyle: React.CSSProperties = {
    backgroundColor: section.overlayColor || undefined,
    opacity: section.overlayOpacity || 0,
  };

  const spacingClasses = {
    none: "py-0",
    small: "py-4",
    medium: "py-8",
    large: "py-12",
    xlarge: "py-16",
  };

  const spacingClass = spacingClasses[section.spacing as keyof typeof spacingClasses] || "py-8";

  return (
    <div
      className={`relative ${spacingClass}`}
      style={sectionStyle}
    >
      {section.backgroundImage && section.overlayOpacity && section.overlayOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={overlayStyle}
        />
      )}
      <div className="relative z-10">
        <SectionContent section={section} />
      </div>
    </div>
  );
}

function SectionContent({ section }: { section: any }) {
  const { sectionType, config } = section;

  switch (sectionType) {
    case "HERO_SLIDER":
      return <HeroSliderSection config={config} />;
    case "CATEGORIES":
    case "CATEGORY_GRID":
      return <CategoriesSection config={config} />;
    case "FLASH_DEALS":
      return <FlashDealsSection config={config} />;
    case "CAMPAIGN_BANNER":
      return <CampaignBannerSection config={config} />;
    case "FEATURED_PRODUCTS":
      return <FeaturedProductsSection config={config} />;
    case "SPONSORED_PRODUCTS":
      return <SponsoredProductsSection config={config} />;
    case "NEW_ARRIVALS":
      return <NewArrivalsSection config={config} />;
    case "BEST_SELLERS":
      return <BestSellersSection config={config} />;
    case "MYSTERY_BOXES":
      return <MysteryBoxesSection config={config} />;
    case "BUY_MORE_SAVE_MORE":
      return <BuyMoreSaveMoreSection config={config} />;
    case "FREQUENTLY_BOUGHT_TOGETHER":
      return <FrequentlyBoughtTogetherSection config={config} />;
    case "BUILD_YOUR_OWN_BUNDLE":
      return <BuildYourOwnBundleSection config={config} />;
    case "BRAND_SHOWCASE":
      return <BrandShowcaseSection config={config} />;
    case "TESTIMONIALS":
      return <TestimonialsSection config={config} />;
    case "NEWSLETTER":
      return <NewsletterSection config={config} />;
    case "PROMOTIONAL_BANNER":
      return <PromotionalBannerSection config={config} />;
    case "VIDEO_BANNER":
      return <VideoBannerSection config={config} />;
    case "COLLECTION_GRID":
      return <CollectionGridSection config={config} />;
    case "TRENDING_PRODUCTS":
      return <TrendingProductsSection config={config} />;
    case "RECOMMENDED_PRODUCTS":
      return <RecommendedProductsSection config={config} />;
    case "RECENTLY_VIEWED":
      return <RecentlyViewedSection config={config} />;
    case "RECENTLY_ADDED":
      return <RecentlyAddedSection config={config} />;
    case "POPULAR_SEARCHES":
      return <PopularSearchesSection config={config} />;
    case "INSTAGRAM_FEED":
      return <InstagramFeedSection config={config} />;
    case "BLOG_POSTS":
      return <BlogPostsSection config={config} />;
    case "FAQ":
      return <FAQSection config={config} />;
    case "TRUST_BADGES":
      return <TrustBadgesSection config={config} />;
    case "SHIPPING_BENEFITS":
      return <ShippingBenefitsSection config={config} />;
    case "COUNTDOWN_OFFER":
      return <CountdownOfferSection config={config} />;
    case "FOOTER_BANNER":
      return <FooterBannerSection config={config} />;
    default:
      console.warn(`Unknown section type: ${sectionType}`);
      return <div className="p-8 text-center text-muted-foreground">Section type not implemented: {sectionType}</div>;
  }
}
