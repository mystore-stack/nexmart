"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus, ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

type Address = {
  id: string;
  name: string;
  line1: string;
  city: string;
  isDefault: boolean;
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/addresses", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setAddresses(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-main section max-w-2xl">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Mon compte
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="w-6 h-6" /> Mes adresses
        </h1>
        <Link href="/account/addresses/new" className="btn-primary text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </Link>
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Aucune adresse"
          description="Ajoutez une adresse pour accélérer vos commandes."
          actionLabel="Ajouter une adresse"
          actionHref="/account/addresses/new"
        />
      ) : (
        <ul className="space-y-3">
          {addresses.map((a) => (
            <li key={a.id} className="p-4 border border-border rounded-xl bg-card flex justify-between items-start">
              <div>
                <p className="font-semibold">{a.name}</p>
                <p className="text-sm text-muted-foreground">{a.line1}</p>
                <p className="text-sm text-muted-foreground">{a.city}</p>
                {a.isDefault && (
                  <span className="inline-block mt-2 text-xs font-medium text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded">
                    Par défaut
                  </span>
                )}
              </div>
              <Link href={`/account/addresses/${a.id}`} className="text-sm text-muted-foreground hover:underline">
                Modifier
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
