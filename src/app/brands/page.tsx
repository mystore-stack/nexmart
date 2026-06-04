import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBrandsFromTags } from "@/lib/catalog-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marques",
  description: "Découvrez les marques disponibles sur NexMart MA",
};

export const revalidate = 600;

export default async function BrandsPage() {
  const brands = await getBrandsFromTags();

  return (
    <div className="page-enter">
      <PageHeader
        title="Marques"
        description="Parcourez le catalogue par marque et étiquette produit."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Marques" },
        ]}
      />
      <div className="container-main section">
        {brands.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucune marque répertoriée pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="bg-card border border-border rounded-2xl p-5 text-center hover:border-brand-300 hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <span className="font-semibold capitalize block">{brand.name}</span>
                <span className="text-xs text-muted-foreground mt-1">{brand.count} produits</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
