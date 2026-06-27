import type { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Politique de Cookies | NexMart",
    description: "Découvrez comment NexMart utilise les cookies pour améliorer votre expérience utilisateur et protéger vos données.",
    keywords: ["cookies", "politique de cookies", "confidentialité", "tracking", "NexMart"],
    openGraph: {
      title: "Politique de Cookies",
      description: "Comment nous utilisons les cookies sur NexMart.",
      type: "website",
    },
  };
}

export default function CookiesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Politique de Cookies",
    description: "Politique d'utilisation des cookies de NexMart",
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
                <span className="bg-gradient-to-r gradient-emerald">Politique de Cookies</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Comment nous utilisons les cookies pour améliorer votre expérience
              </p>
            </div>
          </div>
        </div>

        <div className="container-main py-16">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <p className="text-muted-foreground leading-relaxed">
              Dernière mise à jour: Janvier 2026
            </p>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Qu'est-ce qu'un Cookie?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, mobile) lorsque vous visitez notre site. Les cookies nous permettent de reconnaître votre appareil et mémoriser vos préférences pour améliorer votre expérience de navigation.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Types de Cookies Utilisés</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Cookies Essentiels</h3>
                  <p className="text-muted-foreground text-sm">
                    Nécessaires au fonctionnement du site: authentification, panier, sécurité. Ces cookies ne peuvent être désactivés.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Cookies de Performance</h3>
                  <p className="text-muted-foreground text-sm">
                    Nous aident à comprendre comment vous utilisez le site pour améliorer les performances et l'expérience utilisateur.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Cookies de Fonctionnalité</h3>
                  <p className="text-muted-foreground text-sm">
                    Mémorisent vos préférences: langue, devise, paramètres d'affichage, produits récemment consultés.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-surface/50">
                  <h3 className="font-semibold mb-2">Cookies de Marketing</h3>
                  <p className="text-muted-foreground text-sm">
                    Utilisés pour vous proposer des publicités personnalisées et mesurer l'efficacité de nos campagnes marketing.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Cookies Tiers</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Nous utilisons des services tiers qui peuvent placer leurs propres cookies:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Google Analytics:</strong> Analyse du trafic et comportement des utilisateurs</li>
                <li><strong>Google Tag Manager:</strong> Gestion des balises de tracking</li>
                <li><strong>Stripe:</strong> Traitement sécurisé des paiements</li>
                <li><strong>Cloudinary:</strong> Optimisation et livraison des images</li>
                <li><strong>Réseaux sociaux:</strong> Boutons de partage et widgets sociaux</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Gestion des Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Vous pouvez contrôler et gérer les cookies de plusieurs manières:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Via la bannières cookies lors de votre première visite</li>
                <li>En modifiant les paramètres de votre navigateur</li>
                <li>En utilisant les outils de blocage de cookies tiers</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Notez que la désactivation de certains cookies peut affecter le fonctionnement du site et limiter certaines fonctionnalités.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Durée de Conservation</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Les cookies sont conservés pour différentes durées:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Cookies de session:</strong> Supprimés à la fermeture du navigateur</li>
                <li><strong>Cookies persistants:</strong> Conservés entre 30 jours et 2 ans selon leur fonction</li>
                <li><strong>Cookies de consentement:</strong> Conservés 12 mois</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Vos Droits</h2>
              <p className="text-muted-foreground leading-relaxed">
                Conformément au RGPD et à la loi marocaine 09-08, vous avez le droit de:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Accepter ou refuser les cookies (exceptés les essentiels)</li>
                <li>Retirer votre consentement à tout moment</li>
                <li>Accéder aux informations stockées via les cookies</li>
                <li>Demander la suppression de vos données personnelles</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Mises à Jour</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous pouvons mettre à jour cette politique de cookies pour refléter les changements dans nos pratiques ou pour des raisons réglementaires. Les modifications seront publiées sur cette page avec la date de mise à jour.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant notre utilisation des cookies, contactez-nous à: <a href="mailto:dpo@nexmart.ma" className="text-emerald-600 hover:underline">dpo@nexmart.ma</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
