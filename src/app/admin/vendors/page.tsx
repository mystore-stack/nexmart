"use client";

import { useEffect, useState } from "react";
import { Store, Users, Package } from "lucide-react";

type Org = {
  id: string;
  name: string;
  slug: string;
  User: { name: string; email: string };
  _count: { Product: number; Order: number; Membership: number };
};

export default function AdminVendorsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/organizations", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setOrgs(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendeurs & organisations</h1>
        <p className="text-sm text-muted-foreground">Gestion multi-tenant des boutiques</p>
      </div>
      {loading ? (
        <div className="skeleton h-48 rounded-2xl" />
      ) : (
        <div className="grid gap-4">
          {orgs.map((o) => (
            <div key={o.id} className="p-5 border border-border rounded-2xl bg-card flex flex-wrap gap-6 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{o.name}</p>
                  <p className="text-xs text-muted-foreground">/{o.slug} · {o.User.email}</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Package className="w-4 h-4" />{o._count.Product}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{o._count.Membership}</span>
                <span>{o._count.Order} commandes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
