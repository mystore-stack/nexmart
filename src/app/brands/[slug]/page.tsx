import type { Metadata } from "next";
import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import { getBrandsFromTags, getCatalogCategories, getCatalogMaxPrice } from "@/lib/catalog-queries";
import { notFound } from "next/navigation";
import { cleanSearchParams } from "@/lib/utils/searchParams";

type Props = { params: Promise<{ slug: string }>; searchParams: Record<string, string | string[] | undefined> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brands = await getBrandsFromTags();
  const brand = brands.find((b) => b.slug === slug);
  return { title: brand ? `Marque ${brand.name}` : "Marque" };
}

export default async function BrandProductsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const [brands, categories, maxPrice] = await Promise.all([
    getBrandsFromTags(),
    getCatalogCategories(),
    getCatalogMaxPrice(),
  ]);

  const brand = brands.find((b) => b.slug === slug);
  if (!brand) notFound();

  // Clean searchParams to remove symbol properties
  const cleanedParams = cleanSearchParams(searchParams);

  return (
    <ProductListingShell
      title={brand.name}
      description={`Tous les produits de la marque ${brand.name}`}
      breadcrumbs={[
        { label: "Accueil", href: "/" },
        { label: "Marques", href: "/brands" },
        { label: brand.name },
      ]}
      categories={categories as never}
      maxPrice={maxPrice}
      searchParams={cleanedParams}
      forcedParams={{ brand: brand.name }}
    />
  );
}
