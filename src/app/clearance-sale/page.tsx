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
  title: "Clearance Sale",
  description: "Final clearance sale - up to 70% off on selected items. Last chance to grab these premium products at unbeatable prices.",
  keywords: ["clearance", "sale", "final sale", "discount", "up to 70% off"],
});

async function getClearanceProducts() {
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
      comparePrice: "desc",
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

export default async function ClearanceSalePage({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const sort = searchParams.sort || "price_desc";
  
  const { products, totalCount } = await getClearanceProducts();
  const totalPages = Math.ceil(totalCount / 24);

  const filterGroups: FilterGroup[] = [
    {
      id: "category",
      label: "Category",
      options: [
        { id: "clothing", label: "Clothing", count: 85 },
        { id: "accessories", label: "Accessories", count: 62 },
        { id: "home", label: "Home & Living", count: 48 },
        { id: "beauty", label: "Beauty", count: 35 },
      ],
      type: "checkbox",
    },
    {
      id: "discount",
      label: "Discount",
      options: [
        { id: "30", label: "30% or more" },
        { id: "50", label: "50% or more" },
        { id: "60", label: "60% or more" },
        { id: "70", label: "70% or more" },
      ],
      type: "checkbox",
    },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Deals", href: "/deals" },
    { label: "Clearance Sale" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Clearance Sale"
        subtitle="Up to 70% Off"
        description="Final clearance on selected items. Once they're gone, they're gone forever."
        backgroundColor="#7C3AED"
        gradient="from-purple-600 to-purple-700"
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
                          <div className="absolute top-3 left-3 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                            CLEARANCE
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
                            <span className="font-bold text-lg text-red-600">
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
        title="Last Chance!"
        subtitle="Limited Stock"
        description="Clearance items are selling fast. Don't miss your chance to save big."
        buttonText="Shop Clearance"
        buttonLink="/clearance-sale"
        variant="accent"
      />

      <NewsletterSection />
    </div>
  );
}
