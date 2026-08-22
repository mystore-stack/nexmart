"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingCart, TrendingUp, Clock } from "lucide-react";
import { formatPrice } from "@/utils/format";

export default function VendorDashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0,
    orgName: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/overview", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStats({
            products: d.stats.products,
            orders: d.stats.orders,
            revenue: d.stats.revenue,
            pendingOrders: d.stats.pendingOrders,
            orgName: d.organization.name,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Produits", value: stats.products, icon: Package },
    { label: "Commandes", value: stats.orders, icon: ShoppingCart },
    { label: "Revenus", value: formatPrice(stats.revenue), icon: TrendingUp },
    { label: "En attente", value: stats.pendingOrders, icon: Clock },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{loading ? "…" : stats.orgName}</h1>
        <p className="text-muted-foreground text-sm">Tableau de bord vendeur</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="p-5 bg-card border border-border rounded-2xl">
            <c.icon className="w-5 h-5 text-brand-500 mb-2" />
            <p className="text-2xl font-bold">{loading ? "—" : c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/vendor/products" className="btn-primary">Gérer les produits</Link>
        <Link href="/vendor/orders" className="btn-outline">Voir les commandes</Link>
        <Link href="/admin/products" className="btn-ghost text-sm">Admin complet →</Link>
      </div>
    </div>
  );
}
