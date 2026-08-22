"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, BarChart2, Home } from "lucide-react";

const NAV = [
  { href: "/vendor", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Produits", icon: Package },
  { href: "/vendor/orders", label: "Commandes", icon: ShoppingCart },
  { href: "/vendor/analytics", label: "Analytiques", icon: BarChart2 },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <p className="font-bold">Espace vendeur</p>
          <p className="text-xs text-muted-foreground">NexMart MA</p>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                pathname === href ? "bg-foreground text-background font-medium" : "hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
            <Home className="w-4 h-4" /> Boutique
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
