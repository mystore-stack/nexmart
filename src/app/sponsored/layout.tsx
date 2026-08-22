import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produits Sponsorisés | NexMart Maroc",
  description: "Découvrez la sélection exclusive de produits sponsorisés et recommandés par nos marques partenaires et vendeurs certifiés.",
  keywords: "produits sponsorisés, sponsored, recommandations, NexMart Maroc, shopping, marques",
};

export default function SponsoredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
