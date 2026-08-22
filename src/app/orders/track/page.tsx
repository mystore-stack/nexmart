"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PackageSearch, ArrowLeft } from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (trimmed) router.push(`/orders/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="container-main section max-w-lg">
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Mes commandes
      </Link>
      <div className="bg-card border border-border rounded-2xl p-8">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
          <PackageSearch className="w-6 h-6 text-brand-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Suivre une commande</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Entrez votre numéro de commande (ex. NX-20260525-ABC123).
        </p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Numéro de commande"
            className="input w-full"
            required
            aria-label="Numéro de commande"
          />
          <button type="submit" className="btn-primary w-full">
            Suivre
          </button>
        </form>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          <Link href="/login" className="hover:underline">Connectez-vous</Link> pour voir toutes vos commandes.
        </p>
      </div>
    </div>
  );
}
