import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Presse | Espace Média NexMart",
    description: "Espace presse de NexMart. Accédez à notre kit média, communiqués de presse et ressources pour les journalistes.",
    keywords: ["presse", "média", "communiqué", "journalistes", "NexMart"],
    openGraph: {
      title: "Presse | Espace Média",
      description: "Ressources et informations pour les journalistes et médias.",
      type: "website",
    },
  };
}

export default function PressPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Presse NexMart",
    description: "Espace presse et média de NexMart",
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
                <span className="bg-gradient-to-r gradient-emerald">Espace Presse</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Ressources et informations pour les journalistes et médias
              </p>
            </div>
          </div>
        </div>

        <div className="container-main py-16">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">À Propos de NexMart</h2>
              <p className="text-muted-foreground leading-relaxed">
                NexMart est la marketplace premium du Maroc, connectant les vendeurs marocains avec des clients exigeants grâce à l'intelligence artificielle et une expérience d'achat exceptionnelle. Fondée avec la vision de transformer l'expérience e-commerce au Maroc, NexMart s'engage à offrir des produits de qualité, une livraison rapide et un service client irréprochable.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Kit Média</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Notre kit média inclut:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Logo NexMart en haute résolution (PNG, SVG)</li>
                <li>Photos de produits et de l'équipe</li>
                <li>Charte graphique et guidelines de marque</li>
                <li>Biographie des fondateurs</li>
                <li>Chiffres clés et statistiques</li>
              </ul>
              <div className="mt-6">
                <a
                  href="mailto:press@nexmart.ma?subject=Demande de kit média"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r gradient-emerald text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Télécharger le Kit Média
                </a>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Contact Presse</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Pour toute demande d'interview, de commentaire ou d'information:
              </p>
              <div className="p-6 rounded-xl border border-border/50 bg-surface/50">
                <p className="text-muted-foreground mb-2">
                  <strong>Email:</strong> <a href="mailto:press@nexmart.ma" className="text-emerald-600 hover:underline">press@nexmart.ma</a>
                </p>
                <p className="text-muted-foreground mb-2">
                  <strong>Téléphone:</strong> +212 5XX XXX XXX
                </p>
                <p className="text-muted-foreground">
                  <strong>Adresse:</strong> Casablanca, Maroc
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Communiqués Récents</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <p className="text-sm text-muted-foreground mb-2">Janvier 2026</p>
                  <h3 className="font-semibold mb-2">NexMart lève 5M MAD pour accélérer son expansion</h3>
                  <p className="text-sm text-muted-foreground">NexMart annonce une levée de fonds de 5 millions de dirhams pour étendre sa présence dans tout le Maroc et développer de nouvelles fonctionnalités IA.</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <p className="text-sm text-muted-foreground mb-2">Décembre 2025</p>
                  <h3 className="font-semibold mb-2">NexMart atteint 500 vendeurs partenaires</h3>
                  <p className="text-sm text-muted-foreground">La marketplace NexMart franchit le cap des 500 vendeurs partenaires, confirmant sa position de leader sur le marché e-commerce marocain.</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <p className="text-sm text-muted-foreground mb-2">Novembre 2025</p>
                  <h3 className="font-semibold mb-2">Lancement du programme NexMart Prime</h3>
                  <p className="text-sm text-muted-foreground">NexMart lance son programme de fidélité Prime, offrant la livraison gratuite et des avantages exclusifs à ses membres.</p>
                </div>
              </div>
            </section>

            <section className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <h2 className="font-display text-2xl font-semibold mb-4">Besoin d'informations supplémentaires?</h2>
              <p className="text-muted-foreground mb-6">
                Notre équipe de communication est disponible pour répondre à toutes vos questions.
              </p>
              <a
                href="mailto:press@nexmart.ma"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r gradient-emerald text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contacter l'Équipe Presse
              </a>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
