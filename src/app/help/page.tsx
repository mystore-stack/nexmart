import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Centre d'Aide | NexMart",
    description: "Trouvez des réponses à vos questions, des guides d'utilisation et du support pour tous vos besoins sur NexMart.",
    keywords: ["aide", "support", "centre d'aide", "assistance", "NexMart"],
    openGraph: {
      title: "Centre d'Aide",
      description: "Support et assistance pour tous vos besoins.",
      type: "website",
    },
  };
}

export default function HelpPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Centre d'Aide",
    description: "Centre d'aide et support client de NexMart",
  };

  const helpCategories = [
    {
      title: "Commandes & Livraison",
      icon: "📦",
      links: [
        { href: "/shipping", label: "Politique de livraison" },
        { href: "/track-order", label: "Suivre ma commande" },
        { href: "/faq", label: "Délais de livraison" },
      ],
    },
    {
      title: "Retours & Remboursements",
      icon: "↩️",
      links: [
        { href: "/returns", label: "Politique de retour" },
        { href: "/faq", label: "Comment retourner" },
        { href: "/faq", label: "Remboursement" },
      ],
    },
    {
      title: "Compte & Sécurité",
      icon: "🔐",
      links: [
        { href: "/account", label: "Gérer mon compte" },
        { href: "/faq", label: "Mot de passe oublié" },
        { href: "/privacy", label: "Confidentialité" },
      ],
    },
    {
      title: "Paiement",
      icon: "💳",
      links: [
        { href: "/faq", label: "Moyens de paiement" },
        { href: "/faq", label: "Paiement en plusieurs fois" },
        { href: "/terms", label: "Conditions de vente" },
      ],
    },
    {
      title: "Produits",
      icon: "🛍️",
      links: [
        { href: "/products", label: "Trouver un produit" },
        { href: "/categories", label: "Parcourir les catégories" },
        { href: "/brands", label: "Marques disponibles" },
      ],
    },
    {
      title: "Contact",
      icon: "📞",
      links: [
        { href: "/contact", label: "Nous contacter" },
        { href: "/faq", label: "Questions fréquentes" },
      ],
    },
  ];

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="page-enter">
        <div className="border-b border-border relative overflow-hidden bg-gradient-to-b from-surface to-background">
          <div className="absolute inset-0 moroccan-zellige-bg opacity-10" />
          <div className="container-main py-20 md:py-28">
            <div className="max-w-4xl">
              <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight mb-6">
                <span className="bg-gradient-to-r gradient-emerald">Centre d'Aide</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Trouvez rapidement les réponses à vos questions
              </p>
            </div>
          </div>
        </div>

        <div className="container-main py-16">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Rechercher dans l'aide..."
                  className="w-full px-6 py-4 rounded-xl border border-border bg-surface/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
                />
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {helpCategories.map((category, idx) => (
                <div key={idx} className="p-6 rounded-xl border border-border/50 bg-surface/50 hover:bg-surface/80 transition-colors">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="font-display text-xl font-semibold mb-4">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link
                          href={link.href}
                          className="text-muted-foreground hover:text-emerald-600 transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <section className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-12">
              <h2 className="font-display text-2xl font-semibold mb-4">Besoin d'aide personnalisée?</h2>
              <p className="text-muted-foreground mb-6">
                Notre équipe de support client est disponible 7j/7 pour vous aider avec toutes vos questions.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r gradient-emerald text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contacter le Support
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border font-semibold rounded-lg hover:bg-surface transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Voir la FAQ
                </Link>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-6">Guides Rapides</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/products" className="p-4 rounded-xl border border-border/50 bg-surface/50 hover:bg-surface/80 transition-colors flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Comment passer commande</h3>
                    <p className="text-sm text-muted-foreground">Guide étape par étape</p>
                  </div>
                </Link>
                <Link href="/account" className="p-4 rounded-xl border border-border/50 bg-surface/50 hover:bg-surface/80 transition-colors flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Créer un compte</h3>
                    <p className="text-sm text-muted-foreground">Inscription rapide</p>
                  </div>
                </Link>
                <Link href="/returns" className="p-4 rounded-xl border border-border/50 bg-surface/50 hover:bg-surface/80 transition-colors flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Retourner un produit</h3>
                    <p className="text-sm text-muted-foreground">Processus de retour</p>
                  </div>
                </Link>
                <Link href="/track-order" className="p-4 rounded-xl border border-border/50 bg-surface/50 hover:bg-surface/80 transition-colors flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Suivre ma commande</h3>
                    <p className="text-sm text-muted-foreground">Tracking en temps réel</p>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
