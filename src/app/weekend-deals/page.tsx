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
  title: "Weekend Deals",
  description: "Special weekend-only deals and exclusive discounts. Shop this weekend and save big on premium products.",
  keywords: ["weekend deals", "weekend sale", "special offers", "weekend discounts"],
});

async function getWeekendDealsProducts() {
  const organizationId = await getOptionalDefaultOrganizationId();
  if (!organizationId) return { products: [], totalCount: 0 };

  const now = new Date();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const products = await prisma.product.findMany({
    where: {
      organizationId,
      published: true,
      stock: { gt: 0 },
      ...(isWeekend && { comparePrice: { gt: prisma.product.fields.price } }),
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

export default async function WeekendDealsPage({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const sort = searchParams.sort || "popular_desc";
  
  const { products, totalCount } = await getWeekendDealsProducts();
  const totalPages = Math.ceil(totalCount / 24);

  const filterGroups: FilterGroup[] = [
    {
      id: "category",
      label: "Category",
      options: [
        { id: "clothing", label: "Clothing", count: 110 },
        { id: "accessories", label: "Accessories", count: 78 },
        { id: "home", label: "Home & Living", count: 56 },
        { id: "beauty", label: "Beauty", count: 42 },
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
    { label: "Deals", href: "/deals" },
    { label: "Weekend Deals" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Weekend Deals"
        subtitle="Weekend Exclusive"
        description="Special deals available only this weekend. Shop now and save on your favorite premium products."
        backgroundColor="#EA580C"
        gradient="from-orange-600 to-orange-700"
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
                          {product.comparePrice && (
                            <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                              WEEKEND DEAL
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
        title="Weekend Only!"
        subtitle="Limited Time"
        description="These special weekend deals end Sunday night. Don't miss out!"
        buttonText="Shop Weekend Deals"
        buttonLink="/weekend-deals"
        variant="gold"
      />

      <NewsletterSection />
    </div>
  );
}
