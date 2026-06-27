import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Commande Validée | Merci pour votre achat NexMart",
    description: "Votre commande a été validée avec succès. Recevez une confirmation par email et suivez votre livraison.",
    keywords: ["commande validée", "succès", "confirmation", "merci", "NexMart"],
    openGraph: {
      title: "Commande Validée",
      description: "Votre commande a été validée avec succès.",
      type: "website",
    },
  };
}

export default function OrderSuccessPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Commande Validée",
    description: "Page de confirmation de commande NexMart",
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="page-enter">
        <div className="border-b border-border relative overflow-hidden bg-gradient-to-b from-surface to-background">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-10" />
          <div className="container-main py-20 md:py-28">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight mb-6">
                <span className="bg-gradient-to-r gradient-emerald">Commande Validée!</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Merci pour votre achat sur NexMart
              </p>
            </div>
          </div>
        </div>

        <div className="container-main py-16">
          <div className="max-w-2xl mx-auto">
            <div className="p-8 rounded-2xl border border-border/50 bg-surface/50 mb-8">
              <h2 className="font-display text-2xl font-semibold mb-4">Ce qui se passe maintenant?</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Confirmation par email</h3>
                    <p className="text-sm text-muted-foreground">Vous recevrez un email de confirmation avec les détails de votre commande.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Préparation de la commande</h3>
                    <p className="text-sm text-muted-foreground">Notre équipe prépare votre commande pour l'expédition.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Expédition et livraison</h3>
                    <p className="text-sm text-muted-foreground">Vous recevrez un numéro de suivi pour suivre votre livraison en temps réel.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Link
                href="/orders"
                className="p-6 rounded-xl border border-border/50 bg-surface/50 hover:bg-surface/80 transition-colors text-center"
              >
                <svg className="w-8 h-8 mx-auto mb-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="font-semibold mb-1">Mes Commandes</h3>
                <p className="text-sm text-muted-foreground">Suivre mes commandes</p>
              </Link>
              <Link
                href="/products"
                className="p-6 rounded-xl border border-border/50 bg-surface/50 hover:bg-surface/80 transition-colors text-center"
              >
                <svg className="w-8 h-8 mx-auto mb-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="font-semibold mb-1">Continuer mes achats</h3>
                <p className="text-sm text-muted-foreground">Découvrir plus de produits</p>
              </Link>
            </div>

            <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center">
              <h3 className="font-semibold mb-2">Besoin d'aide?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Notre équipe de support client est disponible pour répondre à vos questions.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r gradient-emerald text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                Contacter le Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
