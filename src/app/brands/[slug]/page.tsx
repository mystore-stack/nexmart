// src/app/brands/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBrandBySlug,
  getBrandCategories,
  getBrandProducts,
  getFeaturedBrandProducts,
  getBrandNewArrivals,
  getBrandBestSellers,
} from "@/lib/brands/brand-queries";
import { BrandPageRenderer } from "@/components/brands/BrandPageRenderer";

interface BrandPageProps {
  params: { slug: string };
  searchParams: {
    category?: string;
    sort?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const brand = await getBrandBySlug(params.slug);

  if (!brand) {
    return {
      title: "Marque non trouvée | NexMart",
      description: "La marque demandée n'existe pas ou n'est plus disponible.",
    };
  }

  const title = brand.seoTitle || `${brand.name} | Boutique Officielle NexMart`;
  const description =
    brand.seoDescription ||
    brand.description ||
    `Découvrez la collection officielle ${brand.name} sur NexMart. Shopping premium au Maroc.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: brand.heroImage ? [{ url: brand.heroImage }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: brand.heroImage ? [brand.heroImage] : [],
    },
    alternates: {
      canonical: `/brands/${brand.slug}`,
    },
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const brand = await getBrandBySlug(params.slug);

  if (!brand) {
    notFound();
  }

  const category = searchParams.category;
  const sort = (searchParams.sort as any) || "recommended";
  const search = searchParams.search;
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const page = searchParams.page ? Number(searchParams.page) : 1;

  const [
    categories,
    featuredProducts,
    newArrivals,
    bestSellers,
    productsData,
  ] = await Promise.all([
    getBrandCategories(brand.id),
    getFeaturedBrandProducts(brand.id, 8),
    getBrandNewArrivals(brand.id, 8),
    getBrandBestSellers(brand.id, 8),
    getBrandProducts(brand.id, {
      category,
      sort,
      search,
      minPrice,
      maxPrice,
      page,
      limit: 12,
    }),
  ]);

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    description: brand.description || brand.shortDescription,
    logo: brand.logo,
    url: brand.website || `https://nexmart.ma/brands/${brand.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BrandPageRenderer
        brand={brand as any}
        sections={brand.sections as any[]}
        collections={brand.collections as any[]}
        categories={categories}
        featuredProducts={featuredProducts as any[]}
        newArrivals={newArrivals as any[]}
        bestSellers={bestSellers as any[]}
        productsData={productsData}
      />
    </>
  );
}
