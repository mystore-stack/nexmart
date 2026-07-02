import { PageHero } from "@/components/shared/PageHero";
import { EmptyProducts } from "@/components/shared/EmptyStates";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "Recently Viewed",
  description: "View your recently viewed products. Pick up where you left off and discover products you've browsed.",
  keywords: ["recently viewed", "browsing history", "viewed products"],
});

async function getRecentlyViewed() {
  const session = await getCurrentUser();
  const organizationId = await getOptionalDefaultOrganizationId();
  if (!session?.user?.id || !organizationId) return { products: [] };

  const recentlyViewed = await prisma.recentlyViewed.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      viewedAt: "desc",
    },
    take: 24,
  });

  return { products: recentlyViewed.map(rv => rv.product) };
}

export default async function RecentlyViewedPage() {
  const { products } = await getRecentlyViewed();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Account", href: "/account" },
    { label: "Recently Viewed" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Recently Viewed"
        subtitle="Your Browsing History"
        description="Products you've recently viewed. Pick up where you left off."
        backgroundColor="#6366F1"
        gradient="from-indigo-500 to-indigo-600"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
        ) : (
          <div className="text-center py-16">
            <EmptyProducts />
            <p className="text-muted-foreground mt-4">
              Start browsing products to see them here.
            </p>
          </div>
        )}
      </div>

      <CTABanner
        title="Continue Shopping"
        subtitle="Discover More"
        description="Browse our collection and find your next favorite product."
        buttonText="Shop Now"
        buttonLink="/products"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}
