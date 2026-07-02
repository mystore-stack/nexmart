import type { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";
import { Package, ShoppingBag, Star, ArrowRight } from "lucide-react";
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
      pageType: "FREQUENTLY_BOUGHT_TOGETHER",
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

async function getFrequentlyBoughtTogetherData(organizationId: string) {
  const now = new Date();

  const bundles = await prisma.frequentlyBoughtTogether.findMany({
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
      products: {
        include: {
          product: true,
        },
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return bundles.filter((bundle) =>
    bundle.products.some((bp) => bp.product)
  );
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
    title: "Frequently Bought Together | Complete Sets | NexMart",
    description: "Discover products frequently bought together. Save more by purchasing complete sets and bundles at NexMart.",
    keywords: ["frequently bought together", "product bundles", "complete sets", "NexMart bundles"],
    openGraph: {
      title: "Frequently Bought Together | Complete Sets | NexMart",
      description: "Discover products frequently bought together and save more.",
      type: "website",
    },
  };
}

export default async function FrequentlyBoughtTogetherPage() {
  const organizationId = await getDefaultOrganizationId();
  const pageBuilderPage = await getPageBuilderData(organizationId);
  const bundles = await getFrequentlyBoughtTogetherData(organizationId);

  // If Page Builder page exists, use it
  if (pageBuilderPage) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageBuilderPage.name,
      description: pageBuilderPage.seoDescription || "Frequently bought together at NexMart",
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
  const validBundles = bundles;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Frequently Bought Together",
    description: "Products frequently bought together at NexMart",
    url: "https://nexmart.ma/frequently-bought-together",
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="page-enter">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-20" />
          <div className="container-main py-20 md:py-28 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                <Package className="w-4 h-4" />
                Complete Sets
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                Frequently Bought Together
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-medium mb-8 max-w-2xl mx-auto">
                Discover products that go perfectly together. Save more by purchasing complete sets.
              </p>
            </div>
          </div>
        </section>

        {/* Bundles Section */}
        <section className="py-16 md:py-24">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Popular <span className="gradient-purple">Combinations</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Products our customers love to buy together
              </p>
            </div>

            {validBundles.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No Combinations Available</h3>
                <p className="text-muted-foreground">
                  Check back later for new product combinations and bundles.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {validBundles.map((bundle) => {
                  const validProducts = bundle.products.filter((bp) => bp.product);
                  const totalPrice = validProducts.reduce(
                    (sum, bp) => sum + bp.product.price,
                    0
                  );

                  return (
                    <div
                      key={bundle.id}
                      className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-xl"
                    >
                      {/* Bundle Header */}
                      <div className="p-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                        <h3 className="font-display text-2xl font-bold mb-2">{bundle.name}</h3>
                        {bundle.description && (
                          <p className="text-white/90">{bundle.description}</p>
                        )}
                      </div>

                      {/* Products */}
                      <div className="p-6">
                        <div className="space-y-4">
                          {validProducts.map((bp, index) => (
                            <div
                              key={bp.id}
                              className="flex items-center gap-4"
                            >
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {bp.product.images && bp.product.images[0] ? (
                                  <img
                                    src={bp.product.images[0]}
                                    alt={bp.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{bp.product.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">
                                    {bp.product.price.toFixed(2)} MAD
                                  </span>
                                  {bp.product.rating > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs text-muted-foreground">
                                        {bp.product.rating}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {index < validProducts.length - 1 && (
                                <div className="text-muted-foreground">
                                  <ArrowRight className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="mt-6 pt-6 border-t border-border">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-muted-foreground">Total Value:</span>
                            <span className="text-2xl font-bold">
                              {totalPrice.toFixed(2)} MAD
                            </span>
                          </div>
                          <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                            Add All to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-10" />
          <div className="container-main relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Get Bundle Recommendations
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Subscribe to receive personalized product combinations and exclusive bundle offers.
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
                  className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-105"
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
