"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditAddressPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/addresses")
      .then((r) => r.json())
      .then((d) => {
        const found = d.data?.find((a: { id: string }) => a.id === id);
        if (!found) router.replace("/account");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <div className="container-main section">Chargement...</div>;

  return (
    <div className="container-main section max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Adresse</h1>
      <p className="text-muted-foreground mb-6">
        La modification détaillée sera disponible prochainement. Vous pouvez en ajouter une nouvelle.
      </p>
      <Link href="/account/addresses/new?from=/account" className="btn-primary inline-block">
        Ajouter une adresse
      </Link>
    </div>
  );
}
