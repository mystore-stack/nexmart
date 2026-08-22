// src/app/search/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResultsClient } from "@/components/product/SearchResultsClient";

interface Props {
  searchParams: { q?: string };
}

export function generateMetadata({ searchParams }: Props): Metadata {
  const q = searchParams.q || "";
  return {
title: q ? `Search results for ${q}` : "Search",
description: q ? `Browse results for ${q} on NexMart` : "Search NexMart",
  };
}

export default function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || "";

  return (
    <div className="page-enter">
      <div className="border-b border-border bg-surface">
        <div className="container-main py-6">
          {query ? (
            <>
              <h1 className="text-2xl font-bold">
Results for <span className="text-brand-500">{query}</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Showing all products matching your search
              </p>
            </>
          ) : (
            <h1 className="text-2xl font-bold">Search Products</h1>
          )}
        </div>
      </div>

      <div className="container-main py-8">
        <Suspense fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton aspect-square rounded-2xl" />
            ))}
          </div>
        }>
          <SearchResultsClient query={query} />
        </Suspense>
      </div>
    </div>
  );
}
