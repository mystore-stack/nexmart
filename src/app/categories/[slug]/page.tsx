import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import { getCatalogCategories, getCatalogMaxPrice, getCategoryBySlug } from "@/lib/catalog-queries";
import { cleanSearchParams } from "@/lib/utils/searchParams";

type Props = { params: Promise<{ slug: string }>; searchParams: Record<string, string | string[] | undefined> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Catégorie introuvable" };
  return {
    title: category.name,
    description: category.description || `Produits ${category.name} sur NexMart MA`,
  };
}

export default async function CategoryDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const [category, categories, maxPrice] = await Promise.all([
    getCategoryBySlug(slug),
    getCatalogCategories(),
    getCatalogMaxPrice(),
  ]);

  if (!category) notFound();

  // Clean searchParams to remove symbol properties
  const cleanedParams = cleanSearchParams(searchParams);
  const mergedParams = { ...cleanedParams, category: slug };

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
      forcedParams={{ category: slug }}
    />
  );
}
