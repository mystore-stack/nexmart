// src/app/category/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getCatalogCategories } from "@/lib/catalog-queries";
import { CategoryStorefront } from "@/components/category/CategoryStorefront";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import type { Product } from "@/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Record<string, string | string[] | undefined>;
};

export const revalidate = 0; // Disable caching for category pages to always show latest config
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Catégorie introuvable | NexMart MA" };
  }

  const title = `${category.name} - Luxury Collection | NexMart MA`;
  const description = category.description || `Découvrez notre sélection exclusive de produits ${category.name} sur NexMart Maroc.`;
  const canonicalUrl = `https://nexmart.ma/category/${category.slug}`;
  const ogImage = category.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "NexMart MA",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
      locale: "fr_MA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const organizationId = await getDefaultOrganizationId();

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const allCategories = await getCatalogCategories();

  // Fetch products associated with this category or its subcategories
  const childCategoryIds = category.children?.map((c) => c.id) || [];
  const allTargetCategoryIds = [category.id, ...childCategoryIds];

  const dbProducts = await prisma.product.findMany({
    where: {
      organizationId,
      published: true,
      categoryId: { in: allTargetCategoryIds },
    },
    take: 36,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      comparePrice: true,
      images: true,
      rating: true,
      reviewCount: true,
      tags: true,
      featured: true,
    },
  });

  // JSON-LD Structured Data for SEO (BreadcrumbList & ItemList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: `https://nexmart.ma/category/${category.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: dbProducts.map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://nexmart.ma/products/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="min-h-screen pb-12 bg-background">
        <CategoryStorefront
          category={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image,
            pageConfig: category.pageConfig,
          }}
          subCategories={category.children}
          products={dbProducts}
        />
      </main>
    </>
  );
}
