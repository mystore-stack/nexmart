import { PageHero } from "@/components/shared/PageHero";
import { EmptyProducts } from "@/components/shared/EmptyStates";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "Moroccan Collections",
  description: "Discover authentic Moroccan craftsmanship. Explore our curated collection of traditional and modern Moroccan artisan products.",
  keywords: ["moroccan", "artisan", "craftsmanship", "traditional", "handmade"],
});

async function getMoroccanProducts() {
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
      createdAt: "desc",
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

export default async function MoroccanCollectionsPage() {
  const { products, totalCount } = await getMoroccanProducts();

  const collections = [
    { name: "Berber Rugs", icon: "🧵", description: "Handwoven traditional rugs" },
    { name: "Ceramics", icon: "🏺", description: "Artisan pottery and tiles" },
    { name: "Leather Goods", icon: "👜", description: "Handcrafted leather products" },
    { name: "Metalwork", icon: "⚱️", description: "Traditional brass and copper" },
    { name: "Textiles", icon: "🧣", description: "Embroidered fabrics" },
    { name: "Jewelry", icon: "💍", description: "Traditional silver jewelry" },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Premium", href: "/premium" },
    { label: "Moroccan Collections" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Moroccan Collections"
        subtitle="Authentic Craftsmanship"
        description="Discover the rich heritage of Moroccan artistry with our curated collection of traditional and modern artisan products."
        backgroundColor="#B45309"
        gradient="from-amber-700 to-amber-800"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Collections */}
        <h2 className="text-2xl font-bold mb-6">Explore Our Collections</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {collections.map((collection) => (
            <div
              key={collection.name}
              className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border border-amber-200 dark:border-amber-800"
            >
              <div className="text-5xl mb-3">{collection.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{collection.name}</h3>
              <p className="text-xs text-muted-foreground">{collection.description}</p>
            </div>
          ))}
        </div>

        {/* Featured Products */}
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
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
                    <div className="absolute top-3 left-3 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded">
                      HANDMADE
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
        ) : (
          <EmptyProducts />
        )}
      </div>

      <CTABanner
        title="Experience Moroccan Artistry"
        subtitle="Handcrafted Excellence"
        description="Each piece tells a story of tradition and craftsmanship passed down through generations."
        buttonText="Shop Collections"
        buttonLink="/moroccan-collections"
        variant="gold"
      />

      <NewsletterSection />
    </div>
  );
}
