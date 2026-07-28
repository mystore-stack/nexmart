import type { Metadata } from "next";
import { HeroSection, PremiumCategorySection } from "@/components/homepage";
import {
  TrustSection,
  NewsletterSection,
} from "@/components/marketplace";
import { CuratedCollectionsSection } from "@/components/homepage/CuratedCollectionsSection";
import { TrendingProductsSection } from "@/components/homepage/TrendingProductsSection";
import { MoroccanIdentitySection } from "@/components/homepage/MoroccanIdentitySection";
import { FeaturedProductsGrid } from "@/components/homepage/FeaturedProductsGrid";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "NexStore - Premium Moroccan Marketplace",
  description:
    "Discover premium products with fast delivery, secure payments, and curated Moroccan collections. Experience luxury shopping reimagined.",
};

export default function PremiumHomePage() {
  return (
    <div className="w-full bg-white text-slate-950">
      {/* Hero Section */}
      <HeroSection />

      {/* Premium Category Section */}
      <PremiumCategorySection />

      {/* Curated Collections */}
      <CuratedCollectionsSection />

      {/* Trending Products */}
      <TrendingProductsSection />

      {/* Moroccan Identity Section */}
      <MoroccanIdentitySection />

      {/* Featured Products Grid */}
      <FeaturedProductsGrid />

      {/* Trust Section */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-[1480px] px-4 py-12 sm:px-6 lg:px-8">
          <TrustSection />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="mx-auto max-w-[1480px] px-4 py-12 sm:px-6 lg:px-8">
        <NewsletterSection
          title="Get Exclusive Deals"
          subtitle="Subscribe to our newsletter for special offers and insider tips delivered directly to your inbox."
        />
      </section>
    </div>
  );
}
