import React from "react";
import { HeroSection } from "./sections/HeroSection";
import { AnnouncementBarSection } from "./sections/AnnouncementBarSection";
import { PromotionalBannerSection } from "./sections/PromotionalBannerSection";
import { FeaturedProductsSection } from "./sections/FeaturedProductsSection";
import { FeaturedCategoriesSection } from "./sections/FeaturedCategoriesSection";
import { BenefitsSection } from "./sections/BenefitsSection";
import { CountdownTimerSection } from "./sections/CountdownTimerSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { FAQSection } from "./sections/FAQSection";
import { NewsletterSection } from "./sections/NewsletterSection";
import { CTABannerSection } from "./sections/CTABannerSection";
import { CustomHTMLSection } from "./sections/CustomHTMLSection";
import { VideoSection } from "./sections/VideoSection";
import { ImageGallerySection } from "./sections/ImageGallerySection";
import { ProductGridSection } from "./sections/ProductGridSection";
import { ProductCarouselSection } from "./sections/ProductCarouselSection";
import { TextBlockSection } from "./sections/TextBlockSection";
import { SpacerSection } from "./sections/SpacerSection";
import { DividerSection } from "./sections/DividerSection";
import { IconGridSection } from "./sections/IconGridSection";
import { BrandLogosSection } from "./sections/BrandLogosSection";
import { RichTextSection } from "./sections/RichTextSection";
import { SponsoredProductsSection } from "./sections/SponsoredProductsSection";
import { FlashDealsSection } from "./sections/FlashDealsSection";
import { FrequentlyBoughtTogetherSection } from "./sections/FrequentlyBoughtTogetherSection";
import { BuyMoreSaveMoreSection } from "./sections/BuyMoreSaveMoreSection";
import { MysteryBoxesSection } from "./sections/MysteryBoxesSection";
import { BuildYourOwnBundleSection } from "./sections/BuildYourOwnBundleSection";
import type { PageSection, Product } from "./types";
import type { PageBuilderPage } from "@prisma/client";
import type { HomePageData } from "@/lib/home-data";

interface PageSectionRendererProps {
  section: PageSection;
  products?: Product[];
  categories?: any[];
  isLoading?: boolean;
}

interface PageRendererProps {
  page: PageBuilderPage & { sections: PageSection[] };
  data: HomePageData;
}

export function PageSectionRenderer({ section, products = [], categories = [], isLoading = false }: PageSectionRendererProps) {
  const { sectionType, enabled } = section;

  if (!enabled) return null;

  switch (sectionType) {
    case "HERO":
      return <HeroSection section={section} isLoading={isLoading} />;
    case "ANNOUNCEMENT_BAR":
      return <AnnouncementBarSection section={section} />;
    case "PROMOTIONAL_BANNER":
      return <PromotionalBannerSection section={section} />;
    case "FEATURED_PRODUCTS":
      return <FeaturedProductsSection section={section} products={products} />;
    case "CATEGORIES":
      return <FeaturedCategoriesSection section={section} categories={categories} />;
    case "BENEFITS":
      return <BenefitsSection section={section} />;
    case "COUNTDOWN_TIMER":
      return <CountdownTimerSection section={section} />;
    case "TESTIMONIALS":
      return <TestimonialsSection section={section} />;
    case "FAQ":
      return <FAQSection section={section} />;
    case "NEWSLETTER":
      return <NewsletterSection section={section} isLoading={isLoading} />;
    case "CTA_BANNER":
      return <CTABannerSection section={section} />;
    case "CUSTOM_HTML":
      return <CustomHTMLSection section={section} />;
    case "VIDEO_SECTION":
      return <VideoSection section={section} />;
    case "IMAGE_GALLERY":
      return <ImageGallerySection section={section} />;
    case "PRODUCT_GRID":
      return <ProductGridSection section={section} products={products} />;
    case "PRODUCT_CAROUSEL":
      return <ProductCarouselSection section={section} products={products} />;
    case "TEXT_BLOCK":
      return <TextBlockSection section={section} />;
    case "SPACER":
      return <SpacerSection section={section} />;
    case "DIVIDER":
      return <DividerSection section={section} />;
    case "ICON_GRID":
      return <IconGridSection section={section} />;
    case "BRAND_LOGOS":
      return <BrandLogosSection section={section} />;
    case "RICH_TEXT":
      return <RichTextSection section={section} />;
    case "SPONSORED_PRODUCTS":
      return <SponsoredProductsSection section={section} products={products} isLoading={isLoading} />;
    case "FLASH_DEALS":
      return <FlashDealsSection section={section} products={products} isLoading={isLoading} />;
    case "FREQUENTLY_BOUGHT_TOGETHER":
      return <FrequentlyBoughtTogetherSection section={section} products={products} isLoading={isLoading} />;
    case "BUY_MORE_SAVE_MORE":
      return <BuyMoreSaveMoreSection section={section} products={products} isLoading={isLoading} />;
    case "MYSTERY_BOXES":
      return <MysteryBoxesSection section={section} products={products} isLoading={isLoading} />;
    case "BUILD_YOUR_OWN_BUNDLE":
      return <BuildYourOwnBundleSection section={section} products={products} isLoading={isLoading} />;
    default:
      return (
        <div className="py-8 px-4 text-center text-gray-500">
          Unknown section type: {sectionType}
        </div>
      );
  }
}

export function PageRenderer({ page, data }: PageRendererProps) {
  const { sections } = page;
  const { featured, trending, categories, flashSale } = data;

  if (!sections || sections.length === 0) {
    return null;
  }

  // Map database products to expected Product type
  const mapProducts = (products: any[]) =>
    products.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category?.name || p.category,
    }));

  return (
    <>
      {sections.map((section) => {
        // Pass appropriate products based on section type
        const products = section.sectionType === "FEATURED_PRODUCTS" ? mapProducts(featured) :
                      section.sectionType === "NEW_ARRIVALS" ? mapProducts(trending) :
                      section.sectionType === "FLASH_DEALS" ? mapProducts(flashSale) :
                      section.sectionType === "SPONSORED_PRODUCTS" ? mapProducts(featured) :
                      section.sectionType === "FREQUENTLY_BOUGHT_TOGETHER" ? mapProducts(featured) :
                      section.sectionType === "BUY_MORE_SAVE_MORE" ? mapProducts(featured) :
                      section.sectionType === "MYSTERY_BOXES" ? mapProducts(featured) :
                      section.sectionType === "BUILD_YOUR_OWN_BUNDLE" ? mapProducts(featured) :
                      [];
        const sectionCategories = section.sectionType === "CATEGORIES" ? categories : [];

        return (
          <PageSectionRenderer
            key={section.id}
            section={section}
            products={products}
            categories={sectionCategories}
          />
        );
      })}
    </>
  );
}
