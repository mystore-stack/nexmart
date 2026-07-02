import type { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";
import { Zap, Clock, Percent, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { notFound } from "next/navigation";

// Section components
import { HeroSection } from "@/components/page-builder/sections/HeroSection";
import { ProductGridSection } from "@/components/page-builder/sections/ProductGridSection";
import { NewsletterSection } from "@/components/page-builder/sections/NewsletterSection";
import { TextBlockSection } from "@/components/page-builder/sections/TextBlockSection";
import { CountdownTimerSection } from "@/components/page-builder/sections/CountdownTimerSection";
import { BenefitsSection } from "@/components/page-builder/sections/BenefitsSection";
import { CTASection } from "@/components/page-builder/sections/CTASection";

async function getPageBuilderData(organizationId: string) {
  const now = new Date();
  
  const page = await prisma.pageBuilderPage.findFirst({
    where: {
      organizationId,
      pageType: "FLASH_DEALS",
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

  // Filter banners by date range
  const activeBanners = page.banners.filter(
    (banner) =>
      (!banner.startDate || banner.startDate <= now) &&
      (!banner.endDate || banner.endDate >= now)
  );

  return { ...page, banners: activeBanners };
}

async function getFlashDealsData(organizationId: string) {
  const now = new Date();

  const flashDeals = await prisma.flashDeal.findMany({
    where: {
      organizationId,
      isActive: true,
      status: "PUBLISHED",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      products: {
        include: {
          product: true,
        },
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: { startDate: "asc" },
  });

  return flashDeals.filter((deal) =>
    deal.products.some((dp) => dp.product)
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
    title: "Flash Deals | Limited Time Offers | NexMart",
    description: "Don't miss out on our flash deals! Limited time discounts on your favorite products. Shop now and save big.",
    keywords: ["flash deals", "limited time offers", "discounts", "NexMart deals", "sale"],
    openGraph: {
      title: "Flash Deals | Limited Time Offers | NexMart",
      description: "Don't miss out on our flash deals! Limited time discounts on your favorite products.",
      type: "website",
    },
  };
}

export default async function FlashDealsPage() {
  const organizationId = await getDefaultOrganizationId();
  const pageBuilderPage = await getPageBuilderData(organizationId);
  const flashDeals = await getFlashDealsData(organizationId);
  const now = new Date();

  // If Page Builder page exists, use it
  if (pageBuilderPage) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageBuilderPage.name,
      description: pageBuilderPage.seoDescription || "Flash deals at NexMart",
      url: `https://nexmart.ma/${pageBuilderPage.slug}`,
    };

    return (
      <>
        <StructuredData data={structuredData} />
        <div style={{ 
          '--accent-color': pageBuilderPage.accentColor,
          '--section-background': pageBuilderPage.sectionBackground,
        } as React.CSSProperties}>
          {/* Render banners */}
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

          {/* Render sections */}
          {pageBuilderPage.sections.map((section) => {
            const config = section.config as any;
            
            switch (section.sectionType) {
              case "HERO":
                return <HeroSection key={section.id} section={section} />;
              case "PRODUCT_GRID":
                return <ProductGridSection key={section.id} section={section} products={flashDeals} />;
              case "NEWSLETTER":
                return <NewsletterSection key={section.id} section={section} />;
              case "TEXT_BLOCK":
                return <TextBlockSection key={section.id} section={section} />;
              case "COUNTDOWN_TIMER":
                return <CountdownTimerSection key={section.id} section={section} />;
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
    name: "Flash Deals",
    description: "Limited time offers and flash deals at NexMart",
    url: "https://nexmart.ma/flash-deals",
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="page-enter">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-pink-600">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-20" />
          <div className="container-main py-20 md:py-28 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 animate-pulse">
                <Zap className="w-4 h-4" />
                Limited Time Offers
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                Flash Deals
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-medium mb-8 max-w-2xl mx-auto">
                Hurry! These deals won't last long. Save up to 70% on selected products.
              </p>
            </div>
          </div>
        </section>

        {/* Flash Deals Section */}
        <section className="py-16 md:py-24">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Active <span className="gradient-orange">Flash Deals</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Grab these limited-time offers before they're gone
              </p>
            </div>

            {flashDeals.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No Active Flash Deals</h3>
                <p className="text-muted-foreground">
                  Check back later for new flash deals and limited-time offers.
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                {flashDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-surface border border-border rounded-2xl overflow-hidden"
                  >
                    {/* Deal Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-display text-2xl font-bold mb-2">{deal.name}</h3>
                          <div className="flex items-center gap-4">
                            {deal.discountPercent && (
                              <div className="flex items-center gap-1">
                                <Percent className="w-4 h-4" />
                                <span className="font-semibold">Up to {deal.discountPercent}% OFF</span>
                              </div>
                            )}
                            {deal.discountAmount && (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">Save {deal.discountAmount} MAD</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm opacity-90">Ends in</div>
                          <div className="font-mono text-lg font-bold">
                            {Math.ceil((new Date(deal.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}d
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Products Grid */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {deal.products
                          .filter((dp) => dp.product)
                          .map((dp) => (
                            <div
                              key={dp.id}
                              className="bg-background border border-border rounded-xl overflow-hidden hover:border-orange-500/50 transition-all hover:shadow-lg"
                            >
                              <div className="relative aspect-square">
                                {dp.product.images && dp.product.images[0] ? (
                                  <img
                                    src={dp.product.images[0]}
                                    alt={dp.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                                  </div>
                                )}
                                {dp.discountPercent && (
                                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                    -{dp.discountPercent}%
                                  </div>
                                )}
                              </div>
                              <div className="p-3">
                                <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                                  {dp.product.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                  {dp.discountPrice ? (
                                    <>
                                      <span className="font-bold text-orange-600">
                                        {dp.discountPrice.toFixed(2)} MAD
                                      </span>
                                      <span className="text-sm text-muted-foreground line-through">
                                        {dp.product.price.toFixed(2)} MAD
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-bold">
                                      {dp.product.price.toFixed(2)} MAD
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 relative overflow-hidden">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-10" />
          <div className="container-main relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Never Miss a Flash Deal
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Subscribe to our newsletter and be the first to know about new flash deals and exclusive discounts.
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
                  className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-105"
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
