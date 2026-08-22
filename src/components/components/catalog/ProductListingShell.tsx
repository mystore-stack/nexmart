import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductsClient } from "@/components/product/ProductsClient";
import type { Category } from "@/types";

type ProductListingShellProps = {
  title: string;
  description: string;
  breadcrumbs?: { label: string; href?: string }[];
  categories: Category[];
  maxPrice: number;
  searchParams: Record<string, string | string[] | undefined>;
  forcedParams?: Record<string, string>;
};

export function ProductListingShell({
  title,
  description,
  breadcrumbs,
  categories,
  maxPrice,
  searchParams,
  forcedParams = {},
}: ProductListingShellProps) {
  const merged: Record<string, string | string[] | undefined> = { ...searchParams };
  for (const [k, v] of Object.entries(forcedParams)) {
    merged[k] = v;
  }

  return (
    <div className="page-enter">
      <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />
      <div className="container-main py-8">
        <Suspense fallback={<ListingSkeleton />}>
          <ProductsClient categories={categories} maxPrice={maxPrice} searchParams={merged} />
        </Suspense>
      </div>
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div className="flex gap-8">
      <div className="hidden lg:block w-64 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-8 rounded-lg" />
        ))}
      </div>
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
