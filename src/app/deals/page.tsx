import type { Metadata } from "next";
import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import { getCatalogCategories, getCatalogMaxPrice } from "@/lib/catalog-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Promotions",
  description: "Offres et réductions du jour — NexMart MA",
};

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [categories, maxPrice] = await Promise.all([getCatalogCategories(), getCatalogMaxPrice()]);

  return (
    <ProductListingShell
      title="Promotions du jour"
      description="Économisez sur une sélection de produits en promotion."
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Promotions" },
      ]}
      categories={categories as never}
      maxPrice={maxPrice}
      searchParams={searchParams}
      forcedParams={{ sort: "discount", sale: "true" }}
    />
  );
}
