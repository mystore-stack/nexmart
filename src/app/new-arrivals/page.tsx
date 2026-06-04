import type { Metadata } from "next";
import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import { getCatalogCategories, getCatalogMaxPrice } from "@/lib/catalog-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nouveautés",
  description: "Les derniers produits ajoutés sur NexMart MA",
};

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [categories, maxPrice] = await Promise.all([getCatalogCategories(), getCatalogMaxPrice()]);

  return (
    <ProductListingShell
      title="Nouveautés"
      description="Soyez les premiers à découvrir nos dernières arrivées."
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Nouveautés" },
      ]}
      categories={categories as never}
      maxPrice={maxPrice}
      searchParams={searchParams}
      forcedParams={{ sort: "newest" }}
    />
  );
}
