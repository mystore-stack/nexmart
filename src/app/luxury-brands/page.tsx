import { PageHero } from "@/components/shared/PageHero";
import { EmptyProducts } from "@/components/shared/EmptyStates";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "Luxury Brands",
  description: "Discover our collection of luxury brands. Shop premium products from the world's finest designers and artisans.",
  keywords: ["luxury", "premium brands", "designer", "high-end", "luxury products"],
});

async function getLuxuryProducts() {
  const organizationId = await getOptionalDefaultOrganizationId();
  if (!organizationId) return { products: [], totalCount: 0 };

  const products = await prisma.product.findMany({
    where: {
      organizationId,
      published: true,
      stock: { gt: 0 },
      price: { gte: 1000 },
    },
    include: {
      category: true,
    },
    orderBy: {
      price: "desc",
    },
    take: 24,
  });

  const totalCount = await prisma.product.count({
    where: {
      organizationId,
      published: true,
      stock: { gt: 0 },
      price: { gte: 1000 },
    },
  });

  return { products, totalCount };
}

export default async function LuxuryBrandsPage() {
  const { products, totalCount } = await getLuxuryProducts();

  const luxuryBrands = [
    { name: "Louis Vuitton", logo: "LV", description: "French luxury fashion house" },
    { name: "Gucci", logo: "G", description: "Italian luxury brand" },
    { name: "Chanel", logo: "CC", description: "French fashion house" },
    { name: "Hermès", logo: "H", description: "French luxury goods manufacturer" },
    { name: "Prada", logo: "P", description: "Italian luxury fashion house" },
    { name: "Dior", logo: "D", description: "French luxury goods company" },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Premium", href: "/premium" },
    { label: "Luxury Brands" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Luxury Brands"
        subtitle="Premium Collection"
        description="Discover our curated collection of luxury brands from the world's finest designers."
        backgroundColor="#1a1a1a"
        gradient="from-gray-900 to-black"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Featured Brands */}
        <h2 className="text-2xl font-bold mb-6">Featured Luxury Brands</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {luxuryBrands.map((brand) => (
            <div
              key={brand.name}
              className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {brand.logo}
              </div>
              <h3 className="font-semibold text-sm">{brand.name}</h3>
            </div>
          ))}
        </div>

        {/* Luxury Products */}
        <h2 className="text-2xl font-bold mb-6">Luxury Products</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 rounded">
                      LUXURY
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {product.price.toFixed(2)} MAD
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyProducts />
        )}
      </div>

      <CTABanner
        title="Experience Luxury"
        subtitle="Premium Quality"
        description="Discover our exclusive collection of luxury products from renowned brands."
        buttonText="Shop Luxury"
        buttonLink="/luxury-brands"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}
