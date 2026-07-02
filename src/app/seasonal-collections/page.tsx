import { PageHero } from "@/components/shared/PageHero";
import { EmptyProducts } from "@/components/shared/EmptyStates";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "Seasonal Collections",
  description: "Shop our seasonal collections. From summer essentials to winter favorites, find products for every season.",
  keywords: ["seasonal", "seasonal collections", "summer", "winter", "spring", "fall"],
});

export default async function SeasonalCollectionsPage() {
  const seasonalCollections = [
    { name: "Summer Collection", season: "Summer", description: "Beat the heat with our summer essentials", icon: "☀️", color: "from-yellow-400 to-orange-500" },
    { name: "Winter Collection", season: "Winter", description: "Stay warm with cozy winter favorites", icon: "❄️", color: "from-blue-400 to-cyan-500" },
    { name: "Spring Collection", season: "Spring", description: "Fresh blooms and new beginnings", icon: "🌸", color: "from-pink-400 to-rose-500" },
    { name: "Fall Collection", season: "Fall", description: "Autumn vibes and cozy comforts", icon: "🍂", color: "from-orange-400 to-amber-500" },
    { name: "Ramadan Collection", season: "Ramadan", description: "Special items for the holy month", icon: "🌙", color: "from-emerald-400 to-teal-500" },
    { name: "Eid Collection", season: "Eid", description: "Celebrate with festive essentials", icon: "✨", color: "from-purple-400 to-violet-500" },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/collections" },
    { label: "Seasonal" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Seasonal Collections"
        subtitle="Shop by Season"
        description="Discover products curated for every season and occasion."
        backgroundColor="#F97316"
        gradient="from-orange-500 to-orange-600"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seasonalCollections.map((collection) => (
            <Link
              key={collection.name}
              href={`/collections/${collection.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group"
            >
              <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`aspect-video relative bg-gradient-to-br ${collection.color}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-7xl">{collection.icon}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white font-bold text-2xl mb-1">
                      {collection.name}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {collection.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <CTABanner
        title="Shop Current Season"
        subtitle="New Arrivals"
        description="Check out our latest seasonal arrivals and stay ahead of the trends."
        buttonText="Shop Now"
        buttonLink="/products"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}
