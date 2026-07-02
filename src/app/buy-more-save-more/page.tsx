import type { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";
import { TrendingUp, ShoppingCart, Percent, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";

// Section components
import { HeroSection } from "@/components/page-builder/sections/HeroSection";
import { ProductGridSection } from "@/components/page-builder/sections/ProductGridSection";
import { NewsletterSection } from "@/components/page-builder/sections/NewsletterSection";
import { TextBlockSection } from "@/components/page-builder/sections/TextBlockSection";
import { BenefitsSection } from "@/components/page-builder/sections/BenefitsSection";
import { CTASection } from "@/components/page-builder/sections/CTASection";

async function getPageBuilderData(organizationId: string) {
  const now = new Date();
  
  const page = await prisma.pageBuilderPage.findFirst({
    where: {
      organizationId,
      pageType: "BUY_MORE_SAVE_MORE",
      enabled: true,
      status: "PUBLISHED",
      publishDate: { lte: now },
      unpublishDate: { gte: now },
    },
    include: {
      sections: {
        where: { enabled: true },
        orderBy: { displayOrder: "asc" },
      },
      banners: {
        where: { active: true },
        orderBy: { priority: "desc" },
      },
    },
  });

  if (!page) return null;

  const activeBanners = page.banners.filter(
    (banner) =>
      (!banner.startDate || banner.startDate <= now) &&
      (!banner.endDate || banner.endDate >= now)
  );

  return { ...page, banners: activeBanners };
}

async function getBuyMoreSaveMoreData(organizationId: string) {
  const now = new Date();

  const bundles = await prisma.buyMoreSaveMore.findMany({
    where: {
      organizationId,
      enabled: true,
      status: "PUBLISHED",
      AND: [
        {
          OR: [
            { startDate: null },
            { startDate: { lte: now } },
          ],
        },
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    },
    include: {
      rules: {
        orderBy: { minQuantity: "asc" },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return bundles;
}

export async function generateMetadata(): Promise<Metadata> {
  const organizationId = await getDefaultOrganizationId();
  const pageBuilderPage = await getPageBuilderData(organizationId);

  if (pageBuilderPage?.seoTitle) {
    return {
      title: pageBuilderPage.seoTitle,
      description: pageBuilderPage.seoDescription || undefined,
      openGraph: {
        title: pageBuilderPage.seoTitle,
        description: pageBuilderPage.seoDescription || undefined,
        images: pageBuilderPage.ogImage ? [{ url: pageBuilderPage.ogImage }] : undefined,
      },
    };
  }

  return {
    title: "Buy More Save More | Volume Discounts | NexMart",
    description: "Save more when you buy in bulk! Get exclusive volume discounts and tiered pricing on your favorite products at NexMart.",
    keywords: ["buy more save more", "volume discounts", "bulk pricing", "tiered discounts", "NexMart"],
    openGraph: {
      title: "Buy More Save More | Volume Discounts | NexMart",
      description: "Save more when you buy in bulk with our tiered pricing system.",
      type: "website",
    },
  };
}

export default async function BuyMoreSaveMorePage() {
  const organizationId = await getDefaultOrganizationId();
  const pageBuilderPage = await getPageBuilderData(organizationId);
  const bundles = await getBuyMoreSaveMoreData(organizationId);

  // If Page Builder page exists, use it
  if (pageBuilderPage) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageBuilderPage.name,
      description: pageBuilderPage.seoDescription || "Buy more save more at NexMart",
      url: `https://nexmart.ma/${pageBuilderPage.slug}`,
    };

    return (
      <>
        <StructuredData data={structuredData} />
        <div style={{ 
          '--accent-color': pageBuilderPage.accentColor,
          '--section-background': pageBuilderPage.sectionBackground,
        } as React.CSSProperties}>
          {pageBuilderPage.banners.map((banner) => (
            <a
              key={banner.id}
              href={banner.link || "#"}
              target={banner.openInNewTab ? "_blank" : "_self"}
              rel={banner.openInNewTab ? "noopener noreferrer" : undefined}
              className="block w-full"
            >
              <img
                src={banner.image}
                alt="Banner"
                className="w-full h-auto object-cover"
              />
            </a>
          ))}

          {pageBuilderPage.sections.map((section) => {
            const config = section.config as any;
            
            switch (section.sectionType) {
              case "HERO":
                return <HeroSection key={section.id} section={section} />;
              case "PRODUCT_GRID":
                return <ProductGridSection key={section.id} section={section} products={bundles} />;
              case "NEWSLETTER":
                return <NewsletterSection key={section.id} section={section} />;
              case "TEXT_BLOCK":
                return <TextBlockSection key={section.id} section={section} />;
              case "BENEFITS":
                return <BenefitsSection key={section.id} section={section} />;
              case "CTA_BANNER":
                return <CTASection key={section.id} section={section} />;
              default:
                return null;
            }
          })}
        </div>
      </>
    );
  }

  // Fallback to original implementation if no Page Builder page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Buy More Save More",
    description: "Volume discounts and tiered pricing at NexMart",
    url: "https://nexmart.ma/buy-more-save-more",
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="page-enter">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-teal-600 to-cyan-600">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-20" />
          <div className="container-main py-20 md:py-28 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                <TrendingUp className="w-4 h-4" />
                Volume Discounts
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                Buy More, Save More
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-medium mb-8 max-w-2xl mx-auto">
                The more you buy, the more you save! Get exclusive discounts on bulk purchases.
              </p>
            </div>
          </div>
        </section>

        {/* Discount Rules Section */}
        <section className="py-16 md:py-24">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Active <span className="gradient-green">Discount Tiers</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Unlock bigger savings when you purchase more items
              </p>
            </div>

            {bundles.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No Active Discounts</h3>
                <p className="text-muted-foreground">
                  Check back later for new volume discount offers.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-green-500/50 transition-all hover:shadow-xl"
                  >
                    {/* Bundle Header */}
                    <div className="p-6 bg-gradient-to-r from-green-500 to-teal-500 text-white">
                      <h3 className="font-display text-xl font-bold mb-2">{bundle.name}</h3>
                      {bundle.description && (
                        <p className="text-white/90 text-sm">{bundle.description}</p>
                      )}
                    </div>

                    {/* Discount Rules */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {bundle.rules
                          .sort((a, b) => a.minQuantity - b.minQuantity)
                          .map((rule, index) => (
                            <div
                              key={rule.id}
                              className={`flex items-center justify-between p-4 rounded-xl border ${
                                index === bundle.rules.length - 1
                                  ? "bg-green-50 border-green-200"
                                  : "bg-muted border-border"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <Tag className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-semibold">
                                    Buy {rule.minQuantity}+
                                  </div>
                                  {rule.applicableCategories.length > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      {rule.applicableCategories.join(", ")}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                {rule.discountType === "PERCENTAGE" ? (
                                  <div className="flex items-center gap-1 text-green-600 font-bold">
                                    <Percent className="w-4 h-4" />
                                    <span>{rule.discountValue}% OFF</span>
                                  </div>
                                ) : (
                                  <div className="text-green-600 font-bold">
                                    Save {rule.discountValue} MAD
                                  </div>
                                )}
                                {rule.maxDiscount && (
                                  <div className="text-xs text-muted-foreground">
                                    Max {rule.maxDiscount} MAD
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* CTA */}
                      <button className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                        Start Shopping
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-surface/50">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                How It <span className="gradient-green">Works</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Simple steps to maximize your savings
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">Add Products</h3>
                <p className="text-muted-foreground">
                  Add items to your cart from eligible categories
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">Reach Threshold</h3>
                <p className="text-muted-foreground">
                  Meet the minimum quantity for your desired discount tier
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">Save Automatically</h3>
                <p className="text-muted-foreground">
                  Discount applied automatically at checkout
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-green-600 via-teal-600 to-cyan-600 relative overflow-hidden">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-10" />
          <div className="container-main relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Get Volume Deal Alerts
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Subscribe to receive notifications about new volume discounts and bulk offers.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-105"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
