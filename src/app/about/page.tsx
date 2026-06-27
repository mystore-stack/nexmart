import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  const organization = await prisma.organization.findFirst();
  
  return {
    title: "À Propos de NexMart | Notre Histoire et Mission",
    description: "Découvrez NexMart, la marketplace premium du Maroc. Notre mission est de connecter les vendeurs marocains avec des clients exigeants grâce à l'IA et une expérience d'achat exceptionnelle.",
    keywords: ["NexMart", "marketplace Maroc", "e-commerce", "shopping en ligne", "à propos"],
    openGraph: {
      title: "À Propos de NexMart | Notre Histoire",
      description: "Découvrez l'histoire et la mission de NexMart, la marketplace premium du Maroc.",
      type: "website",
    },
  };
}

export default async function AboutPage() {
  const organization = await prisma.organization.findFirst({
    select: {
      name: true,
    },
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: organization?.name || "NexMart",
    description: "Marketplace premium du Maroc",
    url: "https://nexmart.ma/about",
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
                <span className="bg-gradient-to-r gradient-emerald">À Propos de NexMart</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                La marketplace premium qui réinvente le shopping en ligne au Maroc
              </p>
            </div>
          </div>
        </div>

        <div className="container-main py-16">
          <div className="max-w-4xl mx-auto space-y-16">
            <section>
              <h2 className="font-display text-3xl font-semibold mb-6">Notre Histoire</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  Fondée avec la vision de transformer l'expérience e-commerce au Maroc, NexMart est née de la conviction que les consommateurs marocains méritent une plateforme de shopping en ligne qui allie qualité, confiance et innovation technologique.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Depuis nos débuts, nous nous sommes engagés à créer un écosystème commercial qui met en valeur les meilleurs produits du Maroc et du monde entier, tout en offrant une expérience utilisateur fluide et sécurisée.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-3xl font-semibold mb-6">Notre Mission</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  Notre mission est de devenir la plateforme de référence pour le shopping premium au Maroc, en connectant les vendeurs de qualité avec des clients exigeants grâce à l'intelligence artificielle et une expérience d'achat exceptionnelle.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 rounded-xl border border-border/50 bg-surface/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r gradient-emerald flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Qualité Garantie</h3>
                  <p className="text-sm text-muted-foreground">Sélection rigoureuse des vendeurs et produits</p>
                </div>
                <div className="p-6 rounded-xl border border-border/50 bg-surface/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r gradient-emerald flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Innovation IA</h3>
                  <p className="text-sm text-muted-foreground">Recommandations personnalisées intelligentes</p>
                </div>
                <div className="p-6 rounded-xl border border-border/50 bg-surface/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r gradient-emerald flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Sécurité Totale</h3>
                  <p className="text-sm text-muted-foreground">Paiements sécurisés et protection des données</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-3xl font-semibold mb-6">Nos Valeurs</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Excellence</h3>
                    <p className="text-muted-foreground">Nous visons l'excellence dans chaque aspect de notre service, de la sélection des produits à l'expérience client.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Confiance</h3>
                    <p className="text-muted-foreground">La confiance est la base de notre relation avec nos clients et nos partenaires vendeurs.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Innovation</h3>
                    <p className="text-muted-foreground">Nous utilisons les dernières technologies, notamment l'IA, pour améliorer continuellement notre plateforme.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Engagement Local</h3>
                    <p className="text-muted-foreground">Nous sommes fiers de soutenir l'économie marocaine en mettant en valeur les vendeurs locaux.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-3xl font-semibold mb-6">Nos Chiffres</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-6 rounded-xl border border-border/50 bg-surface/50">
                  <div className="text-3xl font-bold gradient-emerald mb-2">10K+</div>
                  <div className="text-sm text-muted-foreground">Produits</div>
                </div>
                <div className="text-center p-6 rounded-xl border border-border/50 bg-surface/50">
                  <div className="text-3xl font-bold gradient-emerald mb-2">500+</div>
                  <div className="text-sm text-muted-foreground">Vendeurs</div>
                </div>
                <div className="text-center p-6 rounded-xl border border-border/50 bg-surface/50">
                  <div className="text-3xl font-bold gradient-emerald mb-2">50K+</div>
                  <div className="text-sm text-muted-foreground">Clients</div>
                </div>
                <div className="text-center p-6 rounded-xl border border-border/50 bg-surface/50">
                  <div className="text-3xl font-bold gradient-emerald mb-2">48</div>
                  <div className="text-sm text-muted-foreground">Villes Livrées</div>
                </div>
              </div>
            </section>

            <section className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <h2 className="font-display text-2xl font-semibold mb-4">Rejoignez Notre Équipe</h2>
              <p className="text-muted-foreground mb-6">
                Nous sommes toujours à la recherche de talents passionnés pour nous aider à construire l'avenir du e-commerce au Maroc.
              </p>
              <a
                href="/careers"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r gradient-emerald text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                Voir les Postes Ouverts
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
