"use client";

import React from "react";
import { HeroEditor } from "./components/HeroEditor";
import { ProductCollectionManager } from "./components/ProductCollectionManager";
import { NewsletterEditor } from "./components/NewsletterEditor";
import { RecommendedEditor } from "./components/RecommendedEditor";
import { CategoriesEditor } from "./components/CategoriesEditor";
import { FlashSaleEditor } from "./components/FlashSaleEditor";
import { BrandCarouselEditor } from "./components/BrandCarouselEditor";
import { PromoCardsEditor } from "./components/PromoCardsEditor";
import { ServiceBannersEditor } from "./components/ServiceBannersEditor";
import { MobileAppBannerEditor } from "./components/MobileAppBannerEditor";
import { BundleBuilderEditor } from "./components/BundleBuilderEditor";
import { SingleFlashOfferEditor } from "./components/SingleFlashOfferEditor";
import { BundleProductsEditor } from "./components/BundleProductsEditor";
import { ShowcaseGridEditor } from "./components/ShowcaseGridEditor";
import { GenericJsonEditor } from "./components/GenericJsonEditor";
import { BestMatchEditor } from "./components/BestMatchEditor";
import { EditorsChoiceEditor } from "./components/EditorsChoiceEditor";
import { NewArrivalsEditor } from "./components/NewArrivalsEditor";
import { BestSellersEditor } from "./components/BestSellersEditor";
import { FeaturedProductsEditor } from "./components/FeaturedProductsEditor";
import { RelatedProductsEditor } from "./components/RelatedProductsEditor";
import { SuperDealsEditor } from "./components/SuperDealsEditor";
import { getCanonicalSection } from "@/lib/homepage/canonical-contract";

export function EditorForm({ section, parsedConfig }: { section: any; parsedConfig: any }) {
  const renderSpecializedEditor = () => {
    // Get the canonical section info to get the proper sectionType
    const canonicalSection = getCanonicalSection(section.sectionKey);
    const normalizedType = section.sectionType || canonicalSection?.sectionType;
    
    switch (normalizedType) {
      case "HERO":
        return <HeroEditor section={section} parsedConfig={parsedConfig} />;
      case "FEATURED_PRODUCTS":
        return <FeaturedProductsEditor section={section} parsedConfig={parsedConfig} />;
      case "BEST_SELLERS":
        return <BestSellersEditor section={section} parsedConfig={parsedConfig} />;
      case "NEW_ARRIVALS":
        return <NewArrivalsEditor section={section} parsedConfig={parsedConfig} />;
      case "EDITORS_CHOICE":
        return <EditorsChoiceEditor section={section} parsedConfig={parsedConfig} />;
      case "SEASONAL_COLLECTION":
      case "RECENTLY_VIEWED":
        return <ProductCollectionManager section={section} parsedConfig={parsedConfig} />;
      case "TRENDING_PRODUCTS":
        return <BestMatchEditor section={section} parsedConfig={parsedConfig} />;
      case "AI_RECOMMENDATIONS": // Related Products / Recommended
        if (section.sectionKey === "relatedProducts") {
          return <RelatedProductsEditor section={section} parsedConfig={parsedConfig} />;
        }
        if (section.sectionKey === "recommended") {
          return <RecommendedEditor section={section} parsedConfig={parsedConfig} />;
        }
        return <ProductCollectionManager section={section} parsedConfig={parsedConfig} />;
      case "CATEGORIES":
        return <CategoriesEditor section={section} parsedConfig={parsedConfig} />;
      case "FLASH_DEALS": // Super Deals / Flash Sale
        if (section.sectionKey === "superDeals") {
          return <SuperDealsEditor section={section} parsedConfig={parsedConfig} />;
        }
        return <FlashSaleEditor section={section} parsedConfig={parsedConfig} />;
      case "BRANDS": // Brand Carousel
        return <BrandCarouselEditor section={section} parsedConfig={parsedConfig} />;
      case "BANNER": // Mega Promo
      case "PROMOTIONAL_CARDS":
        return <PromoCardsEditor section={section} parsedConfig={parsedConfig} />;
      case "SERVICE_BANNERS":
        return <ServiceBannersEditor section={section} parsedConfig={parsedConfig} />;
      case "MOBILE_APP": // Mobile App Banner
        return <MobileAppBannerEditor section={section} parsedConfig={parsedConfig} />;
      case "BUNDLE_DEALS": // Bundle Builder / Bundle Products
        if (section.sectionKey === "bundleProducts") {
          return <BundleProductsEditor section={section} parsedConfig={parsedConfig} />;
        }
        return <BundleBuilderEditor section={section} parsedConfig={parsedConfig} />;
      case "SHOWCASE_GRID":
        return <ShowcaseGridEditor section={section} parsedConfig={parsedConfig} />;
      case "NEWSLETTER":
        return <NewsletterEditor section={section} parsedConfig={parsedConfig} />;
      default:
        // Fallback for sections that don't have a specialized editor built yet

        return <GenericJsonEditor section={section} parsedConfig={parsedConfig} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-xl border border-border">
        <h3 className="text-lg font-semibold mb-2">Basic Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <input type="text" className="w-full border rounded-lg p-2 bg-muted text-muted-foreground" disabled value={section.title || ""} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <input type="text" className="w-full border rounded-lg p-2 bg-muted text-muted-foreground" disabled value={section.active ? "Enabled" : "Disabled"} />
          </div>
        </div>
      </div>

      <div className="pt-4">
        {renderSpecializedEditor()}
      </div>
    </div>
  );
}

