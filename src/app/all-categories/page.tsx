import { PageHero } from "@/components/shared/PageHero";
import { EmptyProducts } from "@/components/shared/EmptyStates";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "All Categories",
  description: "Browse all product categories at NexMart. Find exactly what you're looking for across our wide range of categories.",
  keywords: ["categories", "browse categories", "product categories", "shop by category"],
});

async function getAllCategories() {
  const organizationId = await getOptionalDefaultOrganizationId();
  if (!organizationId) return { categories: [] };

  const categories = await prisma.category.findMany({
    where: {
      organizationId,
      parentId: null,
    },
    include: {
      children: true,
      _count: {
        select: { products: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return { categories };
}

export default async function AllCategoriesPage() {
  const { categories } = await getAllCategories();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="All Categories"
        subtitle="Browse by Category"
        description="Explore our wide range of product categories and find exactly what you're looking for."
        backgroundColor="#0EA5E9"
        gradient="from-sky-500 to-sky-600"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-xl">
                        {category.name}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {category._count.products} products
                      </p>
                    </div>
                  </div>
                  {category.children.length > 0 && (
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {category.children.slice(0, 3).map((child) => (
                          <span
                            key={child.id}
                            className="text-xs bg-muted px-2 py-1 rounded"
                          >
                            {child.name}
                          </span>
                        ))}
                        {category.children.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{category.children.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyProducts />
        )}
      </div>

      <CTABanner
        title="Can't Find What You Need?"
        subtitle="Search Our Products"
        description="Use our search feature to find specific products across all categories."
        buttonText="Search Products"
        buttonLink="/search"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}
