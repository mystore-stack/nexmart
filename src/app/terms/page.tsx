import type { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Conditions Générales | NexMart",
    description: "Lisez nos conditions générales de vente et d'utilisation pour comprendre vos droits et obligations sur NexMart.",
    keywords: ["conditions générales", "CGV", "conditions de vente", "contrat", "NexMart"],
    openGraph: {
      title: "Conditions Générales",
      description: "Conditions générales de vente et d'utilisation de NexMart.",
      type: "website",
    },
  };
}

export default function TermsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Conditions Générales",
    description: "Conditions générales de vente et d'utilisation de NexMart",
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
                <span className="bg-gradient-to-r gradient-emerald">Conditions Générales</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Conditions de vente et d'utilisation de NexMart
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
              <h2 className="font-display text-2xl font-semibold mb-4">1. Acceptation des Conditions</h2>
              <p className="text-muted-foreground leading-relaxed">
                En utilisant le site web NexMart et en effectuant des achats, vous acceptez les présentes conditions générales de vente (CGV). Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">2. Inscription et Compte</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Pour utiliser certains services, vous devez créer un compte:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Vous devez fournir des informations exactes et complètes</li>
                <li>Vous êtes responsable de la confidentialité de votre mot de passe</li>
                <li>Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte</li>
                <li>Vous ne pouvez pas créer de compte pour une autre personne sans son consentement</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">3. Produits et Prix</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Nos produits et prix:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Tous les prix sont indiqués en Dirhams Marocains (MAD) et incluent la TVA (20%)</li>
                <li>Nous nous réservons le droit de modifier les prix sans préavis</li>
                <li>Les prix affichés sont valides au moment de la commande</li>
                <li>Les photos des produits sont indicatives et peuvent varier légèrement</li>
                <li>La disponibilité des produits est indiquée sur chaque page produit</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">4. Commandes</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Processus de commande:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Une commande est considérée comme validée après confirmation de paiement</li>
                <li>Vous recevrez un email de confirmation avec les détails de votre commande</li>
                <li>Nous nous réservons le droit d'annuler une commande en cas de problème de stock ou de paiement</li>
                <li>Les commandes passées avant 14h sont expédiées le même jour (jours ouvrables)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">5. Paiement</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Moyens de paiement acceptés:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Carte bancaire (Visa, Mastercard) via Stripe sécurisé</li>
                <li>Paiement à la livraison en espèces (villes principales uniquement)</li>
                <li>Facilités de paiement en 3 ou 4 fois sans frais (commandes supérieures à 1000 MAD)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Toutes les transactions sont sécurisées via chiffrement SSL 256-bit. Vos informations de paiement ne sont jamais stockées sur nos serveurs.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">6. Livraison</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Conditions de livraison:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Délais de livraison: 1-6 jours ouvrables selon votre ville</li>
                <li>Livraison gratuite à partir de 500 MAD d'achat</li>
                <li>Frais de livraison: 39 MAD (villes principales) ou 59 MAD (autres zones)</li>
                <li>Transporteurs: Amana, Chrono Diali, Jibli</li>
                <li>Signature requise à la réception</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">7. Retours et Remboursements</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Politique de retour:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Délai de retour: 30 jours à compter de la réception</li>
                <li>Le produit doit être dans son état d'origine, non utilisé</li>
                <li>Les produits d'hygiène et alimentaires ne sont pas éligibles au retour</li>
                <li>Les frais de retour sont à notre charge en cas de produit défectueux</li>
                <li>Remboursement sous 5-7 jours ouvrables après réception du retour</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">8. Garantie</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tous les produits bénéficient de la garantie légale du vendeur conformément au Code de Commerce marocain. La durée de la garantie varie selon le type de produit et est indiquée sur chaque page produit.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">9. Propriété Intellectuelle</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tout le contenu du site NexMart (textes, images, logos, vidéos) est protégé par les droits d'auteur et ne peut être reproduit sans notre autorisation écrite préalable.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">10. Responsabilité</h2>
              <p className="text-muted-foreground leading-relaxed">
                NexMart ne peut être tenu responsable des dommages indirects résultant de l'utilisation de notre site. Notre responsabilité est limitée au montant de votre commande.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">11. Données Personnelles</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vos données personnelles sont traitées conformément à notre politique de confidentialité et à la loi marocaine n°09-08 sur la protection des données personnelles.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">12. Litiges</h2>
              <p className="text-muted-foreground leading-relaxed">
                En cas de litige, nous nous efforcerons de trouver une solution à l'amiable. À défaut, le litige sera soumis aux tribunaux compétents du Royaume du Maroc.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">13. Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions générales à tout moment. Les modifications entreront en vigueur dès leur publication sur le site.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">14. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant ces conditions générales, contactez-nous à: <a href="mailto:legal@nexmart.ma" className="text-emerald-600 hover:underline">legal@nexmart.ma</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
