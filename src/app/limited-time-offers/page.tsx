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
  title: "Limited Time Offers",
  description: "Exclusive limited time offers on premium products. Act fast before these deals expire!",
  keywords: ["limited time offers", "exclusive deals", "time-sensitive", "flash deals"],
});

async function getLimitedTimeProducts() {
  const organizationId = await getOptionalDefaultOrganizationId();
  if (!organizationId) return { products: [], totalCount: 0 };

  const products = await prisma.product.findMany({
    where: {
      organizationId,
      published: true,
      stock: { gt: 0 },
      comparePrice: { gt: prisma.product.fields.price },
    },
    include: {
      category: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 24,
  });

  const totalCount = await prisma.product.count({
    where: {
      organizationId,
      published: true,
      stock: { gt: 0 },
      comparePrice: { gt: prisma.product.fields.price },
    },
  });

  return { products, totalCount };
}

export default async function LimitedTimeOffersPage({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const sort = searchParams.sort || "newest";
  
  const { products, totalCount } = await getLimitedTimeProducts();
  const totalPages = Math.ceil(totalCount / 24);

  const filterGroups: FilterGroup[] = [
    {
      id: "category",
      label: "Category",
      options: [
        { id: "clothing", label: "Clothing", count: 105 },
        { id: "accessories", label: "Accessories", count: 75 },
        { id: "home", label: "Home & Living", count: 58 },
        { id: "beauty", label: "Beauty", count: 40 },
      ],
      type: "checkbox",
    },
    {
      id: "time",
      label: "Time Remaining",
      options: [
        { id: "24h", label: "Less than 24 hours" },
        { id: "48h", label: "Less than 48 hours" },
        { id: "7d", label: "Less than 7 days" },
      ],
      type: "checkbox",
    },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Deals", href: "/deals" },
    { label: "Limited Time Offers" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Limited Time Offers"
        subtitle="Act Fast!"
        description="Exclusive deals available for a limited time only. Don't miss out on these time-sensitive offers."
        backgroundColor="#0891B2"
        gradient="from-cyan-600 to-cyan-700"
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
                          <div className="absolute top-3 left-3 bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded">
                            LIMITED TIME
                          </div>
                          {product.comparePrice && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                              -{Math.round(
                                ((product.comparePrice - product.price) / product.comparePrice) * 100
                              )}%
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
        title="Time is Running Out"
        subtitle="Limited Availability"
        description="These offers won't last long. Shop now before they expire."
        buttonText="Shop Limited Offers"
        buttonLink="/limited-time-offers"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}
