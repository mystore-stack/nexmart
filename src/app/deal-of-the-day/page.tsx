import { PageHero } from "@/components/shared/PageHero";
import { ProductFilters, FilterGroup } from "@/components/shared/ProductFilters";
import { ProductSort, DEFAULT_SORT_OPTIONS } from "@/components/shared/ProductSort";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyProducts } from "@/components/shared/EmptyStates";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata, generateProductStructuredData } from "@/lib/seo/metadata";
import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "Deal of the Day",
  description: "Today's exclusive deal of the day - one incredible product at an unbeatable price. Available for 24 hours only!",
  keywords: ["deal of the day", "daily deal", "exclusive offer", "24 hour deal"],
});

async function getDealOfTheDay() {
  const organizationId = await getOptionalDefaultOrganizationId();
  if (!organizationId) return null;

  const product = await prisma.product.findFirst({
    where: {
      organizationId,
      published: true,
      stock: { gt: 0 },
      comparePrice: { not: null },
    },
    include: {
      category: true,
    },
    orderBy: {
      soldCount: "desc",
    },
  });

  return product;
}

async function getRelatedProducts(productId: string) {
  const organizationId = await getOptionalDefaultOrganizationId();
  if (!organizationId) return [];

  return prisma.product.findMany({
    where: {
      organizationId,
      published: true,
      stock: { gt: 0 },
      id: { not: productId },
    },
    include: {
      category: true,
    },
    orderBy: {
      soldCount: "desc",
    },
    take: 8,
  });
}

export default async function DealOfTheDayPage() {
  const dealProduct = await getDealOfTheDay();
  const relatedProducts = dealProduct ? await getRelatedProducts(dealProduct.id) : [];

  const filterGroups: FilterGroup[] = [
    {
      id: "category",
      label: "Category",
      options: [
        { id: "clothing", label: "Clothing", count: 120 },
        { id: "accessories", label: "Accessories", count: 85 },
        { id: "home", label: "Home & Living", count: 64 },
        { id: "beauty", label: "Beauty", count: 45 },
      ],
      type: "checkbox",
    },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Deals", href: "/deals" },
    { label: "Deal of the Day" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Deal of the Day"
        subtitle="24 Hours Only"
        description="One incredible product at an unbeatable price. Available for today only!"
        backgroundColor="#EAB308"
        gradient="from-yellow-500 to-yellow-600"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {dealProduct ? (
          <>
            {/* Featured Deal */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-2xl p-8 mb-12 border-2 border-yellow-200 dark:border-yellow-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="relative">
                  <div className="aspect-square max-w-md mx-auto">
                    {dealProduct.images[0] && (
                      <img
                        src={dealProduct.images[0]}
                        alt={dealProduct.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    )}
                  </div>
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-lg font-bold px-4 py-2 rounded-lg animate-pulse">
                    DEAL OF THE DAY
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 font-display">
                    {dealProduct.name}
                  </h1>
                  <p className="text-muted-foreground mb-6">
                    {dealProduct.description}
                  </p>

                  <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
                    <span className="text-4xl font-bold text-red-600">
                      {dealProduct.price.toFixed(2)} MAD
                    </span>
                    {dealProduct.comparePrice && (
                      <span className="text-2xl text-muted-foreground line-through">
                        {dealProduct.comparePrice.toFixed(2)} MAD
                      </span>
                    )}
                  </div>

                  {dealProduct.comparePrice && (
                    <div className="text-lg font-semibold text-green-600 mb-6">
                      Save {Math.round(
                        ((dealProduct.comparePrice - dealProduct.price) / dealProduct.comparePrice) * 100
                      )}%
                    </div>
                  )}

                  <Link
                    href={`/products/${dealProduct.slug}`}
                    className="inline-flex items-center justify-center px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Shop Now
                  </Link>

                  <div className="mt-6 text-sm text-muted-foreground">
                    <p>⏰ Available for 24 hours only</p>
                    <p>📦 {dealProduct.stock} in stock</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
                          <span className="font-bold text-lg">
                            {product.price.toFixed(2)} MAD
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyProducts />
        )}
      </div>

      <CTABanner
        title="Check Back Tomorrow"
        subtitle="New Deal Every Day"
        description="A new deal of the day is released every day at midnight. Don't miss tomorrow's offer!"
        buttonText="Browse All Deals"
        buttonLink="/super-deals"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}
