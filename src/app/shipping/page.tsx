import type { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Politique de Livraison | NexMart",
    description: "Informations complètes sur la livraison au Maroc: délais, frais, transporteurs et suivi de commande.",
    keywords: ["livraison", "expédition", "transport", "délais", "NexMart"],
    openGraph: {
      title: "Politique de Livraison",
      description: "Tout savoir sur la livraison de vos commandes NexMart.",
      type: "website",
    },
  };
}

export default function ShippingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Politique de Livraison",
    description: "Politique de livraison et expédition de NexMart",
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
                <span className="bg-gradient-to-r gradient-emerald">Politique de Livraison</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Livraison rapide et sécurisée dans tout le Maroc
              </p>
            </div>
          </div>
        </div>

        <div className="container-main py-16">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Zones de Livraison</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Nous livrons dans tout le Royaume du Maroc:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Zone 1 - Villes Principales</h3>
                  <p className="text-sm text-muted-foreground">Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès, Oujda, Kénitra, Tétouan</p>
                  <p className="text-sm font-semibold mt-2">Délai: 1-2 jours</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Zone 2 - Villes Secondaires</h3>
                  <p className="text-sm text-muted-foreground">Safi, El Jadida, Beni Mellal, Settat, Khouribga, Mohammedia, Taza, Al Hoceïma</p>
                  <p className="text-sm font-semibold mt-2">Délai: 2-3 jours</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Zone 3 - Zones Rurales</h3>
                  <p className="text-sm text-muted-foreground">Villes et villages de province</p>
                  <p className="text-sm font-semibold mt-2">Délai: 3-5 jours</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Zone 4 - Zones Distantes</h3>
                  <p className="text-sm text-muted-foreground">Sahara et zones isolées</p>
                  <p className="text-sm font-semibold mt-2">Délai: 5-6 jours</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Transporteurs</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Nous travaillons avec les meilleurs transporteurs marocains:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Amana:</strong> Livraison rapide dans les grandes villes</li>
                <li><strong>Chrono Diali:</strong> Couverture nationale avec suivi en temps réel</li>
                <li><strong>Jibli:</strong> Livraison flexible et points relais</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Frais de Livraison</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                  <h3 className="font-semibold mb-2">Livraison Gratuite</h3>
                  <p className="text-muted-foreground">À partir de 500 MAD d'achat pour les zones 1 et 2</p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Frais Standards</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Zone 1: 39 MAD</li>
                    <li>Zone 2: 49 MAD</li>
                    <li>Zone 3: 59 MAD</li>
                    <li>Zone 4: 79 MAD</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Délais de Traitement</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Les délais de livraison s'ajoutent au temps de traitement de votre commande:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Commandes passées avant 14h: expédiées le même jour</li>
                <li>Commandes passées après 14h: expédiées le jour ouvrable suivant</li>
                <li>Weekends et jours fériés: expédition le premier jour ouvrable suivant</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Suivi de Commande</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Suivez votre commande en temps réel:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Vous recevrez un email avec votre numéro de suivi</li>
                <li>Notifications SMS à chaque étape (expédition, en transit, livré)</li>
                <li>Page de suivi de commande disponible 24h/24</li>
                <li>Communication directe avec le transporteur possible</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Réception de la Commande</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                À la livraison:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Signature requise pour confirmer la réception</li>
                <li>Vérifiez l'état du colis avant de signer</li>
                <li>En cas de colis endommagé, refusez la livraison et contactez-nous</li>
                <li>Le transporteur peut effectuer 2 tentatives de livraison</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Paiement à la Livraison</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Le paiement à la livraison est disponible dans les villes principales (Zone 1):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Accepté uniquement en espèces (MAD)</li>
                <li>Frais supplémentaires de 20 MAD</li>
                <li>Préparez le montant exact</li>
                <li>Le transporteur ne dispose pas de monnaie</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Livraison Internationale</h2>
              <p className="text-muted-foreground leading-relaxed">
                Actuellement, NexMart ne livre qu'au Maroc. Nous travaillons à étendre notre service de livraison à l'international. Abonnez-vous à notre newsletter pour être informé des nouvelles zones de livraison.
              </p>
            </section>

            <section className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <h2 className="font-display text-2xl font-semibold mb-4">Questions sur la Livraison?</h2>
              <p className="text-muted-foreground mb-4">
                Notre équipe de support client est disponible pour répondre à toutes vos questions sur la livraison.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r gradient-emerald text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                Contacter le Support
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
