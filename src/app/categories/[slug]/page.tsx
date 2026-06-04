import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import { getCatalogCategories, getCatalogMaxPrice, getCategoryBySlug } from "@/lib/catalog-queries";

type Props = { params: { slug: string }; searchParams: Record<string, string | string[] | undefined> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: "Catégorie introuvable" };
  return {
    title: category.name,
    description: category.description || `Produits ${category.name} sur NexMart MA`,
  };
}

export default async function CategoryDetailPage({ params, searchParams }: Props) {
  const [category, categories, maxPrice] = await Promise.all([
    getCategoryBySlug(params.slug),
    getCatalogCategories(),
    getCatalogMaxPrice(),
  ]);

  if (!category) notFound();

  const mergedParams = { ...searchParams, category: params.slug };

  return (
    <ProductListingShell
      title={category.name}
      description={category.description || `Découvrez tous les produits ${category.name}`}
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Catégories", href: "/categories" },
        { label: category.name },
      ]}
      categories={categories as never}
      maxPrice={maxPrice}
      searchParams={mergedParams}
      forcedParams={{ category: params.slug }}
    />
  );
}
