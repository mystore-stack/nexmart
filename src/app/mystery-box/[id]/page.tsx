import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gift, Sparkles, ShoppingBag, Lock, ArrowLeft, Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import Link from "next/link";
import { BuyNowButton } from "./BuyNowButton";

async function getMysteryBox(id: string) {
  const organizationId = await getDefaultOrganizationId();
  const now = new Date();

  console.log('[MYSTERY_BOX_DETAIL] Fetching box', { id, organizationId, now });

  // Check if ID is a UUID or slug
  const isUuid = id.length === 36 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  console.log('[MYSTERY_BOX_DETAIL] ID type:', isUuid ? 'UUID' : 'slug');

  let boxWithoutFilters;

  if (isUuid) {
    // Query by UUID
    boxWithoutFilters = await prisma.mysteryBox.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  } else {
    // Query by slug
    boxWithoutFilters = await prisma.mysteryBox.findFirst({
      where: { 
        slug: id,
        organizationId,
      },
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  }

  if (!boxWithoutFilters) {
    console.error('[MYSTERY_BOX_DETAIL] Box does not exist in database at all');
    return null;
  }

  console.log('[MYSTERY_BOX_DETAIL] Box exists, checking filters:', {
    boxId: boxWithoutFilters.id,
    organizationId: boxWithoutFilters.organizationId,
    expectedOrgId: organizationId,
    isVisible: boxWithoutFilters.isVisible,
    isPublished: boxWithoutFilters.isPublished,
    status: boxWithoutFilters.status,
    startDate: boxWithoutFilters.startDate,
    endDate: boxWithoutFilters.endDate,
    now
  });

  // Log which filters would fail
  const filterFailures = [];
  
  if (boxWithoutFilters.organizationId !== organizationId) {
    filterFailures.push('organizationId mismatch');
  }
  if (!boxWithoutFilters.isVisible) {
    filterFailures.push('isVisible is false');
  }
  if (!boxWithoutFilters.isPublished) {
    filterFailures.push('isPublished is false');
  }
  if (boxWithoutFilters.status !== 'PUBLISHED') {
    filterFailures.push(`status is ${boxWithoutFilters.status} instead of PUBLISHED`);
  }
  if (boxWithoutFilters.startDate && boxWithoutFilters.startDate > now) {
    filterFailures.push('startDate is in the future');
  }
  if (boxWithoutFilters.endDate && boxWithoutFilters.endDate < now) {
    filterFailures.push('endDate is in the past');
  }

  if (filterFailures.length > 0) {
    console.warn('[MYSTERY_BOX_DETAIL] Box would fail strict filters:', filterFailures);
    console.warn('[MYSTERY_BOX_DETAIL] Loading box anyway for debugging purposes');
  } else {
    console.log('[MYSTERY_BOX_DETAIL] Box passes all strict filters');
  }

  return boxWithoutFilters;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const box = await getMysteryBox(id);

  if (!box) {
    return {
      title: "Mystery Box Not Found | NexMart",
    };
  }

  const price = box.price ?? 0;
  const originalValue = box.originalValue ?? 0;

  return {
    title: box.seoTitle || `${box.name} | Mystery Box | NexMart`,
    description: box.seoDescription || box.description || `Get ${box.name} mystery box worth ${originalValue.toFixed(2)} MAD for only ${price.toFixed(2)} MAD!`,
    openGraph: {
      title: box.seoTitle || box.name,
      description: box.seoDescription || box.description || undefined,
      images: (box.heroImage || box.ogImage) ? [{ url: box.heroImage || box.ogImage || '' }] : undefined,
      type: "website",
    },
  };
}

export default async function MysteryBoxDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const box = await getMysteryBox(id);

  if (!box) {
    notFound();
  }

  const validProducts = box.products?.filter((bp): bp is typeof bp & { product: NonNullable<typeof bp.product> } => bp.product !== null) || [];
  const isSoldOut = (box.stockLimit ?? 0) > 0 && (box.stockRemaining ?? 0) <= 0;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: box.name,
    description: box.description || undefined,
    image: box.heroImage || undefined,
    offers: {
      "@type": "Offer",
      price: box.price ?? 0,
      priceCurrency: "MAD",
      availability: isSoldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="page-enter">
        {/* Header */}
        <div className="bg-gradient-to-br from-pink-600 via-rose-600 to-red-600 relative overflow-hidden">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-20" />
          <div className="container-main py-8 relative">
            <Link
              href="/mystery-box"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Mystery Boxes
            </Link>
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Limited Edition
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
                {box.name}
              </h1>
              {box.description && (
                <p className="text-xl text-white/90 max-w-2xl">
                  {box.description}
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
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100">
                {box.heroImage ? (
                  <img
                    src={box.heroImage}
                    alt={box.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gift className="w-32 h-32 text-pink-300" />
                  </div>
                )}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="px-8 py-4 bg-white text-gray-900 font-bold text-xl rounded-full">
                      SOLD OUT
                    </div>
                  </div>
                )}
                {box.featured && !isSoldOut && (
                  <div className="absolute top-4 left-4 px-4 py-2 bg-pink-500 text-white text-sm font-bold rounded-full">
                    Featured
                  </div>
                )}
              </div>

              {/* Value Display */}
              <div className="mt-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">You Pay</div>
                    <div className="text-3xl font-bold text-pink-600">
                      {(box.price ?? 0).toFixed(2)} MAD
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Worth</div>
                    <div className="text-3xl font-bold text-green-600">
                      {(box.originalValue ?? 0).toFixed(2)} MAD
                    </div>
                  </div>
                </div>
                <div className="text-center py-3 bg-white rounded-xl">
                  <span className="text-lg font-semibold text-green-600">
                    You Save {((box.originalValue ?? 0) - (box.price ?? 0)).toFixed(2)} MAD
                  </span>
                  <div className="text-sm text-muted-foreground mt-1">
                    {box.originalValue && box.originalValue > 0 ? (((box.originalValue - (box.price ?? 0)) / box.originalValue * 100).toFixed(0)) : 0}% OFF
                  </div>
                </div>
              </div>

              {/* Stock Info */}
              {box.stockLimit && box.stockRemaining !== undefined && (
                <div className="mt-4 bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Stock Remaining</span>
                    <span className="font-semibold">{box.stockRemaining} / {box.stockLimit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${(box.stockRemaining / box.stockLimit) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span>Limited stock - order now!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div>
              {/* Hero Content */}
              {box.heroTitle && (
                <div className="mb-8">
                  <h2 className="font-display text-3xl font-bold mb-2">{box.heroTitle}</h2>
                  {box.heroSubtitle && (
                    <p className="text-muted-foreground text-lg">{box.heroSubtitle}</p>
                  )}
                </div>
              )}

              {/* What's Inside */}
              <div className="mb-8">
                <h3 className="font-display text-2xl font-bold mb-4">What's Inside</h3>
                <div className="bg-surface border border-border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ShoppingBag className="w-6 h-6 text-pink-500" />
                    <span className="font-semibold">Contains {validProducts.length}+ surprise items</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {validProducts.slice(0, 8).map((bp) => (
                      <div
                        key={bp.id}
                        className="aspect-square rounded-lg bg-muted overflow-hidden"
                      >
                        {bp.product.images && bp.product.images[0] ? (
                          <img
                            src={bp.product.images[0]}
                            alt={bp.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    {validProducts.length > 8 && (
                      <div className="aspect-square rounded-lg bg-pink-100 flex items-center justify-center text-sm font-semibold text-pink-600">
                        +{validProducts.length - 8}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-8">
                <h3 className="font-display text-2xl font-bold mb-4">Why Buy This Box?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Amazing Value</div>
                      <div className="text-sm text-muted-foreground">Get products worth more than you pay</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Curated Selection</div>
                      <div className="text-sm text-muted-foreground">Hand-picked premium products</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Fast Shipping</div>
                      <div className="text-sm text-muted-foreground">Delivery within 2-3 business days</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Surprise Factor</div>
                      <div className="text-sm text-muted-foreground">The excitement of unboxing</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <BuyNowButton mysteryBox={box} isSoldOut={isSoldOut} />
            </div>
          </div>
        </div>

        {/* Additional Content */}
        {box.sectionTitle && (
          <section className="py-16 bg-surface/50">
            <div className="container-main">
              <div className="text-center mb-12">
                <h2 className="font-display text-4xl font-bold mb-4">{box.sectionTitle}</h2>
                {box.sectionDescription && (
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    {box.sectionDescription}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
