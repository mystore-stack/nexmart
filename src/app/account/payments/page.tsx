"use client";

import Link from "next/link";
import { CreditCard, ArrowLeft, Shield } from "lucide-react";

export default function PaymentMethodsPage() {
  return (
    <div className="container-main section max-w-2xl">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Mon compte
      </Link>
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <CreditCard className="w-6 h-6" /> Moyens de paiement
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Paiement sécurisé via Stripe et paiement à la livraison au Maroc.
      </p>
      <div className="space-y-4">
        <div className="p-5 border border-border rounded-2xl bg-card flex items-start gap-4">
          <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs font-bold">VISA</div>
          <div>
            <p className="font-semibold">Carte bancaire (Stripe)</p>
            <p className="text-sm text-muted-foreground">Saisie sécurisée à chaque commande — aucune carte stockée localement.</p>
          </div>
        </div>
        <div className="p-5 border border-border rounded-2xl bg-card flex items-start gap-4">
          <Shield className="w-8 h-8 text-brand-500 shrink-0" />
          <div>
            <p className="font-semibold">Paiement à la livraison</p>
            <p className="text-sm text-muted-foreground">Disponible pour les commandes éligibles au Maroc.</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-8">
        L&apos;enregistrement de cartes (Stripe Customer) sera disponible dans une prochaine version.
      </p>
    </div>
  );
}
