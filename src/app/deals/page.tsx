import type { Metadata } from "next";
import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import { getCatalogCategories, getCatalogMaxPrice } from "@/lib/catalog-queries";
import { validateOrganizationSetup } from "@/lib/tenant";

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
  // Validate organization setup before rendering
  const orgValidation = await validateOrganizationSetup();
  if (!orgValidation.valid) {
    console.error("[DealsPage] Organization validation failed:", orgValidation.error);
    // Return a graceful error state instead of crashing
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="text-2xl font-bold text-red-900">Configuration requise</h1>
          <p className="mt-2 text-red-700">
            L&apos;application n&apos;est pas correctement configurée. Veuillez contacter l&apos;administrateur.
          </p>
          <p className="mt-1 text-sm text-red-600">
            Erreur: {orgValidation.error}
          </p>
        </div>
      </div>
    );
  }

  try {
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
  } catch (error) {
    console.error("[DealsPage] Error loading deals:", error);
    // Return a graceful error state instead of crashing
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h1 className="text-2xl font-bold text-yellow-900">Erreur de chargement</h1>
          <p className="mt-2 text-yellow-700">
            Une erreur s&apos;est produite lors du chargement des promotions. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }
}
