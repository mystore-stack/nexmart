import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { CategoryPageClient } from "@/components/category";
import { getCategoryBySlug, getCatalogMaxPrice } from "@/lib/catalog-queries";

type Props = {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: "Categorie introuvable" };
  return {
    title: `${category.name} - NexStore`,
    description:
      category.description ||
      `Decouvrez tous les produits ${category.name} sur NexStore MA`,
  };
}

async function getCategoryProducts(categoryId: string) {
  const organizationId = await getDefaultOrganizationId();

  const products = await prisma.product.findMany({
    where: {
      organizationId,
      categoryId,
      published: true,
    },
    include: {
      category: true,
      variants: true,
    },
    orderBy: { soldCount: "desc" },
    take: 100,
  });

  return products as any;
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: Props) {
  const [category, maxPrice] = await Promise.all([
    getCategoryBySlug(params.slug),
    getCatalogMaxPrice(),
  ]);

  if (!category) notFound();

  const products = await getCategoryProducts(category.id);

  return (
    <CategoryPageClient
      categoryName={category.name}
      categoryDescription={
        category.description ||
        `Decouvrez tous les produits ${category.name}`
      }
      categoryImage={category.image || undefined}
      initialProducts={products}
      maxPrice={maxPrice}
    />
  );
}
