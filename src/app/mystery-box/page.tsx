import type { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";
import { Gift, Sparkles, ShoppingBag, Lock } from "lucide-react";
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
      pageType: "MYSTERY_BOX",
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

async function getMysteryBoxData(organizationId: string) {
  const now = new Date();

  const boxes = await prisma.mysteryBox.findMany({
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
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return boxes;
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
    title: "Mystery Boxes | Surprise Bundles | NexMart",
    description: "Discover our exciting mystery boxes! Get surprise products worth more than you pay. Limited stock available.",
    keywords: ["mystery box", "surprise bundle", "gift box", "NexMart mystery"],
    openGraph: {
      title: "Mystery Boxes | Surprise Bundles | NexMart",
      description: "Get surprise products worth more than you pay with our mystery boxes.",
      type: "website",
    },
  };
}

export default async function MysteryBoxPage() {
  const organizationId = await getDefaultOrganizationId();
  const pageBuilderPage = await getPageBuilderData(organizationId);
  const boxes = await getMysteryBoxData(organizationId);

  // If Page Builder page exists, use it
  if (pageBuilderPage) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageBuilderPage.name,
      description: pageBuilderPage.seoDescription || "Mystery boxes at NexMart",
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
                return <ProductGridSection key={section.id} section={section} products={boxes} />;
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
  const validBoxes = boxes;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Mystery Boxes",
    description: "Surprise bundles and mystery boxes at NexMart",
    url: "https://nexmart.ma/mystery-box",
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="page-enter">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-rose-600 to-red-600">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-20" />
          <div className="container-main py-20 md:py-28 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 animate-bounce">
                <Sparkles className="w-4 h-4" />
                Surprise Bundles
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                Mystery Boxes
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-medium mb-8 max-w-2xl mx-auto">
                Unbox the excitement! Get surprise products worth more than you pay.
              </p>
            </div>
          </div>
        </section>

        {/* Mystery Boxes Section */}
        <section className="py-16 md:py-24">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Available <span className="gradient-pink">Mystery Boxes</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Limited stock - grab yours before they're gone!
              </p>
            </div>

            {validBoxes.length === 0 ? (
              <div className="text-center py-16">
                <Gift className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No Mystery Boxes Available</h3>
                <p className="text-muted-foreground">
                  Check back later for new mystery box drops.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {validBoxes.map((box) => {
                  const validProducts = (box as any).products?.filter((bp: any) => bp.product) || [];
                  const isSoldOut = box.stockLimit && box.stockRemaining <= 0;

                  return (
                    <div
                      key={box.id}
                      className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-pink-500/50 transition-all hover:shadow-xl"
                    >
                      {/* Box Image */}
                      <div className="relative aspect-square">
                        {box.heroImage ? (
                          <img
                            src={box.heroImage}
                            alt={box.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                            <Gift className="w-24 h-24 text-pink-300" />
                          </div>
                        )}
                        {isSoldOut && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="px-6 py-3 bg-white text-gray-900 font-bold rounded-full">
                              SOLD OUT
                            </div>
                          </div>
                        )}
                        {box.featured && !isSoldOut && (
                          <div className="absolute top-4 left-4 px-3 py-1 bg-pink-500 text-white text-sm font-bold rounded-full">
                            Featured
                          </div>
                        )}
                      </div>

                      {/* Box Content */}
                      <div className="p-6">
                        <h3 className="font-display text-xl font-bold mb-2">{box.name}</h3>
                        {box.description && (
                          <p className="text-muted-foreground text-sm mb-4">
                            {box.description}
                          </p>
                        )}

                        {/* Value Display */}
                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-muted-foreground">
                                You Pay
                              </div>
                              <div className="text-2xl font-bold text-pink-600">
                                {box.price.toFixed(2)} MAD
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">
                                Worth
                              </div>
                              <div className="text-2xl font-bold text-green-600">
                                {box.originalValue.toFixed(2)} MAD
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <span className="text-sm font-semibold text-green-600">
                              Save {(box.originalValue - box.price).toFixed(2)} MAD
                            </span>
                          </div>
                        </div>

                        {/* Stock Info */}
                        {box.stockLimit && (
                          <div className="flex items-center justify-between text-sm mb-4">
                            <span className="text-muted-foreground">
                              {box.stockRemaining} left
                            </span>
                            <div className="flex items-center gap-1">
                              <Lock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Limited Stock
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Products Preview */}
                        <div className="mb-4">
                          <div className="text-sm text-muted-foreground mb-2">
                            Contains {validProducts.length}+ items
                          </div>
                          <div className="flex -space-x-2">
                            {validProducts.slice(0, 4).map((bp: any) => (
                              <div
                                key={bp.id}
                                className="w-10 h-10 rounded-full border-2 border-white bg-muted overflow-hidden"
                              >
                                {bp.product.images && bp.product.images[0] ? (
                                  <img
                                    src={bp.product.images[0]}
                                    alt={bp.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            ))}
                            {validProducts.length > 4 && (
                              <div className="w-10 h-10 rounded-full border-2 border-white bg-pink-100 flex items-center justify-center text-xs font-semibold text-pink-600">
                                +{validProducts.length - 4}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CTA */}
                        <button
                          disabled={isSoldOut || false}
                          className={`w-full px-6 py-3 font-semibold rounded-xl transition-all ${
                            isSoldOut
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:shadow-lg"
                          }`}
                        >
                          {isSoldOut ? "Sold Out" : "Buy Mystery Box"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-surface/50">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                How It <span className="gradient-pink">Works</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Simple steps to get your mystery box
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">Choose Your Box</h3>
                <p className="text-muted-foreground">
                  Select from our available mystery boxes
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">We Ship Fast</h3>
                <p className="text-muted-foreground">
                  Receive your mystery box within 2-3 business days
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">Unbox & Enjoy</h3>
                <p className="text-muted-foreground">
                  Discover your surprise products worth more than you paid
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-pink-600 via-rose-600 to-red-600 relative overflow-hidden">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-10" />
          <div className="container-main relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Get Mystery Box Alerts
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Subscribe to be the first to know when new mystery boxes drop.
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
                  className="px-8 py-4 bg-white text-pink-600 font-bold rounded-xl hover:bg-white/90 transition-all hover:scale-105"
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
