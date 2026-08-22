// src/app/page.tsx — NexMart Moroccan Luxury Homepage
import { getHomePageData } from "@/lib/home-data";
import {
  getOrderedHomepageSections,
  renderHomepageSection,
} from "@/lib/homepage/registry";
import type { Metadata } from "next";

export const revalidate = 300;

// Force dynamic rendering to avoid database access during build time
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "NexMart Maroc — Marketplace Premium",
  description:
    "Découvrez la marketplace premium du Maroc — artisanat authentique, produits sélectionnés par IA, paiement à la livraison et livraison express partout au Maroc.",
};

export default async function HomePage() {
  const { categories, cms } = await getHomePageData();
  const orderedSections = getOrderedHomepageSections(cms.homeSections ?? []);

  return (
    <div className="page-enter space-y-4">
      {orderedSections.length > 0 ? (
        orderedSections.map((section) => (
          <div key={section.id ?? section.sectionKey}>
            {renderHomepageSection(
              {
                id: section.id,
                sectionKey: section.sectionKey,
                title: section.title,
                subtitle: section.subtitle,
                description: section.description,
                config: section.config ?? {},
                products: section.products, // Pass products from CMS data
                hideIfEmpty: section.hideIfEmpty,
              },
              {
                categories: categories as any,
                cms,
              }
            )}
          </div>
        ))
      ) : (
        <div className="container-main py-8 text-center">
          <p className="text-muted-foreground">No homepage sections configured. Please configure sections in the CMS.</p>
        </div>
      )}
    </div>
  );
}
