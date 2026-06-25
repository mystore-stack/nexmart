"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Megaphone,
  LayoutGrid,
  Target,
  Zap,
  Star,
  BarChart3,
  ChevronRight,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/marketing", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/admin/marketing/advertisements", label: "Advertisements", icon: Megaphone },
  { href: "/admin/marketing/campaigns", label: "Campaigns", icon: Target },
  { href: "/admin/marketing/sponsored-products", label: "Sponsored Products", icon: Star },
  { href: "/admin/marketing/flash-deals", label: "Flash Deals", icon: Zap },
  { href: "/admin/marketing/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/marketing/ad-platforms", label: "Ad Platforms", icon: Radio },
];

export function MarketingShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row gap-6">
      <aside className="w-full shrink-0 lg:w-56">
        <div className="rounded-xl border border-border bg-card/50 p-3">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Marketing CMS
          </p>
          <nav className="space-y-0.5">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-700 text-white shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                  {active && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
        {children}
      </div>
    </div>
  );
}
