"use client";
import React from "react";
import { Truck, RotateCcw, ShieldCheck, Headphones, Wallet } from "lucide-react";

const services = [
  { icon: Truck, title: "Livraison rapide", description: "Partout au Maroc" },
  { icon: Wallet, title: "Paiement à la livraison", description: "Payez à la réception" },
  { icon: RotateCcw, title: "Retour facile", description: "Sous 7 jours" },
  { icon: ShieldCheck, title: "Produits authentiques", description: "Garantie officielle" },
  { icon: Headphones, title: "Support 24/7", description: "Service client réactif" },
];

export function ServiceBannersSection({ banners = [] }: { banners?: any[] }) {
  const displayServices = banners.length > 0 ? banners : services;
  return (
    <section className="my-8 md:my-12">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {displayServices.map(({ icon: Icon, title, description, iconName }: any) => {
          // In a real app we'd map string names to lucide icons.
          // For now we'll just use Truck as fallback if Icon isn't passed directly.
          const DynamicIcon = Icon || Truck;
          return (
          <div
            key={title}
            className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition hover:shadow-md hover:border-slate-200"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-800">
              <DynamicIcon className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-900">{title}</p>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}

