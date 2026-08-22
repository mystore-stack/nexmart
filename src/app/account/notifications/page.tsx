"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ArrowLeft, Check } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/utils/format";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/notifications", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.notifications) setItems(d.data.notifications);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id], read: true }),
      credentials: "include",
    });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="container-main section max-w-2xl">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Mon compte
      </Link>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bell className="w-6 h-6" /> Notifications
      </h1>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description="Vous serez informé des commandes, promos et alertes stock."
          actionLabel="Voir les produits"
          actionHref="/products"
        />
      ) : (
        <ul className="space-y-3" role="list">
          {items.map((n) => (
            <li
              key={n.id}
              className={`p-4 rounded-xl border ${n.read ? "border-border bg-card" : "border-brand-300 bg-brand-50/50 dark:bg-brand-900/10"}`}
            >
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDateTime(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="btn-ghost p-2 shrink-0"
                    aria-label="Marquer comme lu"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
              {n.link && (
                <Link href={n.link} className="text-xs text-brand-600 hover:underline mt-2 inline-block">
                  Voir le détail →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
