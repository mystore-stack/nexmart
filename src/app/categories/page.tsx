import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CategoryGrid } from "@/components/catalog/CategoryGrid";
import { getCatalogCategories } from "@/lib/catalog-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CatÃ©gories",
  description: "Parcourez toutes les catÃ©gories NexStore MA",
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const categories = await getCatalogCategories();

  return (
    <div className="page-enter">
      <PageHeader
        title="CatÃ©gories"
        description="Explorez notre catalogue par univers â€” mode, maison, tech et plus."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "CatÃ©gories" },
        ]}
      />
      <div className="container-main section">
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
}

