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
  title: "Trending Products",
  description: "Discover what's trending now. Shop the hottest products that everyone is talking about.",
  keywords: ["trending", "hot products", "popular", "viral"],
});

async function getTrendingProducts() {
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
      soldCount: "desc",
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

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const sort = searchParams.sort || "popular_desc";
  
  const { products, totalCount } = await getTrendingProducts();
  const totalPages = Math.ceil(totalCount / 24);

  const filterGroups: FilterGroup[] = [
    {
      id: "category",
      label: "Category",
      options: [
        { id: "clothing", label: "Clothing", count: 130 },
        { id: "accessories", label: "Accessories", count: 95 },
        { id: "home", label: "Home & Living", count: 70 },
        { id: "beauty", label: "Beauty", count: 50 },
      ],
      type: "checkbox",
    },
    {
      id: "price",
      label: "Price Range",
      options: [
        { id: "0-100", label: "Under 100 MAD" },
        { id: "100-500", label: "100 - 500 MAD" },
        { id: "500-1000", label: "500 - 1000 MAD" },
        { id: "1000+", label: "1000+ MAD" },
      ],
      type: "checkbox",
    },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Trending" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Trending Now"
        subtitle="Hot Products"
        description="Discover what's trending. Shop the hottest products that everyone is talking about."
        backgroundColor="#EC4899"
        gradient="from-pink-500 to-pink-600"
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
                          {product.soldCount > 100 && (
                            <div className="absolute top-3 left-3 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded">
                              🔥 HOT
                            </div>
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
                          <div className="text-xs text-muted-foreground mt-1">
                            {product.soldCount} sold
                          </div>
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
        title="Stay on Trend"
        subtitle="New Arrivals Daily"
        description="Check back often for new trending products added daily."
        buttonText="Shop New Arrivals"
        buttonLink="/new-arrivals"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}
