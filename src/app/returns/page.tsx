import type { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Politique de Retour | NexMart",
    description: "Découvrez notre politique de retour et remboursement. 30 jours pour retourner vos produits sans frais.",
    keywords: ["retour", "remboursement", "échange", "satisfait ou remboursé", "NexMart"],
    openGraph: {
      title: "Politique de Retour",
      description: "Retournez vos produits facilement sous 30 jours.",
      type: "website",
    },
  };
}

export default function ReturnsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Politique de Retour",
    description: "Politique de retour et remboursement de NexMart",
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
                <span className="bg-gradient-to-r gradient-emerald">Politique de Retour</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Satisfait ou remboursé sous 30 jours
              </p>
            </div>
          </div>
        </div>

        <div className="container-main py-16">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Délai de Retour</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vous disposez de 30 jours à compter de la date de réception pour retourner un produit. Ce délai s'applique à tous les produits éligibles, sans condition de motivation.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Conditions de Retour</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Pour être éligible au retour, le produit doit:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Être dans son état d'origine, non utilisé</li>
                <li>Avoir tous ses accessoires et étiquettes</li>
                <li>Être dans son emballage d'origine intact</li>
                <li>Ne pas être un produit d'hygiène ou alimentaire</li>
                <li>Ne pas être un produit personnalisé ou gravé</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Produits Non Éligibles</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Certains produits ne peuvent être retournés pour des raisons d'hygiène ou de sécurité:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Produits d'hygiène personnelle (cosmétiques ouverts)</li>
                <li>Produits alimentaires et boissons</li>
                <li>Produits de santé et équipements médicaux</li>
                <li>Produits personnalisés ou gravés</li>
                <li>Logiciels et produits numériques téléchargés</li>
                <li>Produits d'occasion</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Comment Effectuer un Retour</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Processus de retour en 4 étapes simples:</p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>Connectez-vous à votre compte NexMart</li>
                <li>Sélectionnez la commande contenant le produit à retourner</li>
                <li>Cliquez sur "Demander un retour" et suivez les instructions</li>
                <li>Imprimez l'étiquette de retour et collez-la sur le colis</li>
              </ol>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Déposez votre colis chez notre partenaire transporteur. Vous recevrez une notification par email dès réception de votre retour.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Frais de Retour</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Les frais de retour sont gratuits dans les cas suivants:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Produit défectueux ou ne correspondant pas à la description</li>
                <li>Erreur de livraison (produit différent de celui commandé)</li>
                <li>Produit endommagé lors de la livraison</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Pour les retours motivés par un changement d'avis, les frais de retour sont à votre charge (39 MAD pour les villes principales, 59 MAD pour les autres zones).
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Remboursement</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Une fois votre retour reçu et vérifié:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Le remboursement est traité sous 5-7 jours ouvrables</li>
                <li>Le remboursement est effectué sur votre moyen de paiement initial</li>
                <li>Vous recevrez une confirmation par email</li>
                <li>Pour les paiements à la livraison, un virement bancaire sera effectué</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Échange</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vous pouvez également demander un échange pour un produit de même valeur ou supérieur, en payant la différence si nécessaire. Le processus d'échange suit les mêmes étapes que le retour.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Garantie Légale</h2>
              <p className="text-muted-foreground leading-relaxed">
                En plus de notre politique de retour de 30 jours, tous nos produits bénéficient de la garantie légale du vendeur conformément au Code de Commerce marocain. Cette garantie couvre les défauts de conformité et les vices cachés.
              </p>
            </section>

            <section className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <h2 className="font-display text-2xl font-semibold mb-4">Besoin d'aide?</h2>
              <p className="text-muted-foreground mb-4">
                Notre équipe de support client est disponible pour vous accompagner dans votre démarche de retour.
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
