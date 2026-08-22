import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gift, Sparkles, Clock, ArrowLeft, Check, Share2, Heart, ShoppingCart, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import Link from "next/link";
import SuperDealActions from "./SuperDealActions";

async function getSuperDeal(id: string) {
  const organizationId = await getDefaultOrganizationId();
  const now = new Date();

  // Validate UUID format
  if (!id || id.length !== 36 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    console.error("[SUPER_DEAL] Invalid UUID format:", id);
    return null;
  }

  const superDeal = await prisma.superDeal.findFirst({
    where: {
      id,
      organizationId,
      isVisible: true,
      isPublished: true,
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
  }) as any;

  return superDeal;
}

async function getRelatedProducts(productId: string, limit = 4) {
  const organizationId = await getDefaultOrganizationId();

  const products = await prisma.product.findMany({
    where: {
      organizationId,
      published: true,
      id: { not: productId },
      stock: { gt: 0 },
    },
    include: {
      category: true,
    },
    take: limit,
    orderBy: {
      soldCount: "desc",
    },
  });

  return products;
}

function getTimeRemaining(endDate: Date | null) {
  if (!endDate) return null;
  
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const superDeal = await getSuperDeal(id);

  if (!superDeal) {
    return {
      title: "Super Deal Not Found | NexMart",
    };
  }

  const discount = superDeal.discountType === "PERCENTAGE" 
    ? `${superDeal.discountValue}%` 
    : `${superDeal.discountValue} MAD`;

  return {
    title: superDeal.title || `Super Deal - ${superDeal.product?.name} | NexMart`,
    description: `Save ${discount} on ${superDeal.product?.name}. Limited time offer - don't miss out!`,
    openGraph: {
      title: superDeal.title || `Super Deal - ${superDeal.product?.name}`,
      description: `Save ${discount} on ${superDeal.product?.name}. Limited time offer!`,
      images: superDeal.image || superDeal.bannerImage || superDeal.product?.images?.[0] 
        ? [{ url: superDeal.image || superDeal.bannerImage || superDeal.product?.images?.[0] }] 
        : undefined,
      type: "website",
    },
  };
}

export default async function SuperDealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const superDeal = await getSuperDeal(id);

  if (!superDeal) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(superDeal.productId);
  const timeRemaining = getTimeRemaining(superDeal.endDate);
  const isExpired = !timeRemaining;

  const originalPrice = superDeal.originalPrice ?? superDeal.product?.comparePrice ?? superDeal.product?.price ?? 0;
  const dealPrice = superDeal.dealPrice ?? superDeal.product?.price ?? 0;
  const savings = originalPrice - dealPrice;
  const discountPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;
  const stockRemaining = superDeal.stockLimit ?? superDeal.product?.stock ?? 0;
  const isSoldOut = stockRemaining <= 0;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: superDeal.product?.name,
    description: superDeal.product?.description,
    image: superDeal.product?.images?.[0],
    offers: {
      "@type": "Offer",
      price: dealPrice,
      priceCurrency: "MAD",
      availability: isSoldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      priceValidUntil: superDeal.endDate?.toISOString(),
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
        <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-20" />
          <div className="container-main py-8 relative">
            <Link
              href="/super-deals"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Super Deals
            </Link>
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Limited Time Offer
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
                {superDeal.title || "Super Deal"}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                {superDeal.product?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-main py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Image */}
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-red-100 to-orange-100">
                {superDeal.image || superDeal.bannerImage || superDeal.product?.images?.[0] ? (
                  <img
                    src={superDeal.image || superDeal.bannerImage || superDeal.product?.images?.[0]}
                    alt={superDeal.product?.name || "Super Deal"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gift className="w-32 h-32 text-red-300" />
                  </div>
                )}
                {isExpired && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="px-8 py-4 bg-white text-gray-900 font-bold text-xl rounded-full">
                      Deal Expired
                    </div>
                  </div>
                )}
                {isSoldOut && !isExpired && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="px-8 py-4 bg-white text-gray-900 font-bold text-xl rounded-full">
                      Sold Out
                    </div>
                  </div>
                )}
                {superDeal.featured && !isExpired && !isSoldOut && (
                  <div className="absolute top-4 left-4 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full">
                    Featured
                  </div>
                )}
                {superDeal.flashSale && !isExpired && !isSoldOut && (
                  <div className="absolute top-4 right-4 px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-full animate-pulse">
                    Flash Sale
                  </div>
                )}
              </div>

              {/* Countdown Timer */}
              {timeRemaining && superDeal.countdown && (
                <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-600">Time Remaining</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{timeRemaining.days}</div>
                      <div className="text-sm text-muted-foreground">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{timeRemaining.hours}</div>
                      <div className="text-sm text-muted-foreground">Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{timeRemaining.minutes}</div>
                      <div className="text-sm text-muted-foreground">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{timeRemaining.seconds}</div>
                      <div className="text-sm text-muted-foreground">Seconds</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Progress */}
              {superDeal.stockLimit && !isExpired && (
                <div className="mt-4 bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Stock Remaining</span>
                    <span className="font-semibold">{stockRemaining} left</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${(stockRemaining / superDeal.stockLimit) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div>
              {/* Price Display */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Deal Price</div>
                    <div className="text-4xl font-bold text-red-600">
                      {dealPrice.toFixed(2)} MAD
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Original Price</div>
                    <div className="text-2xl font-bold text-gray-400 line-through">
                      {originalPrice.toFixed(2)} MAD
                    </div>
                  </div>
                </div>
                <div className="text-center py-4 bg-white rounded-xl">
                  <span className="text-2xl font-bold text-green-600">
                    Save {savings.toFixed(2)} MAD
                  </span>
                  <div className="text-lg font-semibold text-red-600 mt-1">
                    {discountPercent}% OFF
                  </div>
                </div>
              </div>

              {/* Product Description */}
              {superDeal.product?.description && (
                <div className="mb-6">
                  <h3 className="font-display text-xl font-bold mb-3">Description</h3>
                  <p className="text-muted-foreground">{superDeal.product.description}</p>
                </div>
              )}

              {/* Specifications */}
              {superDeal.product && (
                <div className="mb-6">
                  <h3 className="font-display text-xl font-bold mb-3">Specifications</h3>
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">SKU:</span>
                        <span className="ml-2 font-medium">{superDeal.product.sku}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <span className="ml-2 font-medium">{superDeal.product.category?.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stock:</span>
                        <span className="ml-2 font-medium">{superDeal.product.stock}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rating:</span>
                        <span className="ml-2 font-medium flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {superDeal.product.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="mb-6">
                <h3 className="font-display text-xl font-bold mb-3">Why Buy This Deal?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Huge Savings</div>
                      <div className="text-sm text-muted-foreground">Save {discountPercent}% on this product</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Limited Time</div>
                      <div className="text-sm text-muted-foreground">Offer ends soon - don't miss out</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Authentic Product</div>
                      <div className="text-sm text-muted-foreground">100% genuine with warranty</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <SuperDealActions
                superDeal={superDeal}
                dealPrice={dealPrice}
                isExpired={isExpired}
                isSoldOut={isSoldOut}
              />

              {!isExpired && !isSoldOut && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Secure payment • Fast delivery • Satisfaction guaranteed
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product Gallery */}
        {superDeal.product?.images && superDeal.product.images.length > 1 && (
          <section className="py-12 bg-surface/50">
            <div className="container-main">
              <h2 className="font-display text-3xl font-bold mb-6">Product Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {superDeal.product.images.map((image: string, index: number) => (
                  <div key={index} className="aspect-square rounded-xl overflow-hidden bg-muted">
                    <img
                      src={image}
                      alt={`${superDeal.product?.name || 'Product'} ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Customer Reviews */}
        <section className="py-12">
          <div className="container-main">
            <h2 className="font-display text-3xl font-bold mb-6">Customer Reviews</h2>
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl font-bold">{superDeal.product?.rating.toFixed(1)}</div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(superDeal.product?.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {superDeal.product?.reviewCount} reviews
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                This product has received excellent reviews from our customers.
              </p>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 bg-surface/50">
            <div className="container-main">
              <h2 className="font-display text-3xl font-bold mb-6">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group"
                  >
                    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square relative">
                        {product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">
                            {product.price.toFixed(2)} MAD
                          </span>
                          {product.comparePrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {product.comparePrice.toFixed(2)} MAD
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
