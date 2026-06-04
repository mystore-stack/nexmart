// src/app/products/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductsClient } from "@/components/product/ProductsClient";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our complete collection of premium products",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { _count: { select: { products: { where: { published: true } } } } },
    orderBy: { name: "asc" },
  });

  const maxPrice = await prisma.product.aggregate({
    _max: { price: true },
    where: { published: true },
  });

  return (
    <div className="page-enter">
      <div className="border-b border-border bg-surface">
        <div className="container-main py-6">
          <h1 className="text-2xl font-bold mb-1">All Products</h1>
          <p className="text-muted-foreground text-sm">
            Discover our curated collection of premium products
          </p>
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
