"use client";

import Link from "next/link";
import { MarketingShell } from "@/components/admin/marketing/MarketingShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Target, Star, Zap, BarChart3, ArrowRight } from "lucide-react";

const MODULES = [
  { href: "/admin/marketing/advertisements", label: "Advertisements", icon: Megaphone, desc: "Create and schedule ads" },
  { href: "/admin/marketing/campaigns", label: "Campaigns", icon: Target, desc: "Seasonal promo campaigns" },
  { href: "/admin/marketing/sponsored-products", label: "Sponsored Products", icon: Star, desc: "Promote products with badges" },
  { href: "/admin/marketing/flash-deals", label: "Flash Deals", icon: Zap, desc: "Limited-time sales" },
  { href: "/admin/marketing/analytics", label: "Analytics", icon: BarChart3, desc: "Performance metrics" },
];

export default function MarketingOverviewPage() {
  return (
    <MarketingShell title="Marketing CMS" description="Advertisement & marketing management for NexMart.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-all hover:border-brand-700 hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700/10">
                  <Icon className="h-5 w-5 text-brand-700" />
                </div>
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                  Open <ArrowRight className="h-3 w-3" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </MarketingShell>
  );
}
