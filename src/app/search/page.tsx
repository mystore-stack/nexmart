import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResultsClient } from "@/components/product/SearchResultsClient";
import { MobileSearchView } from "@/components/mobile/MobileSearchView";
import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import type { Product } from "@/types";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q || "";
  return {
    title: query ? `Recherche: ${query} | NexMart Maroc` : "Rechercher des produits | NexMart Maroc",
    description: query ? `Résultats de recherche pour ${query} sur NexMart` : "Rechercher sur NexMart Maroc",
  };
}

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q || "";
  const organizationId = await getDefaultOrganizationId();

  let products: any[] = [];
  if (query.trim()) {
    products = await prisma.product.findMany({
      where: {
        organizationId,
        published: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { has: query.toLowerCase() } },
        ],
      },
      include: { category: true, variants: true },
      take: 24,
    });
  }

  return (
    <>
      {/* Mobile View */}
      <div className="sm:hidden">
        <MobileSearchView initialQuery={query} products={products as unknown as Product[]} />
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block page-enter">
        <div className="border-b border-border bg-surface">
          <div className="container-main py-6">
            {query ? (
              <>
                <h1 className="text-2xl font-bold">
                  Résultats pour <span className="text-emerald-600">"{query}"</span>
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Affichage des produits correspondants
                </p>
              </>
            ) : (
              <h1 className="text-2xl font-bold">Rechercher des Produits</h1>
            )}
          </div>
        </div>

        <div className="container-main py-8">
          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-square rounded-2xl" />
                ))}
              </div>
            }
          >
            <SearchResultsClient query={query} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
