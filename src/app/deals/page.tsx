import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { DealsPageClient } from "@/components/deals";
import { getCatalogCategories, getCatalogMaxPrice } from "@/lib/catalog-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Promotions - NexStore",
  description: "Offres et reductions du jour - NexStore MA",
};

async function getDealsProducts() {
  const organizationId = await getDefaultOrganizationId();
  
  const products = await prisma.product.findMany({
    where: {
      organizationId,
      published: true,
      comparePrice: { gt: prisma.product.fields.price },
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

export default async function DealsPage() {
  const [products, categories, maxPrice] = await Promise.all([
    getDealsProducts(),
    getCatalogCategories(),
    getCatalogMaxPrice(),
  ]);

  return (
    <DealsPageClient
      initialProducts={products}
      categories={categories as never}
      maxPrice={maxPrice}
    />
  );
}
