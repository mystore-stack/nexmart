import type { Metadata } from "next";
import { StaticPage } from "@/components/content/StaticPage";
import Link from "next/link";

export const metadata: Metadata = { title: "FAQ | NexMart MA" };

const FAQ = [
  { q: "Quels sont les délais de livraison ?", a: "Entre 1 et 6 jours ouvrés selon la ville et le transporteur (Amana, Chrono Diali, Jibli)." },
  { q: "La livraison est-elle gratuite ?", a: "Oui à partir de 500 MAD d'achat, selon les conditions affichées au checkout." },
  { q: "Quels moyens de paiement acceptez-vous ?", a: "Carte bancaire via Stripe et paiement à la livraison." },
  { q: "Comment retourner un produit ?", a: "Consultez notre politique de retour sous 14 jours sur la page Retours." },
  { q: "Comment suivre ma commande ?", a: "Utilisez la page Suivi de commande avec votre numéro NX-..." },
];

export default function FaqPage() {
  return (
    <StaticPage title="Questions fréquentes">
      <div className="space-y-6 not-prose">
        {FAQ.map((item) => (
          <details key={item.q} className="group border border-border rounded-xl p-4 bg-card">
            <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
              {item.q}
              <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-sm">
        Besoin d&apos;aide ? <Link href="/contact" className="text-brand-600 hover:underline">Contactez-nous</Link> ou visitez le{" "}
        <Link href="/help" className="text-brand-600 hover:underline">centre d&apos;aide</Link>.
      </p>
    </StaticPage>
  );
}
