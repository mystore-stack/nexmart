// src/app/products/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { getSession } from "@/lib/auth-api";
import { ProductsClient } from "@/components/product/ProductsClient";

export const metadata: Metadata = {
  title: "Tous les produits | NexMart Maroc",
  description: "Parcourez notre collection complète de produits premium au Maroc",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getSession();
  let organizationId;
  if (session) {
    organizationId = await getOrganizationIdForUser({ userId: session.userId });
  } else {
    organizationId = await getDefaultOrganizationId();
  }

  const categories = await prisma.category.findMany({
    where: { organizationId, parentId: null },
    include: { _count: { select: { products: { where: { organizationId, published: true } } } } },
    orderBy: { name: "asc" },
  });

  const maxPrice = await prisma.product.aggregate({
    _max: { price: true },
    where: { organizationId, published: true },
  });

  return (
    <div className="page-enter">
      <div className="border-b border-border relative overflow-hidden border-b border-gold-200/40 dark:border-gold-800/20 bg-surface/80">
        <div className="container-main py-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-3">
              <h1 className="font-display text-5xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r gradient-emerald">
                  Tous les Produits
                </span>
              </h1>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 py-1 bg-muted rounded-full">
                Premium Collection
              </span>
            </div>
            <p className="text-lg text-muted-foreground/80 font-medium max-w-2xl leading-relaxed">
              Discover our carefully curated selection of produits premium designed for excellence
            </p>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        <Suspense fallback={<ProductsPageSkeleton />}>
          <ProductsClient
            categories={categories as any}
            maxPrice={maxPrice._max.price || 1000}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </div>
  );
}

function ProductsPageSkeleton() {
  return (
    <div className="flex gap-8">
      <div className="w-64 flex-shrink-0 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-xl" />
        ))}
      </div>
      <div className="flex-1">
        <div className="skeleton h-10 rounded-xl mb-6 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border/50">
              <div className="aspect-square skeleton" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 rounded w-3/4" />
                <div className="skeleton h-3 rounded w-1/2" />
                <div className="skeleton h-5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
