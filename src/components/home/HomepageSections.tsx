import { Suspense } from "react";
import type { HomepageSectionType } from "@prisma/client";
import { normalizeToCanonicalKey } from "@/lib/homepage/canonical-contract";
import PremiumHero from "@/components/homepage/PremiumHero";
import FlashDealsPremium from "@/components/homepage/sections/FlashDealsPremium";
import FeaturedCategories from "@/components/homepage/FeaturedCategories";
import FeaturedProductsPremium from "@/components/homepage/sections/FeaturedProductsPremium";
import TrendingAndNewArrivalsPremium from "@/components/homepage/sections/TrendingAndNewArrivalsPremium";
import LuxuryCollections from "@/components/homepage/LuxuryCollections";
import SeasonalCollectionSection from "@/components/home/SeasonalCollectionSection";
import NewsletterPremium from "@/components/homepage/NewsletterPremium";
import AIRecommendationsPremium from "@/components/homepage/AIRecommendationsPremium";
import BundleDealsPremium from "@/components/homepage/sections/BundleDealsPremium";
import MysteryBoxesPremium from "@/components/homepage/sections/MysteryBoxesPremium";
import SuperDealsPremium from "@/components/homepage/sections/SuperDealsPremium";
import FeaturedBrandsPremium from "@/components/homepage/FeaturedBrandsPremium";
import TestimonialsPremium from "@/components/homepage/TestimonialsPremium";
import InstagramGalleryPremium from "@/components/homepage/InstagramGalleryPremium";
import { SkeletonGrid } from "@/components/ui/Skeleton";

export interface HomepageSectionData {
  id: string;
  type: HomepageSectionType;
  title?: string | null;
  subtitle?: string | null;
  config: Record<string, unknown>;
  isVisible: boolean;
  displayOrder: number;
}

interface HomepageSectionsProps {
  sections: HomepageSectionData[];
}

function SectionWrapper({ children, className = "section" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={className}>
      <div className="container-main">{children}</div>
    </section>
  );
}

export function HomepageSections({ sections }: HomepageSectionsProps) {
  const visible = sections.filter((s) => s.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);

  if (visible.length === 0) return null;

  return (
    <div className="homepage-shell">
        {visible.map((section) => {
          const key = normalizeToCanonicalKey(String(section.type)) || String(section.type);
          if (!key) {
            console.warn('Skipping unknown homepage section type:', section.type);
            return null;
          }

          switch (key) {
            case "HERO":
              return <PremiumHero key={section.id} />;
            case "FLASH_DEALS":
              return <FlashDealsPremium key={section.id} />;
            case "CATEGORIES":
              return <FeaturedCategories key={section.id} />;
            case "FEATURED_PRODUCTS":
              return (
                <Suspense key={section.id} fallback={<SkeletonGrid count={8} />}>
                  <FeaturedProductsPremium />
                </Suspense>
              );
            case "NEW_ARRIVALS":
              return <TrendingAndNewArrivalsPremium key={section.id} />;
            case "BRANDS":
              return <FeaturedBrandsPremium key={section.id} />;
            case "NEWSLETTER":
              return <NewsletterPremium key={section.id} />;
            case "CUSTOM_HTML":
              return section.config?.html ? (
                <SectionWrapper key={section.id}>
                  <div dangerouslySetInnerHTML={{ __html: String(section.config.html) }} />
                </SectionWrapper>
              ) : null;
            case "TESTIMONIALS":
              return <TestimonialsPremium key={section.id} />;
            case "FAQ":
              return (
                <SectionWrapper key={section.id}>
                  <div className="py-8 text-center">
                    {section.title && <h2 className="text-2xl font-bold">{section.title}</h2>}
                    {section.subtitle && <p className="mt-2 text-muted-foreground">{section.subtitle}</p>}
                  </div>
                </SectionWrapper>
              );
            case "AI_RECOMMENDATIONS":
              return <AIRecommendationsPremium key={section.id} />;
            case "LUXURY_COLLECTIONS":
              return <LuxuryCollections key={section.id} />;
            case "SEASONAL_COLLECTION":
              return <SeasonalCollectionSection key={section.id} />;
            case "BUNDLE_DEALS":
              return <BundleDealsPremium key={section.id} />;
            case "MYSTERY_BOXES":
              return <MysteryBoxesPremium key={section.id} />;
            case "MYSTERY_BOX":
              return <MysteryBoxesPremium key={section.id} />;
            case "SUPER_DEALS":
              return <SuperDealsPremium key={section.id} />;
            case "INSTAGRAM_GALLERY":
              return <InstagramGalleryPremium key={section.id} />;
            default:
              console.warn('Unhandled canonical section type:', key);
              return null;
          }
        })}
    </div>
  );
}
