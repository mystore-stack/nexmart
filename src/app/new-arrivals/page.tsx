import type { Metadata } from "next";
import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import { getCatalogCategories, getCatalogMaxPrice } from "@/lib/catalog-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NouveautÃ©s",
  description: "Les derniers produits ajoutÃ©s sur NexStore MA",
};

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [categories, maxPrice] = await Promise.all([getCatalogCategories(), getCatalogMaxPrice()]);

  return (
    <ProductListingShell
      title="NouveautÃ©s"
      description="Soyez les premiers Ã  dÃ©couvrir nos derniÃ¨res arrivÃ©es."
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "NouveautÃ©s" },
      ]}
      categories={categories as never}
      maxPrice={maxPrice}
      searchParams={searchParams}
      forcedParams={{ sort: "newest" }}
    />
  );
}

