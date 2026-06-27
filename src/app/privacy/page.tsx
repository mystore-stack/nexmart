import type { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Politique de Confidentialité | NexMart",
    description: "Découvrez comment NexMart protège vos données personnelles conformément à la loi marocaine 09-08.",
    keywords: ["confidentialité", "données personnelles", "protection", "loi 09-08", "NexMart"],
    openGraph: {
      title: "Politique de Confidentialité",
      description: "Notre engagement envers la protection de vos données personnelles.",
      type: "website",
    },
  };
}

export default function PrivacyPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Politique de Confidentialité",
    description: "Politique de protection des données personnelles de NexMart",
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
                <span className="bg-gradient-to-r gradient-emerald">Politique de Confidentialité</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Notre engagement envers la protection de vos données personnelles
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
              <h2 className="font-display text-2xl font-semibold mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                NexMart s'engage à protéger votre vie privée et à sécuriser vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations conformément à la loi marocaine n°09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Données Collectées</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Nous collectons les données suivantes:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Informations de compte:</strong> Nom, prénom, email, mot de passe (chiffré), numéro de téléphone</li>
                <li><strong>Informations de livraison:</strong> Adresse complète, ville, code postal, instructions de livraison</li>
                <li><strong>Informations de paiement:</strong> Informations de carte bancaire (traitées via Stripe, jamais stockées)</li>
                <li><strong>Historique de commandes:</strong> Produits achetés, montants, dates de commande</li>
                <li><strong>Données de navigation:</strong> Adresse IP, type de navigateur, pages visitées (cookies)</li>
                <li><strong>Préférences:</strong> Liste de souhaits, favoris, préférences de communication</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Utilisation des Données</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Vos données sont utilisées pour:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Traiter et exécuter vos commandes</li>
                <li>Améliorer votre expérience utilisateur</li>
                <li>Vous envoyer des notifications sur vos commandes</li>
                <li>Personnaliser les recommandations de produits</li>
                <li>Sécuriser les transactions et prévenir la fraude</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Partage des Données</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Nous ne vendons pas vos données à des tiers. Nous pouvons partager vos données uniquement avec:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Prestataires de services:</strong> Transporteurs, services de paiement (Stripe), hébergeurs</li>
                <li><strong>Vendeurs partenaires:</strong> Pour l'exécution de vos commandes</li>
                <li><strong>Autorités légales:</strong> Lorsque la loi l'exige</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Sécurité des Données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Chiffrement SSL 256-bit pour toutes les transmissions</li>
                <li>Stockage sécurisé des mots de passe (bcrypt)</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Tests de sécurité réguliers</li>
                <li>Conformité PCI DSS pour les paiements</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Vos Droits</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Conformément à la loi 09-08, vous avez le droit de:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Accéder à vos données personnelles</li>
                <li>Demander la rectification de vos données inexactes</li>
                <li>Demander la suppression de vos données</li>
                <li>Vous opposer au traitement de vos données</li>
                <li>Demander la portabilité de vos données</li>
                <li>Retirer votre consentement à tout moment</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Pour exercer ces droits, contactez-nous à: <a href="mailto:dpo@nexmart.ma" className="text-emerald-600 hover:underline">dpo@nexmart.ma</a>
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur. Consultez notre politique de cookies pour plus d'informations.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Conservation des Données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vos données sont conservées uniquement aussi longtemps que nécessaire pour les finalités décrites dans cette politique. Les données de compte sont conservées pendant 5 ans après la dernière activité. Les données de commande sont conservées pendant 10 ans pour des raisons comptables et légales.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous réservons le droit de modifier cette politique de confidentialité. Les modifications seront publiées sur cette page avec la date de mise à jour. Nous vous informerons des modifications importantes par email.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez notre Délégué à la Protection des Données:
              </p>
              <div className="p-6 rounded-xl border border-border/50 bg-surface/50 mt-4">
                <p className="text-muted-foreground">Email: <a href="mailto:dpo@nexmart.ma" className="text-emerald-600 hover:underline">dpo@nexmart.ma</a></p>
                <p className="text-muted-foreground">Adresse: Casablanca, Maroc</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
