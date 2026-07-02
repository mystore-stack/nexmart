import { PageHero } from "@/components/shared/PageHero";
import { EmptyProducts } from "@/components/shared/EmptyStates";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "Collections",
  description: "Explore our curated collections. Hand-picked products grouped by theme, style, and occasion.",
  keywords: ["collections", "curated collections", "product collections", "themed products"],
});

async function getCollections() {
  const organizationId = await getOptionalDefaultOrganizationId();
  if (!organizationId) return { collections: [] };

  const collections = await prisma.product.findMany({
    where: {
      organizationId,
      published: true,
    },
    take: 8,
    orderBy: {
      createdAt: "desc",
    },
  });

  return { collections };
}

export default async function CollectionsPage() {
  const { collections } = await getCollections();

  const featuredCollections = [
    { name: "Summer Essentials", image: "/collections/summer.jpg", productCount: 45 },
    { name: "Moroccan Artisan", image: "/collections/moroccan.jpg", productCount: 32 },
    { name: "Luxury Living", image: "/collections/luxury.jpg", productCount: 28 },
    { name: "Eco-Friendly", image: "/collections/eco.jpg", productCount: 38 },
    { name: "Tech Gadgets", image: "/collections/tech.jpg", productCount: 52 },
    { name: "Home Decor", image: "/collections/home.jpg", productCount: 41 },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Collections" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Collections"
        subtitle="Curated for You"
        description="Discover our hand-picked collections, grouped by theme, style, and occasion."
        backgroundColor="#8B5CF6"
        gradient="from-violet-500 to-violet-600"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCollections.map((collection) => (
            <Link
              key={collection.name}
              href={`/collections/${collection.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group"
            >
              <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/20 dark:to-purple-950/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">🎨</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-xl">
                      {collection.name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {collection.productCount} products
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <CTABanner
        title="Discover More"
        subtitle="New Collections Added"
        description="We regularly add new curated collections. Check back often for fresh inspiration."
        buttonText="Browse All Products"
        buttonLink="/products"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}
