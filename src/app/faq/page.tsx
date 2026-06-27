import type { Metadata } from "next";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "FAQ | Questions Fréquentes NexMart",
    description: "Trouvez les réponses à vos questions sur NexMart: livraison, paiement, retours, commandes et plus.",
    keywords: ["FAQ", "questions fréquentes", "aide", "support", "NexMart"],
    openGraph: {
      title: "FAQ | Questions Fréquentes",
      description: "Trouvez rapidement les réponses à vos questions sur nos services.",
      type: "website",
    },
  };
}

const FAQ_CATEGORIES = [
  {
    category: "Commandes & Livraison",
    questions: [
      {
        q: "Quels sont les délais de livraison?",
        a: "Les délais de livraison varient entre 1 et 6 jours ouvrables selon votre ville et le transporteur (Amana, Chrono Diali, Jibli). Les commandes passées avant 14h sont expédiées le même jour.",
      },
      {
        q: "La livraison est-elle gratuite?",
        a: "Oui, la livraison est gratuite à partir de 500 MAD d'achat. En dessous de ce montant, les frais de livraison sont de 39 MAD pour les villes principales et 59 MAD pour les autres zones.",
      },
      {
        q: "Comment suivre ma commande?",
        a: "Vous pouvez suivre votre commande en utilisant votre numéro de commande (commençant par NX-) sur notre page de suivi de commande. Vous recevrez également des notifications par SMS et email à chaque étape.",
      },
      {
        q: "Puis-je modifier ma commande après validation?",
        a: "Les commandes peuvent être modifiées dans les 2 heures suivant leur validation, tant qu'elles n'ont pas été expédiées. Contactez notre service client rapidement pour toute modification.",
      },
    ],
  },
  {
    category: "Paiement",
    questions: [
      {
        q: "Quels moyens de paiement acceptez-vous?",
        a: "Nous acceptons les paiements par carte bancaire (Visa, Mastercard) via Stripe sécurisé, ainsi que le paiement à la livraison en espèces dans les villes principales.",
      },
      {
        q: "Mes informations de paiement sont-elles sécurisées?",
        a: "Absolument. Nous utilisons Stripe, un leader mondial des paiements sécurisés, avec chiffrement SSL 256-bit. Vos informations bancaires ne sont jamais stockées sur nos serveurs.",
      },
      {
        q: "Puis-je payer en plusieurs fois?",
        a: "Oui, nous proposons des facilités de paiement en 3 ou 4 fois sans frais pour les commandes supérieures à 1000 MAD, via nos partenaires bancaires.",
      },
    ],
  },
  {
    category: "Retours & Remboursements",
    questions: [
      {
        q: "Comment retourner un produit?",
        a: "Vous avez 30 jours pour retourner un produit. Connectez-vous à votre compte, sélectionnez la commande et cliquez sur 'Demander un retour'. Suivez les instructions pour imprimer l'étiquette de retour.",
      },
      {
        q: "Quels sont les conditions de retour?",
        a: "Le produit doit être dans son état d'origine, non utilisé, avec tous les accessoires et l'emballage d'origine. Certains produits (hygiène, alimentaire) ne sont pas éligibles au retour.",
      },
      {
        q: "Comment se passe le remboursement?",
        a: "Une fois votre retour reçu et vérifié, le remboursement est traité sous 5-7 jours ouvrables sur votre moyen de paiement initial. Vous recevrez une confirmation par email.",
      },
    ],
  },
  {
    category: "Compte & Sécurité",
    questions: [
      {
        q: "Comment créer un compte?",
        a: "Cliquez sur 'Connexion' puis 'Créer un compte'. Remplissez vos informations et confirmez votre email. Vous pourrez suivre vos commandes, gérer vos adresses et accéder aux offres exclusives.",
      },
      {
        q: "J'ai oublié mon mot de passe, que faire?",
        a: "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Entrez votre email et vous recevrez un lien pour réinitialiser votre mot de passe.",
      },
      {
        q: "Mes données personnelles sont-elles protégées?",
        a: "Oui, nous respectons strictement la protection de vos données personnelles conformément à la loi marocaine 09-08. Vos données ne sont jamais partagées avec des tiers sans votre consentement.",
      },
    ],
  },
  {
    category: "Produits",
    questions: [
      {
        q: "Les produits sont-ils authentiques?",
        a: "Absolument. Tous nos produits sont garantis 100% authentiques et proviennent directement des marques ou de distributeurs agréés. Nous travaillons uniquement avec des vendeurs vérifiés.",
      },
      {
        q: "Les prix incluent-ils la TVA?",
        a: "Oui, tous les prix affichés sur NexMart incluent la TVA (20%). Aucun frais supplémentaire ne sera ajouté au moment du paiement.",
      },
      {
        q: "Puis-je annuler une commande en cours?",
        a: "Oui, vous pouvez annuler votre commande tant qu'elle n'a pas été expédiée. Une fois expédiée, vous devrez suivre la procédure de retour standard.",
      },
    ],
  },
];

export default function FaqPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_CATEGORIES.flatMap((cat) =>
      cat.questions.map((q) => ({
        "@type": "Question",
        name: q.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.a,
        },
      }))
    ),
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
                <span className="bg-gradient-to-r gradient-emerald">Questions Fréquentes</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Trouvez rapidement les réponses à vos questions
              </p>
            </div>
          </div>
        </div>

        <div className="container-main py-16">
          <div className="max-w-4xl mx-auto">
            {FAQ_CATEGORIES.map((category, idx) => (
              <section key={idx} className="mb-12">
                <h2 className="font-display text-2xl font-semibold mb-6 gradient-emerald">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((item, qIdx) => (
                    <details
                      key={qIdx}
                      className="group border border-border/50 rounded-xl p-6 bg-surface/50 hover:bg-surface/80 transition-colors"
                    >
                      <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                        {item.q}
                        <svg
                          className="w-5 h-5 text-muted-foreground group-open:rotate-45 transition-transform flex-shrink-0 ml-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </summary>
                      <p className="text-muted-foreground mt-4 leading-relaxed">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            <section className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <h2 className="font-display text-2xl font-semibold mb-4">Besoin d'aide supplémentaire?</h2>
              <p className="text-muted-foreground mb-6">
                Notre équipe de support client est disponible 7j/7 pour répondre à toutes vos questions.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r gradient-emerald text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contactez-nous
                </a>
                <a
                  href="/help"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border font-semibold rounded-lg hover:bg-surface transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Centre d'aide
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
