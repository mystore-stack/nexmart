import React from "react";
import { HomepageSectionData, SectionType } from "@/lib/homepage/types";
import { normalizeToCanonicalKey, denormalizeSectionType } from '@/lib/homepage/canonical-contract';
import { SponsoredProductsSection } from "./sections/SponsoredProductsSection";
import { FlashDealsSection } from "./sections/FlashDealsSection";
import { MysteryBoxSection } from "./sections/MysteryBoxSection";
import { BundleDealsSection } from "./sections/BundleDealsSection";
import { SuperDealsSection } from "./sections/SuperDealsSection";
import { PopularCategoriesSection } from "./sections/PopularCategoriesSection";
import { TrendingProductsSection } from "./sections/TrendingProductsSection";
import { NewArrivalsSection } from "./sections/NewArrivalsSection";
import { BestSellersSection } from "./sections/BestSellersSection";
import { FeaturedBrandsSection } from "./sections/FeaturedBrandsSection";
import { WeatherSection } from "./sections/WeatherSection";
import { VideoBannerSection } from "./sections/VideoBannerSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { NewsletterSection } from "./sections/NewsletterSection";
import { InstagramFeedSection } from "./sections/InstagramFeedSection";
import { OurAdvantagesSection } from "./sections/OurAdvantagesSection";
import { RecommendedForYouSection } from "./sections/RecommendedForYouSection";

interface SectionRendererProps {
  section: HomepageSectionData;
}

export function SectionRenderer({ section }: SectionRendererProps) {
  if (!section.isEnabled) return null;

  // Denormalize UPPER_SNAKE_CASE to camelCase for rendering
  const denormalizedType = denormalizeSectionType(String(section.type)) || String(section.type);
  const key = normalizeToCanonicalKey(denormalizedType) || denormalizedType;

  if (!key) {
    console.warn('Skipping unknown homepage section type:', section.type);
    return null;
  }

  switch (key) {
    case 'ANNOUNCEMENT_BAR':
      return null; // Handled separately in Homepage component
    case 'PROFESSIONAL_HERO':
      return null; // Handled separately in Homepage component
    case 'SPONSORED_PRODUCTS':
      return <SponsoredProductsSection config={section.config} />;
    case 'FLASH_DEALS':
      return <FlashDealsSection config={section.config} />;
    case 'MYSTERY_BOX':
      return <MysteryBoxSection config={section.config} />;
    case 'BUNDLE_DEALS':
      return <BundleDealsSection config={section.config} />;
    case 'SUPER_DEALS':
      return <SuperDealsSection config={section.config} />;
    case 'WEATHER_SECTION':
      return <WeatherSection config={section.config} />;
    case 'SUMMER_PROMOTION':
      return <div className="p-8 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-center"><h2 className="text-2xl font-bold">Summer Promotion</h2><p>Amazing summer deals coming soon!</p></div>;
    case 'POPULAR_CATEGORIES':
      return <PopularCategoriesSection config={section.config} />;
    case 'TRENDING_PRODUCTS':
      return <TrendingProductsSection config={section.config} />;
    case 'NEW_ARRIVALS':
      return <NewArrivalsSection config={section.config} />;
    case 'RECOMMENDED_FOR_YOU':
      return <RecommendedForYouSection config={section.config} />;
    case 'BEST_SELLERS':
      return <BestSellersSection config={section.config} />;
    case 'FEATURED_BRANDS':
      return <FeaturedBrandsSection config={section.config} />;
    case 'VIDEO_BANNER':
      return <VideoBannerSection config={section.config} />;
    case 'TESTIMONIALS':
      return <TestimonialsSection config={section.config} />;
    case 'OUR_ADVANTAGES':
      return <OurAdvantagesSection config={section.config} />;
    case 'NEWSLETTER':
      return <NewsletterSection config={section.config} />;
    case 'INSTAGRAM_FEED':
      return <InstagramFeedSection config={section.config} />;
    case 'INSTAGRAM_GALLERY':
      return <InstagramFeedSection config={section.config} />;
    case 'PREMIUM_FOOTER':
      return null; // Handled separately in Homepage component
    case 'MYSTERY_BOXES':
      return <MysteryBoxSection config={section.config} />;
    default:
      console.warn(`Unknown section type: ${section.type}`);
      return null;
  }
}
