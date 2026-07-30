import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meilleures Ventes | NexMart Maroc",
  description: "Découvrez les produits les plus vendus et les mieux notés par nos clients au Maroc. Top ventes, favoris et recommandations.",
  keywords: "meilleures ventes, bestsellers, top ventes, NexMart Maroc, shopping, recommandations",
};

export default function BestSellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
