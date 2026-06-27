import type { Metadata } from "next";
import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import { getCatalogCategories, getCatalogMaxPrice } from "@/lib/catalog-queries";
import { StructuredData } from "@/components/seo/StructuredData";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Nouveautés | Derniers Produits NexMart",
    description: "Découvrez les derniers produits ajoutés sur NexMart. Soyez les premiers à découvrir nos nouvelles arrivées et collections exclusives.",
    keywords: ["nouveautés", "nouveaux produits", "dernières arrivées", "collections", "NexMart"],
    openGraph: {
      title: "Nouveautés | Derniers Produits",
      description: "Découvrez nos dernières arrivées et collections exclusives.",
      type: "website",
    },
  };
}

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [categories, maxPrice] = await Promise.all([getCatalogCategories(), getCatalogMaxPrice()]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Nouveautés NexMart",
    description: "Derniers produits ajoutés sur NexMart",
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <ProductListingShell
        title="Nouveautés"
        description="Soyez les premiers à découvrir nos dernières arrivées et collections exclusives."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Nouveautés" },
        ]}
        categories={categories as never}
        maxPrice={maxPrice}
        searchParams={searchParams}
        forcedParams={{ sort: "newest" }}
      />
    </>
  );
}
