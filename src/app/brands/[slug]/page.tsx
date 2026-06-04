import type { Metadata } from "next";
import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import { getBrandsFromTags, getCatalogCategories, getCatalogMaxPrice } from "@/lib/catalog-queries";
import { notFound } from "next/navigation";

type Props = { params: { slug: string }; searchParams: Record<string, string | string[] | undefined> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brands = await getBrandsFromTags();
  const brand = brands.find((b) => b.slug === params.slug);
  return { title: brand ? `Marque ${brand.name}` : "Marque" };
}

export default async function BrandProductsPage({ params, searchParams }: Props) {
  const [brands, categories, maxPrice] = await Promise.all([
    getBrandsFromTags(),
    getCatalogCategories(),
    getCatalogMaxPrice(),
  ]);

  const brand = brands.find((b) => b.slug === params.slug);
  if (!brand) notFound();

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
      searchParams={searchParams}
      forcedParams={{ brand: brand.name }}
    />
  );
}
