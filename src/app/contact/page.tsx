import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Contactez-Nous | Support Client NexMart",
    description: "Besoin d'aide? Contactez notre équipe de support client NexMart. Nous sommes là pour répondre à toutes vos questions.",
    keywords: ["contact", "support", "aide", "service client", "NexMart"],
    openGraph: {
      title: "Contactez-Nous | Support Client",
      description: "Contactez notre équipe de support pour toute question ou assistance.",
      type: "website",
    },
  };
}

export default async function ContactPage() {
  const organization = await prisma.organization.findFirst({
    select: {
      name: true,
    },
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contactez NexMart",
    description: "Page de contact et support client",
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
                <span className="bg-gradient-to-r gradient-emerald">Contactez-Nous</span>
              </h1>
              <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed">
                Notre équipe de support est là pour vous aider 7j/7
              </p>
            </div>
          </div>
        </div>

        <div className="container-main py-16">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 rounded-xl border border-border/50 bg-surface/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r gradient-emerald flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground">support@nexmart.ma</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Réponse sous 24h</p>
              </div>

              <div className="p-6 rounded-xl border border-border/50 bg-surface/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r gradient-emerald flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Téléphone</h3>
                <p className="text-muted-foreground">+212 5XX XXX XXX</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Lun-Ven: 9h-18h</p>
              </div>

              <div className="p-6 rounded-xl border border-border/50 bg-surface/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r gradient-emerald flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Adresse</h3>
                <p className="text-muted-foreground">Casablanca, Maroc</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Visites sur rendez-vous</p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="p-8 rounded-2xl border border-border/50 bg-surface/50">
                <h2 className="font-display text-2xl font-semibold mb-6">Envoyez-nous un message</h2>
                <form suppressHydrationWarning className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Nom complet</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Sujet</label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="order">Question sur une commande</option>
                      <option value="product">Question sur un produit</option>
                      <option value="payment">Problème de paiement</option>
                      <option value="return">Demande de retour</option>
                      <option value="account">Problème de compte</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      placeholder="Décrivez votre problème ou question..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-gradient-to-r gradient-emerald text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                  >
                    Envoyer le message
                  </button>
                </form>
              </div>

              <div className="mt-8 p-6 rounded-xl border border-border/50 bg-surface/50">
                <h3 className="font-semibold mb-4">FAQ Rapide</h3>
                <div className="space-y-3">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer font-medium">
                      Comment suivre ma commande?
                      <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Utilisez la page de suivi de commande avec votre numéro de commande.
                    </p>
                  </details>
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer font-medium">
                      Quels sont les délais de livraison?
                      <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground">
                      La livraison standard prend 2-5 jours ouvrables selon votre ville.
                    </p>
                  </details>
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer font-medium">
                      Comment retourner un produit?
                      <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Vous avez 30 jours pour retourner un produit. Consultez notre politique de retour.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
