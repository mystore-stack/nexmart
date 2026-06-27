import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Programme d'Affiliation | Gagnez avec NexMart",
    description: "Rejoignez le programme d'affiliation NexMart et gagnez des commissions en recommandant nos produits à votre audience.",
    keywords: ["affiliation", "programme affiliation", "commission", "recommandation", "NexMart"],
    openGraph: {
      title: "Programme d'Affiliation",
      description: "Gagnez des commissions en recommandant NexMart.",
      type: "website",
    },
  };
}

export default function AffiliatesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Programme d'Affiliation NexMart",
    description: "Programme d'affiliation et partenariat de NexMart",
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
                <span className="bg-gradient-to-r gradient-emerald">Programme d'Affiliation</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Gagnez des commissions en recommandant NexMart à votre audience
              </p>
            </div>
          </div>
        </div>

        <div className="container-main py-16">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Comment ça marche?</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Inscrivez-vous</h3>
                    <p className="text-sm text-muted-foreground">Créez votre compte affilié en quelques minutes.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Partagez vos liens</h3>
                    <p className="text-sm text-muted-foreground">Utilisez vos liens de tracking uniques sur vos réseaux.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Gagnez des commissions</h3>
                    <p className="text-sm text-muted-foreground">Recevez jusqu'à 10% de commission sur chaque vente.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Avantages du Programme</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Commission Attractive</h3>
                  <p className="text-sm text-muted-foreground">Jusqu'à 10% de commission sur chaque vente validée</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Cookies de 30 jours</h3>
                  <p className="text-sm text-muted-foreground">Gagnez des commissions même si le client achète plus tard</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Suivi en temps réel</h3>
                  <p className="text-sm text-muted-foreground">Tableau de bord complet pour suivre vos performances</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Paiements mensuels</h3>
                  <p className="text-sm text-muted-foreground">Recevez vos commissions chaque mois via virement</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Qui peut s'inscrire?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Notre programme est ouvert à:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Blogueurs et influenceurs marocains</li>
                <li>Propriétaires de sites web et forums</li>
                <li>Créateurs de contenu YouTube et TikTok</li>
                <li>Communautés sur les réseaux sociaux</li>
                <li>Toute personne avec une audience marocaine</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Commission Structure</h2>
              <div className="space-y-3">
                <div className="flex justify-between p-4 rounded-xl border border-border/50 bg-surface/50">
                  <span className="font-semibold">Catégorie Électronique</span>
                  <span className="text-emerald-600 font-semibold">8%</span>
                </div>
                <div className="flex justify-between p-4 rounded-xl border border-border/50 bg-surface/50">
                  <span className="font-semibold">Mode & Accessoires</span>
                  <span className="text-emerald-600 font-semibold">10%</span>
                </div>
                <div className="flex justify-between p-4 rounded-xl border border-border/50 bg-surface/50">
                  <span className="font-semibold">Maison & Décoration</span>
                  <span className="text-emerald-600 font-semibold">7%</span>
                </div>
                <div className="flex justify-between p-4 rounded-xl border border-border/50 bg-surface/50">
                  <span className="font-semibold">Autres catégories</span>
                  <span className="text-emerald-600 font-semibold">5%</span>
                </div>
              </div>
            </section>

            <section className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <h2 className="font-display text-2xl font-semibold mb-4">Prêt à commencer?</h2>
              <p className="text-muted-foreground mb-6">
                Rejoignez notre programme d'affiliation et commencez à gagner dès aujourd'hui!
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:affiliates@nexmart.ma?subject=Demande d'inscription programme affiliation"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r gradient-emerald text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Demander l'Inscription
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border font-semibold rounded-lg hover:bg-surface transition-colors"
                >
                  En savoir plus
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
