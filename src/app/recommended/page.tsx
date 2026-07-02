import { PageHero } from "@/components/shared/PageHero";
import { ProductFilters, FilterGroup } from "@/components/shared/ProductFilters";
import { ProductSort, DEFAULT_SORT_OPTIONS } from "@/components/shared/ProductSort";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyProducts } from "@/components/shared/EmptyStates";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "Recommended for You",
  description: "Personalized product recommendations based on your preferences and browsing history.",
  keywords: ["recommended", "personalized", "suggestions", "for you"],
});

async function getRecommendedProducts() {
  const organizationId = await getOptionalDefaultOrganizationId();
  if (!organizationId) return { products: [], totalCount: 0 };

  const products = await prisma.product.findMany({
    where: {
      organizationId,
      published: true,
      stock: { gt: 0 },
    },
    include: {
      category: true,
    },
    orderBy: {
      rating: "desc",
    },
    take: 24,
  });

  const totalCount = await prisma.product.count({
    where: {
      organizationId,
      published: true,
      stock: { gt: 0 },
    },
  });

  return { products, totalCount };
}

export default async function RecommendedPage({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const sort = searchParams.sort || "rating_desc";
  
  const { products, totalCount } = await getRecommendedProducts();
  const totalPages = Math.ceil(totalCount / 24);

  const filterGroups: FilterGroup[] = [
    {
      id: "category",
      label: "Category",
      options: [
        { id: "clothing", label: "Clothing", count: 115 },
        { id: "accessories", label: "Accessories", count: 88 },
        { id: "home", label: "Home & Living", count: 62 },
        { id: "beauty", label: "Beauty", count: 45 },
      ],
      type: "checkbox",
    },
    {
      id: "rating",
      label: "Rating",
      options: [
        { id: "4", label: "4+ Stars" },
        { id: "3", label: "3+ Stars" },
      ],
      type: "checkbox",
    },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Recommended" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Recommended for You"
        subtitle="Personalized Picks"
        description="Products curated just for you based on your preferences and browsing history."
        backgroundColor="#8B5CF6"
        gradient="from-violet-500 to-violet-600"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <ProductFilters
              filters={filterGroups}
              selectedFilters={{}}
              onFilterChange={() => {}}
              onClearFilters={() => {}}
            />
          </aside>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {totalCount} products found
              </p>
              <ProductSort
                options={DEFAULT_SORT_OPTIONS}
                value={sort}
                onChange={() => {}}
              />
            </div>

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                  {products.map((product) => (
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
                          {product.rating >= 4.5 && (
                            <div className="absolute top-3 left-3 bg-violet-500 text-white text-xs font-bold px-2 py-1 rounded">
                              ⭐ TOP RATED
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1 mb-2">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm">{product.rating.toFixed(1)}</span>
                          </div>
                          <span className="font-bold text-lg">
                            {product.price.toFixed(2)} MAD
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={() => {}}
                  />
                )}
              </>
            ) : (
              <EmptyProducts />
            )}
          </div>
        </div>
      </div>

      <CTABanner
        title="Discover More"
        subtitle="Personalized Experience"
        description="Sign in to get personalized recommendations based on your preferences."
        buttonText="Sign In"
        buttonLink="/auth/signin"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}
