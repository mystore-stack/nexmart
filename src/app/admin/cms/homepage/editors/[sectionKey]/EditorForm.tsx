"use client";

import React, { useState } from "react";
import { HeroEditor } from "./components/HeroEditor";
import { HeroEditorV2 } from "./components/HeroEditorV2";
import { ProductCollectionManager } from "./components/ProductCollectionManager";
import { NewsletterEditor } from "./components/NewsletterEditor";
import { RecommendedEditor } from "./components/RecommendedEditor";
import { CategoriesEditor } from "./components/CategoriesEditor";
import { FlashSaleEditor } from "./components/FlashSaleEditor";
import { BrandCarouselEditor } from "./components/BrandCarouselEditor";
import { PromoCardsEditor } from "./components/PromoCardsEditor";
import { ServiceBannersEditor } from "./components/ServiceBannersEditor";
import { BundleBuilderEditor } from "./components/BundleBuilderEditor";
import { SingleFlashOfferEditor } from "./components/SingleFlashOfferEditor";
import { ShowcaseGridEditor } from "./components/ShowcaseGridEditor";
import { GenericJsonEditor } from "./components/GenericJsonEditor";
import { FeaturedProductsEditor } from "./components/FeaturedProductsEditor";
import { CampaignHeroEditor } from "./components/CampaignHeroEditor";
import { PromoCarouselEditor } from "./components/PromoCarouselEditor";
import { CategoryCircleCarouselEditor } from "./components/CategoryCircleCarouselEditor";
import { CanvaOffersEditor } from "./components/CanvaOffersEditor";
import { PromotionEditor } from "./components/PromotionEditor";
import { FeaturedBrandsEditor } from "./components/FeaturedBrandsEditor";
import { SponsoredProductsEditor } from "./components/SponsoredProductsEditor";
import { ImageGallerySectionEditor } from "./components/ImageGallerySectionEditor";
import { getCanonicalSection } from "@/lib/homepage/canonical-contract";

export function EditorForm({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const [localConfig, setLocalConfig] = useState(parsedConfig);

  const handleSaveConfig = async (newConfig: any) => {
    try {
      const response = await fetch(`/api/admin/cms/homepage/${section.sectionKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: newConfig,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      setLocalConfig(newConfig);
      return true;
    } catch (error) {
      console.error('Save error:', error);
      return false;
    }
  };

  const renderSpecializedEditor = () => {
    // Get the canonical section info to get the proper sectionType
    const canonicalSection = getCanonicalSection(section.sectionKey);
    const normalizedType = section.sectionType || canonicalSection?.sectionType;

    switch (normalizedType) {
      case "HERO":
        // Use new V2 editor for HERO sections
        return <HeroEditorV2 section={section} parsedConfig={localConfig} />;
      case "CAMPAIGN_HERO":
        return <CampaignHeroEditor section={section} parsedConfig={localConfig} />;
      case "FEATURED_PRODUCTS":
        return <FeaturedProductsEditor section={section} parsedConfig={localConfig} />;
      case "SEASONAL_COLLECTION":
        return <ProductCollectionManager section={section} parsedConfig={localConfig} />;
      case "AI_RECOMMENDATIONS": // Recommended
        if (section.sectionKey === "recommended") {
          return <RecommendedEditor section={section} parsedConfig={localConfig} />;
        }
        return <ProductCollectionManager section={section} parsedConfig={localConfig} />;
      case "CATEGORIES":
        return <CategoriesEditor section={section} parsedConfig={localConfig} />;
      case "CATEGORY_CIRCLE_CAROUSEL":
        return <CategoryCircleCarouselEditor section={section} parsedConfig={localConfig} />;
      case "FLASH_DEALS": // Flash Sale
        return <FlashSaleEditor section={section} parsedConfig={localConfig} />;
      case "BRANDS": // Brand Carousel
        return <BrandCarouselEditor section={section} parsedConfig={localConfig} />;
      case "FEATURED_BRANDS_PROMO":
        return <FeaturedBrandsEditor section={section} parsedConfig={localConfig} />;
      case "BANNER": // Mega Promo
      case "PROMOTIONAL_CARDS":
        return <PromoCardsEditor section={section} parsedConfig={localConfig} />;
      case "PROMO_CAROUSEL":
        return <PromoCarouselEditor section={section} parsedConfig={localConfig} />;
      case "SERVICE_BANNERS":
        return <ServiceBannersEditor section={section} parsedConfig={localConfig} />;
      case "BUNDLE_DEALS": // Bundle Builder
        return <BundleBuilderEditor section={section} parsedConfig={localConfig} />;
      case "SHOWCASE_GRID":
        return <ShowcaseGridEditor section={section} parsedConfig={localConfig} />;
      case "OFFERS_GRID":
        return <CanvaOffersEditor section={section} parsedConfig={localConfig} />;
      case "IMAGE_GALLERY":
        return <ImageGallerySectionEditor section={section} parsedConfig={localConfig} onSave={handleSaveConfig} />;
      case "PROMOTION":
        return <PromotionEditor section={section} parsedConfig={localConfig} />;
      case "SPONSORED_PRODUCTS":
        return <SponsoredProductsEditor section={section} parsedConfig={localConfig} />;
      case "NEWSLETTER":
        return <NewsletterEditor section={section} parsedConfig={localConfig} />;
      default:
        // Fallback for sections that don't have a specialized editor built yet

        return <GenericJsonEditor section={section} parsedConfig={localConfig} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50/50 to-white p-5 rounded-2xl border-2 border-emerald-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-700">Title</label>
            <input type="text" className="w-full border-2 border-emerald-200 rounded-xl p-3 bg-emerald-50/30 text-gray-900 font-medium" disabled value={section.title || ""} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-700">Status</label>
            <div className={`px-4 py-3 rounded-xl font-semibold ${
              section.enabled 
                ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300" 
                : "bg-gray-100 text-gray-600 border-2 border-gray-300"
            }`}>
              {section.enabled ? "Enabled" : "Disabled"}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        {renderSpecializedEditor()}
      </div>
    </div>
  );
}

