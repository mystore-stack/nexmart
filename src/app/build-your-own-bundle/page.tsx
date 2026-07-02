import type { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";
import { Layers, Plus, Check, ArrowRight } from "lucide-react";
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
      pageType: "BUILD_YOUR_OWN_BUNDLE",
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

async function getBuildYourOwnBundleData(organizationId: string) {
  const now = new Date();

  const bundles = await prisma.buildYourOwnBundle.findMany({
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
      discountTiers: {
        orderBy: { minProducts: "asc" },
      },
      categories: {
        include: {
          category: true,
        },
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
    title: "Build Your Own Bundle | Custom Bundles | NexMart",
    description: "Create your own custom bundle! Choose your favorite products and save with our tiered discount system at NexMart.",
    keywords: ["build your own bundle", "custom bundle", "personalized bundle", "NexMart"],
    openGraph: {
      title: "Build Your Own Bundle | Custom Bundles | NexMart",
      description: "Create your own custom bundle and save with tiered discounts.",
      type: "website",
    },
  };
}

export default async function BuildYourOwnBundlePage() {
  const organizationId = await getDefaultOrganizationId();
  const pageBuilderPage = await getPageBuilderData(organizationId);
  const bundles = await getBuildYourOwnBundleData(organizationId);

  // If Page Builder page exists, use it
  if (pageBuilderPage) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageBuilderPage.name,
      description: pageBuilderPage.seoDescription || "Build your own bundle at NexMart",
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
    name: "Build Your Own Bundle",
    description: "Create custom bundles at NexMart",
    url: "https://nexmart.ma/build-your-own-bundle",
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="page-enter">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-20" />
          <div className="container-main py-20 md:py-28 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                <Layers className="w-4 h-4" />
                Custom Bundles
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                Build Your Own Bundle
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-medium mb-8 max-w-2xl mx-auto">
                Create your perfect bundle with your favorite products and save more with tiered discounts.
              </p>
            </div>
          </div>
        </section>

        {/* Bundle Configurations */}
        <section className="py-16 md:py-24">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Available <span className="gradient-blue">Bundle Templates</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Choose a template and customize it with your favorite products
              </p>
            </div>

            {bundles.length === 0 ? (
              <div className="text-center py-16">
                <Layers className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No Bundle Templates Available</h3>
                <p className="text-muted-foreground">
                  Check back later for new bundle templates.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {bundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-xl"
                  >
                    {/* Bundle Header */}
                    <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                      <h3 className="font-display text-2xl font-bold mb-2">{bundle.name}</h3>
                      {bundle.description && (
                        <p className="text-white/90">{bundle.description}</p>
                      )}
                    </div>

                    {/* Bundle Details */}
                    <div className="p-6">
                      {/* Product Range */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-center flex-1">
                          <div className="text-3xl font-bold text-blue-600">
                            {bundle.minProducts}
                          </div>
                          <div className="text-sm text-muted-foreground">Min Products</div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-muted-foreground" />
                        <div className="text-center flex-1">
                          <div className="text-3xl font-bold text-blue-600">
                            {bundle.maxProducts}
                          </div>
                          <div className="text-sm text-muted-foreground">Max Products</div>
                        </div>
                      </div>

                      {/* Categories */}
                      {bundle.categories.length > 0 && (
                        <div className="mb-6">
                          <div className="text-sm font-semibold mb-3">Available Categories:</div>
                          <div className="flex flex-wrap gap-2">
                            {bundle.categories.map((bc: any) => (
                              <span
                                key={bc.id}
                                className={`px-3 py-1 rounded-full text-sm ${
                                  bc.required
                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {bc.category.name}
                                {bc.required && <span className="ml-1">*</span>}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            * Required category
                          </div>
                        </div>
                      )}

                      {/* Discount Tiers */}
                      <div className="mb-6">
                        <div className="text-sm font-semibold mb-3">Discount Tiers:</div>
                        <div className="space-y-2">
                          {bundle.discountTiers.map((tier) => (
                            <div
                              key={tier.id}
                              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                            >
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">
                                  {tier.minProducts}+ products
                                </span>
                              </div>
                              <span className="font-bold text-blue-600">
                                {tier.discountPercent}% OFF
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" />
                        Build Your Bundle
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
                How It <span className="gradient-blue">Works</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Create your custom bundle in 3 easy steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">Choose Template</h3>
                <p className="text-muted-foreground">
                  Select a bundle template that fits your needs
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">Add Products</h3>
                <p className="text-muted-foreground">
                  Pick your favorite products from available categories
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">Save Big</h3>
                <p className="text-muted-foreground">
                  Get automatic discounts based on your bundle size
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-10" />
          <div className="container-main relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Get Bundle Inspiration
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Subscribe to receive bundle ideas and exclusive custom bundle offers.
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
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-105"
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
