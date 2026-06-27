import type { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Comparer les Produits | NexMart",
    description: "Comparez les caractéristiques, les prix et les avis de plusieurs produits pour faire le meilleur choix d'achat.",
    keywords: ["comparer", "comparaison", "produits", "choisir", "NexMart"],
    openGraph: {
      title: "Comparer les Produits",
      description: "Comparez les caractéristiques et prix des produits.",
      type: "website",
    },
  };
}

export default function ComparePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Comparer les Produits",
    description: "Page de comparaison de produits NexMart",
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="page-enter">
        <div className="border-b border-border relative overflow-hidden bg-gradient-to-b from-surface to-background">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-10" />
          <div className="container-main py-20 md:py-28">
            <div className="max-w-4xl">
              <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight mb-6">
                <span className="bg-gradient-to-r gradient-emerald">Comparer les Produits</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Comparez les caractéristiques pour faire le meilleur choix
              </p>
            </div>
          </div>
        </div>

        <div className="container-main py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-semibold mb-4">Aucun produit à comparer</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Ajoutez des produits à votre liste de comparaison en cliquant sur le bouton "Comparer" sur les pages produit.
              </p>
              <a
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r gradient-emerald text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                Parcourir les Produits
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            <div className="mt-12 p-6 rounded-xl border border-border/50 bg-surface/50">
              <h3 className="font-semibold mb-4">Comment comparer des produits?</h3>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>Parcourez notre catalogue et trouvez les produits qui vous intéressent</li>
                <li>Cliquez sur le bouton "Ajouter à la comparaison" sur chaque produit</li>
                <li>Accédez à cette page pour voir toutes les caractéristiques côte à côte</li>
                <li>Faites votre choix en fonction des prix, spécifications et avis clients</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
