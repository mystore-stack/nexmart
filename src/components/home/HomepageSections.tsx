import { Suspense } from "react";
import type { HomepageSectionType } from "@prisma/client";
import { PremiumElectronicsHero } from "@/components/home/PremiumElectronicsHero";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrendingSection } from "@/components/home/TrendingSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import type { HomePageData } from "@/lib/home-data";

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
  data: HomePageData;
}

function SectionWrapper({ children, className = "section" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={className}>
      <div className="container-main">{children}</div>
    </section>
  );
}

export function HomepageSections({ sections, data }: HomepageSectionsProps) {
  const visible = sections.filter((s) => s.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const { featured, trending, categories, flashSale, homepageConfig } = data;

  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((section) => {
        switch (section.type) {
          case "HERO":
            return (
              <section key={section.id} className="container-main py-4 md:py-6">
                <PremiumElectronicsHero />
              </section>
            );
          case "FLASH_DEALS":
            return flashSale.length > 0 ? (
              <section key={section.id} className="relative overflow-hidden bg-moroccan-navy py-14 md:py-20">
                <div className="container-main">
                  <FlashSaleSection products={flashSale as never} />
                </div>
              </section>
            ) : null;
          case "CATEGORIES":
            return (
              <SectionWrapper key={section.id}>
                <CategoriesSection categories={categories as never} />
              </SectionWrapper>
            );
          case "FEATURED_PRODUCTS":
            return (
              <SectionWrapper key={section.id}>
                <Suspense fallback={<SkeletonGrid count={8} />}>
                  <FeaturedProducts products={featured as never} />
                </Suspense>
              </SectionWrapper>
            );
          case "NEW_ARRIVALS":
            return (
              <SectionWrapper key={section.id}>
                <Suspense fallback={<SkeletonGrid count={8} />}>
                  <TrendingSection products={trending as never} />
                </Suspense>
              </SectionWrapper>
            );
          case "BRANDS":
            return (
              <SectionWrapper key={section.id} className="section bg-surface/60">
                <PromoBanner />
              </SectionWrapper>
            );
          case "NEWSLETTER":
            return (
              <NewsletterSection
                key={section.id}
                enabled={homepageConfig?.newsletterEnabled ?? true}
                title={section.title ?? homepageConfig?.newsletterTitle ?? undefined}
                subtitle={section.subtitle ?? homepageConfig?.newsletterSubtitle ?? undefined}
              />
            );
          case "CUSTOM_HTML":
            return section.config?.html ? (
              <SectionWrapper key={section.id}>
                <div dangerouslySetInnerHTML={{ __html: String(section.config.html) }} />
              </SectionWrapper>
            ) : null;
          case "TESTIMONIALS":
          case "FAQ":
          case "AI_RECOMMENDATIONS":
            return (
              <SectionWrapper key={section.id}>
                <div className="py-8 text-center">
                  {section.title && <h2 className="text-2xl font-bold">{section.title}</h2>}
                  {section.subtitle && <p className="mt-2 text-muted-foreground">{section.subtitle}</p>}
                </div>
              </SectionWrapper>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
