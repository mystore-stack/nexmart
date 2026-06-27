import type { Metadata } from "next";
import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import { getCatalogCategories, getCatalogMaxPrice } from "@/lib/catalog-queries";
import { StructuredData } from "@/components/seo/StructuredData";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Meilleures Ventes | Produits Populaires NexMart",
    description: "Découvrez les produits les plus vendus sur NexMart. Nos best-sellers choisis par nos clients pour leur qualité et leur popularité.",
    keywords: ["best sellers", "meilleures ventes", "produits populaires", "top ventes", "NexMart"],
    openGraph: {
      title: "Meilleures Ventes | Produits Populaires",
      description: "Découvrez nos produits les plus vendus et appréciés par nos clients.",
      type: "website",
    },
  };
}

export default async function BestSellersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [categories, maxPrice] = await Promise.all([getCatalogCategories(), getCatalogMaxPrice()]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Meilleures Ventes NexMart",
    description: "Produits les plus vendus sur NexMart",
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <ProductListingShell
        title="Meilleures Ventes"
        description="Découvrez nos produits les plus vendus et appréciés par nos clients."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Meilleures Ventes" },
        ]}
        categories={categories as never}
        maxPrice={maxPrice}
        searchParams={searchParams}
        forcedParams={{ sort: "bestsellers" }}
      />
    </>
  );
}
