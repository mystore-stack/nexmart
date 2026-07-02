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
  title: "Today's Deals",
  description: "Shop today's best deals and exclusive discounts. New deals added daily on premium products.",
  keywords: ["today's deals", "daily deals", "discounts", "offers"],
});

async function getTodaysDealsProducts() {
  const organizationId = await getOptionalDefaultOrganizationId();
  if (!organizationId) return { products: [], totalCount: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const products = await prisma.product.findMany({
    where: {
      organizationId,
      published: true,
      stock: { gt: 0 },
      updatedAt: { gte: today },
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
      updatedAt: { gte: today },
    },
  });

  return { products, totalCount };
}

export default async function TodaysDealsPage({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const sort = searchParams.sort || "newest";
  
  const { products, totalCount } = await getTodaysDealsProducts();
  const totalPages = Math.ceil(totalCount / 24);

  const filterGroups: FilterGroup[] = [
    {
      id: "category",
      label: "Category",
      options: [
        { id: "clothing", label: "Clothing", count: 95 },
        { id: "accessories", label: "Accessories", count: 72 },
        { id: "home", label: "Home & Living", count: 54 },
        { id: "beauty", label: "Beauty", count: 38 },
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
    { label: "Today's Deals" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Today's Deals"
        subtitle="New Deals Every Day"
        description="Fresh deals added daily. Check back often for new discounts on your favorite products."
        backgroundColor="#059669"
        gradient="from-emerald-600 to-emerald-700"
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
                          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">
                            NEW TODAY
                          </div>
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
        title="Check Back Tomorrow"
        subtitle="New Deals Daily"
        description="We add new deals every day. Don't miss out on tomorrow's offers."
        buttonText="Browse All Products"
        buttonLink="/products"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}
