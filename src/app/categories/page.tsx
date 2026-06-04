import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CategoryGrid } from "@/components/catalog/CategoryGrid";
import { getCatalogCategories } from "@/lib/catalog-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catégories",
  description: "Parcourez toutes les catégories NexMart MA",
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const categories = await getCatalogCategories();

  return (
    <div className="page-enter">
      <PageHeader
        title="Catégories"
        description="Explorez notre catalogue par univers — mode, maison, tech et plus."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Catégories" },
        ]}
      />
      <div className="container-main section">
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
}
