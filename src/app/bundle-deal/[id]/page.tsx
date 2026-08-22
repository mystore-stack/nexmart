import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Package, Sparkles, ArrowLeft, Check, Truck, Gift } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import Link from "next/link";
import BundleDealActions from "./BundleDealActions";

async function getBundleDeal(id: string) {
  const organizationId = await getDefaultOrganizationId();

  // Validate UUID format
  if (!id || id.length !== 36 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    console.error("[BUNDLE_DEAL] Invalid UUID format:", id);
    return null;
  }

  const bundleDeal = await prisma.bundleDeal.findFirst({
    where: {
      id,
      organizationId,
      isVisible: true,
    },
    include: {
      products: {
        include: {
          product: {
            include: {
              variants: true,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return bundleDeal;
}

async function getRelatedBundles(limit = 4) {
  const organizationId = await getDefaultOrganizationId();

  const bundles = await prisma.bundleDeal.findMany({
    where: {
      organizationId,
      isVisible: true,
    },
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  return bundles;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const bundleDeal = await getBundleDeal(id);

  if (!bundleDeal) {
    return {
      title: "Bundle Deal Not Found | NexMart",
    };
  }

  return {
    title: `${bundleDeal.name} | Bundle Deal | NexMart`,
    description: bundleDeal.description || `Save ${bundleDeal.discountPercent}% with this amazing bundle deal!`,
    openGraph: {
      title: bundleDeal.name,
      description: bundleDeal.description || `Save ${bundleDeal.discountPercent}% with this amazing bundle deal!`,
      images: bundleDeal.image ? [{ url: bundleDeal.image }] : undefined,
      type: "website",
    },
  };
}

export default async function BundleDealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundleDeal = await getBundleDeal(id);

  if (!bundleDeal) {
    notFound();
  }

  const relatedBundles = await getRelatedBundles();

  // Calculate total original price and savings
  const totalOriginalPrice = bundleDeal.products.reduce((sum: number, bp: any) => {
    return sum + (bp.product.price || 0);
  }, 0);

  const totalSavings = totalOriginalPrice - bundleDeal.bundlePrice;
  const savingsPercent = totalOriginalPrice > 0 ? Math.round((totalSavings / totalOriginalPrice) * 100) : 0;

  // Check stock availability for all products
  const isOutOfStock = bundleDeal.products.some((bp: any) => (bp.product.stock ?? 0) <= 0);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bundleDeal.name,
    description: bundleDeal.description,
    image: bundleDeal.image,
    offers: {
      "@type": "Offer",
      price: bundleDeal.bundlePrice,
      priceCurrency: "MAD",
      availability: isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 relative overflow-hidden">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-20" />
          <div className="container-main py-8 relative">
            <Link
              href="/bundles"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bundle Deals
            </Link>
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Bundle Deal
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
                {bundleDeal.name}
              </h1>
              {bundleDeal.description && (
                <p className="text-xl text-white/90 max-w-2xl">
                  {bundleDeal.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-main py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Image */}
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100">
                {bundleDeal.image ? (
                  <img
                    src={bundleDeal.image}
                    alt={bundleDeal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-32 h-32 text-purple-300" />
                  </div>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="px-8 py-4 bg-white text-gray-900 font-bold text-xl rounded-full">
                      Out of Stock
                    </div>
                  </div>
                )}
              </div>

              {/* Savings Display */}
              <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Bundle Price</div>
                    <div className="text-4xl font-bold text-purple-600">
                      {bundleDeal.bundlePrice.toFixed(2)} MAD
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Original Value</div>
                    <div className="text-2xl font-bold text-gray-400 line-through">
                      {totalOriginalPrice.toFixed(2)} MAD
                    </div>
                  </div>
                </div>
                <div className="text-center py-4 bg-white rounded-xl">
                  <span className="text-2xl font-bold text-green-600">
                    Save {totalSavings.toFixed(2)} MAD
                  </span>
                  <div className="text-lg font-semibold text-purple-600 mt-1">
                    {savingsPercent}% OFF
                  </div>
                </div>
              </div>

              {/* Free Shipping Badge */}
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <Truck className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-800">Free Shipping</div>
                  <div className="text-sm text-green-600">Estimated delivery: 2-3 business days</div>
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div>
              {/* Included Products */}
              <div className="mb-6">
                <h3 className="font-display text-2xl font-bold mb-4">Included Products ({bundleDeal.products.length})</h3>
                <div className="space-y-3">
                  {bundleDeal.products.map((bundleProduct: any) => (
                    <div
                      key={bundleProduct.id}
                      className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4"
                    >
                      <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {bundleProduct.product.images[0] ? (
                          <img
                            src={bundleProduct.product.images[0]}
                            alt={bundleProduct.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{bundleProduct.product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground line-through">
                            {bundleProduct.product.price.toFixed(2)} MAD
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            Included
                          </span>
                        </div>
                        {bundleProduct.product.variants && bundleProduct.product.variants.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {bundleProduct.product.variants.length} variants available
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bundle Benefits */}
              <div className="mb-6">
                <h3 className="font-display text-2xl font-bold mb-4">Why Buy This Bundle?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Huge Savings</div>
                      <div className="text-sm text-muted-foreground">Save {savingsPercent}% compared to buying individually</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Free Shipping</div>
                      <div className="text-sm text-muted-foreground">No additional shipping costs</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Curated Selection</div>
                      <div className="text-sm text-muted-foreground">Products that work perfectly together</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">One-Time Purchase</div>
                      <div className="text-sm text-muted-foreground">Get everything in one order</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <BundleDealActions
                bundleDeal={bundleDeal}
                bundlePrice={bundleDeal.bundlePrice}
                isOutOfStock={isOutOfStock}
              />

              {!isOutOfStock && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Secure payment • Free shipping • Satisfaction guaranteed
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Related Bundles */}
        {relatedBundles.length > 0 && (
          <section className="py-12 bg-surface/50">
            <div className="container-main">
              <h2 className="font-display text-3xl font-bold mb-6">Related Bundles</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedBundles
                  .filter((b: any) => b.id !== bundleDeal.id)
                  .slice(0, 4)
                  .map((bundle: any) => {
                    const bundleOriginalPrice = bundle.products.reduce((sum: number, bp: any) => sum + (bp.product.price || 0), 0);
                    const bundleSavings = bundleOriginalPrice - bundle.bundlePrice;
                    const bundleSavingsPercent = bundleOriginalPrice > 0 
                      ? Math.round((bundleSavings / bundleOriginalPrice) * 100) 
                      : 0;

                    return (
                      <Link
                        key={bundle.id}
                        href={`/bundles/${bundle.id}`}
                        className="group"
                      >
                        <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-square relative">
                            {bundle.image ? (
                              <img
                                src={bundle.image}
                                alt={bundle.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
                                <Package className="w-16 h-16 text-purple-300" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                              {bundleSavingsPercent}% OFF
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                              {bundle.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-purple-600">
                                {bundle.bundlePrice.toFixed(2)} MAD
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                {bundleOriginalPrice.toFixed(2)} MAD
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {bundle.products.length} products included
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
